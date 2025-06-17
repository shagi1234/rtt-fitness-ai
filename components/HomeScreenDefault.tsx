import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Program } from "@/lib/api/types";
import { GradientWrapper } from "./GradientWrapper";
import ProgramsSlider from "./ProgramsSlider";
import { SetupProgramCard } from "./SetupProgramCard";
import { colors } from "@/constants/сolors";
import { authService } from "@/lib/api/services/authService";

interface HomeScreenDefaultProps {
  programs: Program[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

interface TestWorkoutData {
  completed: boolean;
  lastWorkoutDate?: string;
  totalTimeSpent?: number;
  totalCalories?: number;
}

interface WorkoutData {
  id: string;
  body_img: string;
  calories: string;
  title: string;
  total_minutes: number;
  type: string;
  dif_level: string;
  description: string;
  body_parts: string[];
}

export const HomeScreenDefault: React.FC<HomeScreenDefaultProps> = ({
  programs,
  isLoading,
  error,
  onRetry,
}) => {
  const [testWorkoutData, setTestWorkoutData] = useState<TestWorkoutData>({
    completed: false,
  });
  const [isTestWorkoutLoading, setIsTestWorkoutLoading] = useState(false);
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null);
  const [isLoadingTestWorkoutData, setIsLoadingTestWorkoutData] =
    useState(true);

  useEffect(() => {
    const loadTestWorkoutData = async () => {
      try {
        // Получаем данные о завершении тестовой тренировки из AsyncStorage
        const storedData = await AsyncStorage.getItem("test_workout_data");

        if (storedData) {
          // Если данные существуют, парсим их и обновляем состояние
          const parsedData = JSON.parse(storedData) as TestWorkoutData;
          setTestWorkoutData(parsedData);
          console.log("[HomeScreen] Test workout data loaded:", parsedData);
        } else {
          // Если данных нет, используем дефолтное значение
          setTestWorkoutData({ completed: false });
          console.log("[HomeScreen] No test workout data found");
        }
      } catch (error) {
        console.error("[HomeScreen] Error loading test workout data:", error);
        // В случае ошибки считаем, что тренировка не завершена
        setTestWorkoutData({ completed: false });
      } finally {
        setIsLoadingTestWorkoutData(false);
      }
    };

    loadTestWorkoutData();
  }, []);

  useEffect(() => {
    const loadTestWorkout = async () => {
      try {
        // Получаем сохраненные goal_id и level_id
        const [goalId, levelId] = await Promise.all([
          AsyncStorage.getItem("user_goal_id"),
          AsyncStorage.getItem("user_level_id"),
        ]);

        // Получаем тестовую тренировку
        const response = await authService.getTestWorkout({
          goal_id: Number(goalId) || 1,
          level_id: Number(levelId) || 1,
        });

        if (response.workouts.length > 0) {
          setWorkoutData(response.workouts[0]);
        }
      } catch (error) {
        console.error("[HomeScreen] Error loading test workout:", error);
      }
    };

    loadTestWorkout();
  }, []);

  const handleStartTestWorkout = async () => {
    try {
      setIsTestWorkoutLoading(true);

      // Получаем сохраненные goal_id и level_id
      const [goalId, levelId] = await Promise.all([
        AsyncStorage.getItem("user_goal_id"),
        AsyncStorage.getItem("user_level_id"),
      ]);

      if (!goalId || !levelId) {
        Alert.alert("Error", "Missing workout preferences");
        return;
      }

      // Получаем тестовую тренировку
      const response = await authService.getTestWorkout({
        goal_id: Number(goalId),
        level_id: Number(levelId),
      });

      if (response.workouts.length > 0) {
        router.push({
          pathname: "/(workout)/start",
          params: {
            title: response.workouts[0].title.trim().toLowerCase(),
            exit_url: "/(tabs)",
            goal_id: goalId,
            level_id: levelId,
            type: "test",
          },
        });
      } else {
        Alert.alert(
          "No Workouts Available",
          "Sorry, no workouts found for your preferences."
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to load workout. Please check your internet connection and try again."
      );
    } finally {
      setIsTestWorkoutLoading(false);
    }
  };
  // console.log("[HomeScreen] Workout data:", workoutData);

  // Функция для сохранения данных о тестовой тренировке
  const saveTestWorkoutData = async (data: TestWorkoutData) => {
    try {
      await AsyncStorage.setItem("test_workout_data", JSON.stringify(data));
      setTestWorkoutData(data);
      console.log("[HomeScreen] Test workout data saved:", data);
    } catch (error) {
      console.error("[HomeScreen] Error saving test workout data:", error);
    }
  };

  return (
    <>
      <View style={styles.headerSection}>
        <Text style={styles.sectionTitle}>Available programs</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push("/available-programs")}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.featuredProgramContainer}>
        <ProgramsSlider
          programs={programs}
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
        />
      </View>

      <SetupProgramCard />

      <View style={styles.bottomContainer}>
        {!isLoadingTestWorkoutData &&
          !testWorkoutData.completed &&
          workoutData && (
            <View style={styles.testWorkoutSection}>
              <Text style={styles.sectionTitleDark}>Test workout</Text>
              <Pressable
                style={styles.workoutCard}
                disabled={isTestWorkoutLoading}
              >
                <ImageBackground
                  source={{ uri: workoutData.body_img }}
                  style={styles.workoutImage}
                  imageStyle={styles.workoutImageStyle}
                >
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutTitle}>{workoutData.title}</Text>
                    <View style={styles.workoutMeta}>
                      <Text style={styles.workoutMetaText}>
                        {workoutData.total_minutes} min
                      </Text>
                      <View style={styles.metaSeparator} />
                      <Text style={styles.workoutMetaText}>
                        {workoutData.dif_level}
                      </Text>
                      <View style={styles.metaSeparator} />
                      <Text style={styles.workoutMetaText}>
                        {workoutData.calories} kcal
                      </Text>
                    </View>
                  </View>

                  <GradientWrapper
                    style={[
                      styles.startButton,
                      isTestWorkoutLoading && styles.buttonDisabled,
                    ]}
                    onPress={handleStartTestWorkout}
                  >
                    <Text style={styles.startButtonText}>
                      {isTestWorkoutLoading ? "Loading..." : "Start"}
                    </Text>
                  </GradientWrapper>
                </ImageBackground>
              </Pressable>
            </View>
          )}

