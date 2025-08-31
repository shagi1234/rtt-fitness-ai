import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Card from "../components/Card";
import {
  ChevronLeft,
  Filter,
  ChevronUp,
  ChevronDown,
  Check,
} from "lucide-react-native";
import { apiClient } from "@/lib/api/client";
import { Exercise, Workout } from "@/lib/api/types";
import { SvgXml } from "react-native-svg";
import { cardioIcon, strengthIcon } from "@/lib/icon";
import { GradientWrapper } from "@/components/GradientWrapper";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";

// Интерфейс для ответа API
interface WorkoutsResponse {
  workouts: Workout[];
}

// Интерфейс для параметров фильтрации
interface FilterParams {
  body_part?: string;
  dif_level?: string;
}

const WorkoutCard = ({ workout }: { workout: Workout }) => (
  <Card 
    id={workout.title}
    title={workout.title}
    imageUrl={workout.workout_desc_img}
    type="workout"
    stats={{
      duration: `${workout.total_minutes} min`,
      level: workout.dif_level,
      calories: workout.calories,
    }}
    showStartButton={true}
    onPress={() =>{
      console.log(" available workout.workout_id ejjen blat", workout.workout_id);
      console.log(" available workout.id ejjen blat", workout.id);
      
      router.push({
        pathname: "/(workout)/start",
        params: {
          title: workout.title.toLowerCase().trim(),
          integration_type: "workout",
          exit_url: "/(tabs)",
          id: workout.id,
          plan: "1",
        },
      })        
    }
    }
    onStartPress={() =>
      router.push({
        pathname: "/(workout)/start",
        params: {
          title: workout.title.toLowerCase().trim(),
          integration_type: "workout",
          exit_url: "/(tabs)",
          id: workout.id,
          plan: "1",
        },
      })
    }
  />
);

// Компонент выбора опции с чекбоксом или радиокнопкой
const FilterOption = React.memo(
  ({
    label,
    selected,
    onSelect,
    isRadio = false,
  }: {
    label: string;
    selected: boolean;
    onSelect: () => void;
    isRadio?: boolean;
  }) => (
    <TouchableOpacity style={styles.filterOption} onPress={onSelect}>
      <Text style={styles.filterOptionText}>{label}</Text>
      <View
        style={[
          isRadio ? styles.radioButton : styles.checkbox,
          selected &&
            (isRadio ? styles.radioButtonSelected : styles.checkboxSelected),
        ]}
      >
        {selected &&
          (isRadio ? (
            <View style={styles.radioInner} />
          ) : (
            <Check size={16} color="#FFFFFF" />
          ))}
      </View>
    </TouchableOpacity>
  )
);

// Компонент группы фильтров
const FilterGroup = React.memo(
  ({
    title,
    options,
    selectedOptions,
    onSelect,
    isExpanded,
    toggleExpand,
    isRadioGroup = false,
  }: {
    title: string;
    options: string[];
    selectedOptions: string[];
    onSelect: (option: string) => void;
    isExpanded: boolean;
    toggleExpand: () => void;
    isRadioGroup?: boolean;
  }) => (
    <View style={styles.filterGroup}>
      <TouchableOpacity style={styles.filterGroupHeader} onPress={toggleExpand}>
        <Text style={styles.filterGroupTitle}>{title}</Text>
        {isExpanded ? (
          <ChevronUp size={24} color="#000" />
        ) : (
          <ChevronDown size={24} color="#000" />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.filterOptions}>
          {options.map((option) => (
            <FilterOption
              key={option}
              label={option}
              selected={selectedOptions.includes(option)}
              onSelect={() => onSelect(option)}
              isRadio={isRadioGroup}
            />
          ))}
        </View>
      )}
    </View>
  )
);

// Данные для фильтров
const BODY_PART_OPTIONS = [
  "Shoulders",
  "Chest",
  "Arms",
  "Back",
  "Abs",
  "Glutes",
  "Legs",
];

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

// Маппинг названий на значения для API
const DIFFICULTY_LEVEL_MAP: Record<string, string> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};

