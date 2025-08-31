import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  Alert,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/сolors";
import { Button } from "@/components/Button";
import { GoalData } from "./quiz/goal";
import { LevelData } from "./quiz/level";
import { authService } from "@/lib/api/services/authService";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Ключ для хранения параметров теста
const TEST_WORKOUT_PARAMS_KEY = "test_workout_params";

export default function TestWorkout() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Используем useRef для отслеживания, был ли уже выполнен эффект
  const initialLoad = useRef(true);

  // Начальные значения
  const [selectedData, setSelectedData] = useState({
    goal: {
      index: 0,
      type: "" as GoalData["type"],
      label: "",
    },
    level: {
      index: 0,
      type: "" as LevelData["type"],
      label: "",
    },
  });

  // Эффект для загрузки данных выполняется только один раз при монтировании
  useEffect(() => {
    const loadData = async () => {
      if (!initialLoad.current) return;
      initialLoad.current = false;

      try {
        // Проверяем наличие параметров
        if (
          params.goalIndex &&
          params.goalType &&
          params.goalLabel &&
          params.levelIndex &&
          params.levelType &&
          params.levelLabel
        ) {
          // Используем параметры из URL
          const newData = {
            goal: {
              index: Number(params.goalIndex),
              type: params.goalType as GoalData["type"],
              label: params.goalLabel as string,
            },
            level: {
              index: Number(params.levelIndex),
              type: params.levelType as LevelData["type"],
              label: params.levelLabel as string,
            },
          };

          // Сохраняем в AsyncStorage и в state
          await AsyncStorage.setItem(
            TEST_WORKOUT_PARAMS_KEY,
            JSON.stringify(newData)
          );
          setSelectedData(newData);
        } else {
          // Пытаемся загрузить из AsyncStorage
          const savedData = await AsyncStorage.getItem(TEST_WORKOUT_PARAMS_KEY);

          if (savedData) {
            setSelectedData(JSON.parse(savedData));
          } else {
            // Если данных нет, перенаправляем на страницу goal
            router.replace("/(auth)/quiz/goal");
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        router.replace("/(auth)/quiz/goal");
      }
    };

    loadData();
  }, []); // Пустой массив зависимостей - эффект выполняется только при монтировании

  const handleStart = async () => {
    try {
      setIsLoading(true);
      const goalId = selectedData.goal.index + 1;
      const levelId = selectedData.level.index + 1;

      const response = await authService.getTestWorkout({
        goal_id: goalId,
        level_id: levelId,
      });

      if (response.workouts.length > 0) {
        const workout = response.workouts[0];

        router.push({
          pathname: "/(workout)/start",
          params: {
            title: workout.title.toLowerCase().trim(),
            exit_url: "/(auth)/test-workout",
            completed_url: "/(auth)/auth",
            goal_id: goalId.toString(),
            level_id: levelId.toString(),
            type: "test",
            integration_type: "workout",
            id: workout.workout_id,
          },
        });
      } else {
        Alert.alert(
          "No Workouts Available",
          "Sorry, no workouts found for your selected preferences."
        );
      }
    } catch (error) {
      console.error("Error loading test workout:", error);
      Alert.alert(
        "Error",
        "Failed to load workout. Please check your internet connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const gradientColors = {
    overlay: ["rgba(0,0,0,0.1)", "rgba(0,0,0,0.7)"] as const,
    button: [colors.primary, colors.primaryLight] as const,
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={Platform.OS === "ios" ? ["top"] : []}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Image
        source={require("../../assets/images/intro.png")}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      <LinearGradient colors={gradientColors.overlay} style={styles.overlay} />

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Based on your previous responses, we've prepared a trial workout for
            you.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleStart}
            title="Start workout"
            loading={isLoading}
          />
          <TouchableOpacity
            style={styles.laterButton}
            onPress={() =>
              router.replace({
                pathname: "/(auth)/auth",
                params: {
                  goal_id: selectedData.goal.index + 1,
                  level_id: selectedData.level.index + 1,
                },
              })
            }
          >
            <Text style={styles.laterButtonText}>Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  backgroundImage: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  textContainer: {
    marginTop: SCREEN_HEIGHT * 0.4,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 22,
    letterSpacing: 0,
    textAlign: "center",
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: Platform.OS === "ios" ? 34 : 24,
  },
  laterButton: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(218, 222, 233, 0.15)",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  laterButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 22,
    letterSpacing: 0,
  },
  overlay: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