        {/* Для отладки - можно удалить в производственном коде */}
        {/* <TouchableOpacity 
          style={styles.debugButton}
          onPress={() => saveTestWorkoutData({ completed: !testWorkoutData.completed })}
        >
          <Text style={styles.debugButtonText}>
            Toggle Test Workout Status (Debug)
          </Text>
        </TouchableOpacity> */}

        <View style={styles.feedbackSection}>
          <View style={styles.feedbackContent}>
            <Text style={styles.feedbackTitle}>Help us get better</Text>
            <Text style={styles.feedbackDescription}>
              Leave a review or suggestion for the app
            </Text>
            <GradientWrapper
              style={styles.reviewButton}
              onPress={() => router.push("/profile/feedback")}
            >
              <Text style={styles.reviewButtonText}>Leave a review</Text>
            </GradientWrapper>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
    color: "#FFFFFF",
  },
  sectionTitleDark: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
    color: "#000000",
    marginBottom: 16,
  },
  viewAllButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  viewAllText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 14,
    letterSpacing: 0,
  },
  featuredProgramContainer: {
    // marginBottom: 20,
  },
  bottomContainer: {
    backgroundColor: "rgb(246, 246, 246)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
    minHeight: "100%",
  },
  testWorkoutSection: {
    marginBottom: 16,
  },
  testWorkoutContainer: {
    backgroundColor: "rgb(246, 246, 246)",
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  workoutCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 8,
  },
  workoutImage: {
    width: "100%",
    height: 200,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  workoutImageStyle: {
    borderRadius: 16,
    resizeMode: "cover",
  },
  workoutInfo: {
    padding: 16,
    flex: 1,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  workoutMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  workoutMetaText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 14,
    letterSpacing: 0,
  },
  metaSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 8,
  },
  startButton: {
    backgroundColor: "#00A87E",
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 16,
    margin: 16,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0,
  },
  feedbackSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    backdropFilter: "blur(6px)",
    marginBottom: 8,
    overflow: "hidden",
  },
  feedbackContent: {
    padding: 16,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
    color: "#000000",
    marginBottom: 8,
  },
  feedbackDescription: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
    letterSpacing: 0,
    color: "#333333",
    marginBottom: 12,
  },
  reviewButton: {
    backgroundColor: "#00A87E",
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 16,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  reviewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  debugButton: {
    backgroundColor: "#E5E5E5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: "center",
  },
  debugButtonText: {
    fontSize: 14,
    color: "#333333",
  },
});

export default HomeScreenDefault;
