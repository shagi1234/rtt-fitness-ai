import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
  ActivityIndicator,
  FlatList,
} from "react-native";
import Card from "../../components/Card";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import api, { Program, Exercise, AvailableContentResponse, Workout } from "@/lib/api";
import { router } from "expo-router";
import ProgramsSlider from "@/components/ProgramsSlider";
import { defaultCardioIcon } from "@/lib/icon";
import { GradientWrapper } from "@/components/GradientWrapper";
import { SvgXml } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";


const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Определяем компонент Tag локально, вместо импорта из ProgramsSlider
const ExerciseTag = ({ label, icon }: { label: string; icon?: string }) => (
  <View style={styles.tag}>
    {icon && <SvgXml xml={icon} width={14} height={14} />}
    <Text style={styles.tagText}>{label}</Text>
  </View>
);

const WorkoutsCard = ({ workout }: { workout: Workout }) => (
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
    onPress={() =>
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


const SectionHeader = ({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <GradientWrapper
      // colors={["#00A87E", "#00E087"]}
      style={styles.viewAllButton}
      onPress={onPress}
    >
      <Text style={styles.viewAllButtonText}>View all</Text>
    </GradientWrapper>
  </View>
);

export default function WorkoutsScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AvailableContentResponse | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);

  const fetchWorkoutsData = async () => {
    try {
      setLoading(true);
      const response = await api.content.getAvailableContent();
      setData(response);

      if (response && response.plans) {
        setPrograms(response.plans);
      }

      setError(null);

    } catch (err) {
      console.error("Error fetching workouts data:", err);
      setError("Failed to load workouts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutsData();
  }, []);

  const handleRetry = () => {
    fetchWorkoutsData();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#06E28A" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Available Programs Section */}
          <SectionHeader
            title="Available programs"
            onPress={() => router.push("/available-programs")}
          />

          {/* Programs Slider */}
          <View style={styles.featuredProgramContainer}>
            <ProgramsSlider
              programs={programs}
              isLoading={false}
              error={null}
              onRetry={handleRetry}
            />
          </View>

          {/* Available Workouts Section */}
          <SectionHeader
            title="Available workouts"
            onPress={() => router.push("/available-workouts")}
          />
          <View style={styles.exercisesGrid}>
            {data?.workouts && data.workouts.length > 0 ? (
              <FlatList
                data={data.workouts}
                renderItem={({ item }) => <WorkoutsCard workout={item} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.exercisesListContainer}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              />
            ) : (
              <Text style={styles.noDataText}>No exercises available</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(246, 246, 246)",
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 28,
    letterSpacing: 0,
    color: "#1A1A1A",
  },
  viewAllButton: {
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  viewAllButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  featuredProgramContainer: {
    marginBottom: 20,
  },

  exercisesGrid: {
    marginBottom: 24,
  },
  
  exercisesListContainer: {
    paddingHorizontal: 16,
  },
  exercisesLoadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  exercisesErrorContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  exerciseCard: {
    width: 200,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
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
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  exerciseTagContainer: {
    flexDirection: "row",
  },
  // Стили для тега
  tag: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 12,
    letterSpacing: 0,
    color: "#000000",
  },
  noDataText: {
    fontSize: 16,
    color: "#666666",
    padding: 20,
  },
  retryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 16,
    textAlign: "center",
  },
});