export default function AvailableWorkoutsScreen() {
  const [workouts, setExercises] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterParams, setFilterParams] = useState<FilterParams>({});
  const [selectedFilters, setSelectedFilters] = useState({
    bodyParts: [] as string[],
    difficultyLevel: [] as string[],
  });
  const [expandedGroups, setExpandedGroups] = useState({
    bodyParts: true,
    difficultyLevel: true,
  });

  // Функция для переключения состояния группы фильтров
  const toggleFilterGroup = useCallback(
    (group: "bodyParts" | "difficultyLevel") => {
      setExpandedGroups((prev) => ({
        ...prev,
        [group]: !prev[group],
      }));
    },
    []
  );

  // Функция для выбора опции фильтра
  const toggleFilterOption = useCallback(
    (group: "bodyParts" | "difficultyLevel", option: string) => {
      setSelectedFilters((prev) => {
        // Для difficultyLevel - выбираем только один элемент
        if (group === "difficultyLevel") {
          // Если элемент уже выбран, снимаем выбор
          if (prev[group].includes(option)) {
            return {
              ...prev,
              [group]: [],
            };
          }
          // Иначе выбираем только этот элемент
          return {
            ...prev,
            [group]: [option],
          };
        }
        // Для bodyParts - можно выбрать несколько элементов
        else {
          const currentOptions = [...prev[group]];
          const index = currentOptions.indexOf(option);

          if (index >= 0) {
            currentOptions.splice(index, 1);
          } else {
            currentOptions.push(option);
          }

          return {
            ...prev,
            [group]: currentOptions,
          };
        }
      });
    },
    []
  );

  // Функция для загрузки упражнений
  const fetchWorkouts = useCallback(async (params: FilterParams = {}) => {
    try {
      setLoading(true);
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined)
      ) as Record<string, string>;

      const response = await apiClient.get<WorkoutsResponse>(
        "/api/users/workouts",
        filteredParams
      );
      
      if (response.data && response.data.workouts) {
        setExercises(response.data.workouts);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch exercises:", err);
      setError("Failed to load exercises");
    } finally {
      setLoading(false);
    }
  }, []);

  // Функция для применения фильтров
  const applyFilters = useCallback(() => {
    const newFilterParams: FilterParams = {};

    if (selectedFilters.difficultyLevel.length > 0) {
      const diffLevel =
        DIFFICULTY_LEVEL_MAP[selectedFilters.difficultyLevel[0]];
      if (diffLevel) newFilterParams.dif_level = diffLevel;
    }

    if (selectedFilters.bodyParts.length > 0) {
      newFilterParams.body_part = selectedFilters.bodyParts.join(",");
    }

    setFilterParams(newFilterParams);
    setFilterVisible(false);
    fetchWorkouts(newFilterParams);
  }, [selectedFilters, fetchWorkouts]);

  // Функция для сброса фильтров
  const resetFilters = useCallback(() => {
    setSelectedFilters({
      bodyParts: [],
      difficultyLevel: [],
    });
  }, []);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  // Рендер кнопки фильтра для хедера
  const renderFilterButton = () => (
    <TouchableOpacity
      style={styles.filterButton}
      onPress={() => setFilterVisible(true)}
    >
      <Filter size={24} color="#00A87E" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={Platform.OS === "ios" ? ["top"] : []}
    >
      {/* Header компонент вместо встроенного хедера */}
      <Header showBack={true} rightContent={renderFilterButton()} />

      {/* Title */}
      <Text style={styles.pageTitle}>Available workouts</Text>

      {/* Exercises List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A87E" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchWorkouts(filterParams)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : workouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No exercises found</Text>
          <TouchableOpacity
            style={styles.resetFiltersButton}
            onPress={() => {
              resetFilters();
              fetchWorkouts();
            }}
          >
            <Text style={styles.resetFiltersText}>Reset filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={workouts}
          renderItem={({ item }) => <WorkoutCard workout={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.exercisesList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          initialNumToRender={4}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.filterModalContainer}>
          <View style={styles.filterModalHeader}>
            <GradientWrapper
              colors={["#00A87E", "#00E087"]}
              style={styles.filterHeaderButton}
              onPress={resetFilters}
            >
              <Text style={styles.filterHeaderButtonText}>Reset</Text>
            </GradientWrapper>

            <Text style={styles.filterModalTitle}>
              Filter{" "}
              {selectedFilters.bodyParts.length +
                selectedFilters.difficultyLevel.length >
              0
                ? `(${
                    selectedFilters.bodyParts.length +
                    selectedFilters.difficultyLevel.length
                  })`
                : ""}
            </Text>

            <GradientWrapper
              colors={["#00A87E", "#00E087"]}
              style={styles.filterHeaderButton}
              onPress={applyFilters}
            >
              <Text style={styles.filterHeaderButtonText}>Done</Text>
            </GradientWrapper>
          </View>

          <ScrollView style={styles.filterModalContent}>
            <FilterGroup
              title="Difficulty Level"
              options={DIFFICULTY_OPTIONS}
              selectedOptions={selectedFilters.difficultyLevel}
              onSelect={(option) =>
                toggleFilterOption("difficultyLevel", option)
              }
              isExpanded={expandedGroups.difficultyLevel}
              toggleExpand={() => toggleFilterGroup("difficultyLevel")}
              isRadioGroup={true}
            />

            <View style={styles.divider} />

            <FilterGroup
              title="Body Parts"
              options={BODY_PART_OPTIONS}
              selectedOptions={selectedFilters.bodyParts}
              onSelect={(option) => toggleFilterOption("bodyParts", option)}
              isExpanded={expandedGroups.bodyParts}
              toggleExpand={() => toggleFilterGroup("bodyParts")}
              isRadioGroup={false}
            />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  filterButton: {
    padding: 8,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  exercisesList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  exerciseCard: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#E5E5E5",
  },
  exerciseImage: {
    width: "100%",
    height: "100%",
  },
  exerciseGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: "flex-end",
  },
  exerciseTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  exerciseTags: {
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  separator: {
    height: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#00A87E",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    color: "#666666",
    textAlign: "center",
    marginBottom: 16,
  },
  resetFiltersButton: {
    backgroundColor: "#00A87E",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  resetFiltersText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Стили для модального окна фильтров
  filterModalContainer: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  filterModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
  },
  filterHeaderButton: {
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  filterHeaderButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  filterModalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterGroup: {
    marginVertical: 8,
  },
  filterGroupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  filterGroupTitle: {
    fontSize: 24,
    fontWeight: "600",
  },
  filterOptions: {
    marginTop: 8,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  filterOptionText: {
    fontSize: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#00A87E",
    borderColor: "#00A87E",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: "#00A87E",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#00A87E",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 8,
  },
});
