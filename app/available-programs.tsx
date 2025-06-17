import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import {
  ChevronLeft,
  Filter,
  ChevronUp,
  ChevronDown,
  Check,
} from "lucide-react-native";
import { GradientWrapper } from "@/components/GradientWrapper";
import api from "@/lib/api";
import { Program as ApiProgram, FilterParams } from "@/lib/api/types";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "@/components/Card";
import Header from "@/components/Header";

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
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const GOAL_OPTIONS = [
  "Maintain health",
  "Lose weight",
  "Build muscle",
  "Increase endurance",
];
const MUSCLE_GROUP_OPTIONS = [
  "Arm",
  "Shoulder",
  "Chest",
  "Abs",
  "Leg",
  "Full Body",
];

// Маппинг названий на ID для API
const LEVEL_ID_MAP: Record<string, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

const GOAL_ID_MAP: Record<string, number> = {
  "Maintain health": 1,
  "Lose weight": 2,
  "Build muscle": 3,
  "Increase endurance": 4,
};

export default function AvailableProgramsScreen() {
  const [programs, setPrograms] = useState<ApiProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterParams, setFilterParams] = useState<FilterParams>({});
  const [selectedFilters, setSelectedFilters] = useState({
    levels: [] as string[],
    goals: [] as string[],
    muscleGroups: [] as string[],
  });
  const [expandedGroups, setExpandedGroups] = useState({
    level: true,
    goal: true,
    muscleGroup: true,
  });

  // Функция для переключения состояния группы фильтров
  const toggleFilterGroup = useCallback(
    (group: "level" | "goal" | "muscleGroup") => {
      setExpandedGroups((prev) => ({
        ...prev,
        [group]: !prev[group],
      }));
    },
    []
  );

  // Функция для выбора опции фильтра
  const toggleFilterOption = useCallback(
    (group: "levels" | "goals" | "muscleGroups", option: string) => {
      setSelectedFilters((prev) => {
        if (group === "levels" || group === "goals") {
          if (prev[group].includes(option)) {
            return {
              ...prev,
              [group]: [],
            };
          }
          return {
            ...prev,
            [group]: [option],
          };
        } else {
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

  // Функция для загрузки программ
  const fetchPrograms = useCallback(async (params: FilterParams = {}) => {
    try {
      setLoading(true);
      const response = await api.content.filterPrograms(params);
      if (response && response.plans) {
        setPrograms(response.plans);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch programs:", err);
      setError("Failed to load programs");
    } finally {
      setLoading(false);
    }
  }, []);

  // Функция для применения фильтров
  const applyFilters = useCallback(() => {
    const newFilterParams: FilterParams = {};

    if (selectedFilters.levels.length > 0) {
      const levelId = LEVEL_ID_MAP[selectedFilters.levels[0]];
      if (levelId) newFilterParams.level_id = levelId;
    }

    if (selectedFilters.goals.length > 0) {
      const goalId = GOAL_ID_MAP[selectedFilters.goals[0]];
      if (goalId) newFilterParams.goal_id = goalId;
    }

    if (selectedFilters.muscleGroups.length > 0) {
      newFilterParams.muscle_groups = selectedFilters.muscleGroups.join(",");
    }

    setFilterParams(newFilterParams);
    setFilterVisible(false);
    fetchPrograms(newFilterParams);
  }, [selectedFilters, fetchPrograms]);

  // Функция для сброса фильтров
  const resetFilters = useCallback(() => {
    setSelectedFilters({
      levels: [],
      goals: [],
      muscleGroups: [],
    });
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

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
      <Text style={styles.pageTitle}>Available programs</Text>

      {/* Programs List или состояние загрузки/ошибки */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A87E" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchPrograms(filterParams)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : programs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No programs found</Text>
          <TouchableOpacity
            style={styles.resetFiltersButton}
            onPress={() => {
              resetFilters();
              fetchPrograms();
            }}
          >
            <Text style={styles.resetFiltersText}>Reset filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={programs}
          renderItem={({ item }) => (
            <Card
              id={item.id}
              title={item.title}
              imageUrl={item.img_url}
              type="plan"
              tags={[{ label: "Strength" }, { label: "Cardio" }]}
              stats={{
                duration: item.weeks ? `${item.weeks} weeks` : "3 weeks",
                bodyFocus: "Full body",
                calories: item.calories || 1200,
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.programsList}
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
              {selectedFilters.levels.length +
                selectedFilters.goals.length +
                selectedFilters.muscleGroups.length >
              0
                ? `(${
                    selectedFilters.levels.length +
                    selectedFilters.goals.length +
                    selectedFilters.muscleGroups.length
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
              title="Level"
              options={LEVEL_OPTIONS}
              selectedOptions={selectedFilters.levels}
              onSelect={(option) => toggleFilterOption("levels", option)}
              isExpanded={expandedGroups.level}
              toggleExpand={() => toggleFilterGroup("level")}
              isRadioGroup={true}
            />

            <View style={styles.divider} />

            <FilterGroup
              title="Goal"
              options={GOAL_OPTIONS}
              selectedOptions={selectedFilters.goals}
              onSelect={(option) => toggleFilterOption("goals", option)}
              isExpanded={expandedGroups.goal}
              toggleExpand={() => toggleFilterGroup("goal")}
              isRadioGroup={true}
            />

            <View style={styles.divider} />

            <FilterGroup
              title="Muscle group"
              options={MUSCLE_GROUP_OPTIONS}
              selectedOptions={selectedFilters.muscleGroups}
              onSelect={(option) => toggleFilterOption("muscleGroups", option)}
              isExpanded={expandedGroups.muscleGroup}
              toggleExpand={() => toggleFilterGroup("muscleGroup")}
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
  programsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#00A87E",
    borderColor: "#00A87E",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 8,
  },
  // Стили для радиокнопок
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
});
