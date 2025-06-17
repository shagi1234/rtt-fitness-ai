import React from "react";
import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Alert,
  Platform,
  Pressable,
  Text,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import KinestexSDK from "kinestex-sdk-react-native";
import {
  IntegrationOption,
  IPostData,
  KinesteXSDKCamera,
} from "kinestex-sdk-react-native/src/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userService } from "@/lib/api/services/userService";
import api from "@/lib/api";
import { contentService } from "@/lib/api/services/contentService";
import { SafeAreaView } from "react-native-safe-area-context";
import { Tabs } from "expo-router";
import { SvgXml } from "react-native-svg";
import {
  inactiveHomeIcon,
  activeHomeIcon,
  inactiveWorkoutsIcon,
  activeWorkoutsIcon,
  inactiveAnalyticsIcon,
  activeAnalyticsIcon,
  inactiveProfileIcon,
  activeProfileIcon,
} from "@/lib/icon";
import { useCameraPermissions } from "expo-camera";
import CameraPermission from "@/components/CameraPermission";

export default function WorkoutStart() {
  const params = useLocalSearchParams();
  const kinestexSDKRef = useRef<KinesteXSDKCamera>(null);
  const [postData, setPostData] = useState<IPostData>({
    key: "d2f3b5fcfaca9d1e8a86064654060e45",
    userId: "default_user_id",
    company: "Ready to Fight",
    customParameters: {
      //   style: "light", // dark or light theme (customizable in the admin dashboard)
      videoURL:
        "https://cdn.kinestex.com/uploads%2F2047b732-0206-4bb9-9e15-e92fddaabefb_jz73VFlUyZ9nyd64OjRb.mp4?alt=media&token=3135ff52-3014-43b2-938e-024c280f92e5",
    },
  });
  const [showTabBar, setShowTabBar] = useState(true);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCameraPermissionScreen, setShowCameraPermissionScreen] =
    useState(false);
  const [testWorkoutStarted, setTestWorkoutStarted] = useState(false);

  // Проверяем разрешение камеры при загрузке компонента
  useEffect(() => {
    const checkCameraPermission = async () => {
      if (!cameraPermission) return;

      if (!cameraPermission.granted) {
        // Нужно показать экран запроса разрешения
        setShowCameraPermissionScreen(true);
      }
    };

    checkCameraPermission();
  }, [cameraPermission]);

  // Определяем тип интеграции из параметров
  let integrationType = IntegrationOption.WORKOUT;
  if (params.integration_type === "plan") {
    integrationType = IntegrationOption.PLAN;
  } else if (params.integration_type === "exercise") {
    integrationType = IntegrationOption.CHALLENGE;
  }

  // Проверяем наличие необходимых параметров в зависимости от типа интеграции
  const isMissingParams = () => {
    if (integrationType === IntegrationOption.PLAN) {
      return !params.id;
    } else if (integrationType === IntegrationOption.CHALLENGE) {
      return !params.id;
    } else {
      return !params.title;
    }
  };
  useEffect(() => {
    const initializeUserId = async () => {
      try {
        // Если это тестовая тренировка, используем default_user_id
        if (params.type === "test") {
          setPostData((prev) => ({ ...prev, userId: "default_user_id" }));
          return;
        }

        // Для обычных тренировок получаем профиль с сервера
        const profile = await userService.getProfile();
        // Если профиль есть и в нем есть ID, используем его, преобразуя в строку
        if (profile && profile.id) {
          const userId = String(+profile.id + 1);
          const npd = { ...postData, userId };
          if (params.integration_type === "exercise") {
            npd.exercise = params.id as string;
            npd.showLeaderboard = false;
            npd.countdown = 10;
          }
          setPostData(npd);
        } else {
          // Если профиль не пришел или нет ID, оставляем default_user_id
          setPostData((prev) => ({ ...prev, userId: "default_user_id" }));
        }
      } catch (error) {
        console.error("Error getting user profile:", error);
        // В случае ошибки оставляем default_user_id
        setPostData((prev) => ({ ...prev, userId: "default_user_id" }));
      }
    };

    initializeUserId();
  }, [params.type]);

  // Проверяем наличие необходимых параметров
  if (isMissingParams()) {
    const errorMessage = (() => {
      if (integrationType === IntegrationOption.PLAN) {
        return "Plan ID is missing";
      } else if (integrationType === IntegrationOption.CHALLENGE) {
        return "Challenge ID is missing";
      } else {
        return "Workout title is missing";
      }
    })();

    Alert.alert("Error", errorMessage);
    router.back();
    return null;
  }

  const handleCameraPermissionGranted = () => {
    setShowCameraPermissionScreen(false);
  };

  // Если у пользователя нет разрешения для камеры, показываем экран запроса
  if (showCameraPermissionScreen) {
    return (
      <CameraPermission onPermissionGranted={handleCameraPermissionGranted} />
    );
  }

  // Создаем фейковый TabBar компонент
  const FakeTabBar = () => (
    <View style={styles.tabBarContainer}>
      <Pressable
        style={styles.tabItem}
        onPress={() => router.replace("/(tabs)")}
      >
        <SvgXml
          xml={activeHomeIcon}
          width={24}
          height={24}
          style={styles.buttonIcon}
        />
        <Text style={[styles.tabText, styles.activeTabText]}>Main</Text>
      </Pressable>
      <Pressable
        style={styles.tabItem}
        onPress={() => router.replace("/(tabs)/workouts")}
      >
        <SvgXml
          xml={inactiveWorkoutsIcon}
          width={24}
          height={24}
          style={styles.buttonIcon}
        />
        <Text style={styles.tabText}>Workouts</Text>
      </Pressable>
      <Pressable
        style={styles.tabItem}
        onPress={() => router.replace("/(tabs)/analytics")}
      >
        <SvgXml
          xml={inactiveAnalyticsIcon}
          width={24}
          height={24}
          style={styles.buttonIcon}
        />
        <Text style={styles.tabText}>Analytics</Text>
      </Pressable>
      <Pressable
        style={styles.tabItem}
        onPress={() => router.replace("/(tabs)/profile")}
      >
        <SvgXml
          xml={inactiveProfileIcon}
          width={24}
          height={24}
          style={styles.buttonIcon}
        />
        <Text style={styles.tabText}>Profile</Text>
      </Pressable>
    </View>
  );

  const handleMessage = async (type: string, data: { [key: string]: any }) => {
    switch (type) {
      case "kinestex_launched":
        console.log("KinesteX launched:", data);
        break;

      case "exit_kinestex":
        console.log("User exiting KinesteX:", data);
        const exitData = {
          date: new Date().toISOString().split("T")[0],
          time_spent: data.time_spent || 0,
        };

        if (params.type === "test") {
          const testData = {
            completed: false,
            lastAttemptDate: exitData.date,
            totalTimeSpent: exitData.time_spent,
          };
          await AsyncStorage.setItem(
            "test_workout_data",
            JSON.stringify(testData)
          );
        }

        if (params.exit_url) {
          const goalId = params.goal_id;
          const levelId = params.level_id;

          // Формируем URL с параметрами
          const baseUrl = params.exit_url as string;
          const separator = baseUrl.includes("?") ? "&" : "?";
          const urlWithParams = `${baseUrl}${separator}goalid=${
            goalId || 1
          }&levelid=${levelId || 1}`;

          router.replace(urlWithParams as any);
        } else {
          router.back();
        }
        break;

      case "workout_completed":
        console.log(`${type} completed:`, data);

        if (params.type === "test") {
          const workoutData = {
            completed: true,
            lastWorkoutDate: new Date().toISOString().split("T")[0],
            totalTimeSpent: data.total_time_spent,
            totalCalories: data.total_calories,
            totalRepeats: data.total_repeats,
            percentageCompleted: data.percentage_completed,
          };
          await AsyncStorage.setItem(
            "test_workout_data",
            JSON.stringify(workoutData)
          );
        }

        // При успешном завершении тренировки используем completed_url
        if (params.completed_url) {
          // Получаем goalid и levelid из AsyncStorage
          const goalId = params.goal_id;
          const levelId = params.level_id;

          // Формируем URL с параметрами
          const baseUrl = params.completed_url as string;
          const separator = baseUrl.includes("?") ? "&" : "?";
          const urlWithParams = `${baseUrl}${separator}goalid=${
            goalId || 1
          }&levelid=${levelId || 1}`;

          router.replace(urlWithParams as any);
        } else {
          router.replace("/(tabs)");
        }
        break;

      case "workout_started":
        console.log("Workout started:", data);
        // Показываем TabBar при начале тренировки
        if (params.type !== "test") {
          setShowTabBar(false);
        }

        break;

      case "workout_opened":
        console.log(`${type}:`, data);
        console.log("Workout opened with params:", params);

        if (
          !params.type ||
          params.type !== "test" ||
          postData.userId !== "default_user_id"
        ) {
          try {
            const workoutData = {
              plan: params.type !== "test", // false для тестовых тренировок, true для обычных
              workout_id: Array.isArray(params.id) ? params.id[0] : params.id,
            };
            // Отправляем запрос на API
            await contentService.trackWorkoutStarted(workoutData);
          } catch (error) {
            console.error("Failed to track workout start:", error);
            // Не прерываем процесс даже при ошибке отправки данных
          }
        } else if (params.type === "test" && !testWorkoutStarted) {
          setTestWorkoutStarted(true);
          await contentService.startTestWorkout();
        }
        break;

      case "plan_started":
      case "plan_opened":
      case "exercise_started":
      case "exercise_opened":
        console.log(`${type}:`, data);
        break;

      case "exercise_completed":
        console.log("Exercise completed:", data);

        // Выводим подробную информацию об упражнении
        console.log("Exercise completion details:", {
          time_spent: data.time_spent,
          repeats: data.repeats,
          calories: data.calories,
          exercise: data.exercise,
          mistakes: data.mistakes,
        });

        // Отправляем информацию о завершении упражнения на сервер только если это не тестовая тренировка
        // или если пользователь авторизован
        if (params.type === "test" || params.integration_type !== "exercise") {
          try {
            const exerciseData = {
              plan: params.type !== "test",
            };

            // Отправляем запрос на API exercise-finished
            await contentService.trackExerciseFinished(exerciseData);
          } catch (error) {
            console.error("Failed to track exercise completion:", error);
            // Не прерываем процесс даже при ошибке отправки данных
          }
        }
        break;

      case "workout_overview":
      case "exercise_overview":
        if (
          type === "exercise_overview" &&
          params.integration_type === "exercise"
        ) {
          try {
            const exerciseData = {
              plan: params.integration_type !== "exercise",
              calories: data.data[0].calories,
              activity_time: data.data[0].time_spent,
            };

            // Отправляем запрос на API exercise-finished
            await contentService.trackExerciseFinished(exerciseData);
          } catch (error) {
            console.error("Failed to track exercise completion:", error);
            // Не прерываем процесс даже при ошибке отправки данных
          }
        }
        if (
          type === "workout_overview" &&
          params.integration_type !== "exercise" &&
          (!params.type ||
            params.type !== "test" ||
            postData.userId !== "default_user_id")
        ) {
          try {
            const calories = Number(data.data.total_calories);

            // Подготавливаем данные для API
            const caloriesData = {
              calories: calories,
              plan: params.type !== "test", // false для тестовых тренировок, true для обычных
            };

            // Отправляем запрос на API fired-calories
            await contentService.trackFiredCalories(caloriesData);

            // Подготавливаем данные для API workout-finished
            const workoutFinishedData = {
              activity_time: data.data.total_time_spent,
              calories: data.data.total_calories,
              plan: true,
              workout_id: params.id,
              date: new Date().toISOString().split("T")[0],
            };

            // Отправляем запрос на API workout-finished
            await contentService.trackWorkoutFinished(workoutFinishedData);
          } catch (error) {
            console.error("Failed to track fired calories:", error);
            // Не прерываем процесс даже при ошибке отправки данных
          }
        }
        if (params.type === "test" && type === "workout_overview") {
          await contentService.finishTestWorkout({
            calories: data.data.total_calories,
            activity_time: data.data.total_time_spent,
          });
        }
        break;

      case "error_occurred":
        console.error("KinesteX error:", data.data);
        break;

      case "left_camera_frame":
      case "returned_camera_frame":
        console.log(`${type}:`, data.number);
        break;

      case "person_in_frame":
        console.log(`${type}:`, data);
        // Скрываем TabBar когда человек появляется в кадре
        setShowTabBar(false);
        break;

      case "plan_unlocked":
        console.log("Plan unlocked:", data);
        // Отправляем запрос на установку плана для пользователя
        try {
          // Используем ID плана из параметров URL
          if (params.id) {
            const planId = params.id.toString();
            const success = await api.content.setPlanForUser(planId);
            if (success) {
              console.log("Plan set successfully:", planId);
            } else {
              console.warn("Failed to set plan");
            }
          } else if (data && data.plan_id) {
            // Запасной вариант, если ID не пришел из параметров
            const success = await api.content.setPlanForUser(data.plan_id);
            if (success) {
              console.log("Plan set successfully:", data.plan_id);
            } else {
              console.warn("Failed to set plan");
            }
          } else {
            console.warn("No plan ID available to set");
          }
        } catch (error) {
          console.error("Error setting plan:", error);
        }
        break;

      default:
        console.log("Other message type:", type, data);
        break;
    }
  };

  // Определяем параметры для KinestexSDK в зависимости от типа интеграции
  const getSdkProps = () => {
    switch (integrationType) {
      case IntegrationOption.PLAN:
        return { plan: params.id as string };
      case IntegrationOption.CHALLENGE:
        return {};
      default:
        return { workout: params.title as string };
    }
  };

  const sdkProps = getSdkProps();

  return (
    <SafeAreaView
      style={[styles.container, showTabBar && styles.containerWithTabBar]}
      edges={Platform.OS === "ios" ? ["top"] : []}
    >
      <KinestexSDK
        ref={kinestexSDKRef}
        data={postData}
        integrationOption={integrationType}
        {...sdkProps}
        handleMessage={handleMessage}
      />
      {showTabBar &&
        params.type !== "test" &&
        params.exit_url !== "/(auth)/test-workout" && <FakeTabBar />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  containerWithTabBar: {
    paddingBottom: 79,
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 79,
    backgroundColor: "rgb(255, 255, 255)",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 6,
    paddingBottom: 30,
    borderTopWidth: 0,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  buttonIcon: {
    marginBottom: 0,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666666",
    marginTop: 4,
  },
  activeTabText: {
    color: "#06E28A",
  },
});
