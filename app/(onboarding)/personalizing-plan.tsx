import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SvgXml } from "react-native-svg";
import Svg, { Circle } from "react-native-svg";
import { checkIcon } from "@/lib/icon";
import { userService } from "@/lib/api/services/userService";
import { SafeAreaView } from "react-native-safe-area-context";

// Константы
const CIRCLE_RADIUS = 60;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const DEFAULT_PROGRAM_ID = "22B3qRU2r75hVXHgGiGx";
const ANIMATION_DURATION = 3000; // Сокращаем до 3 секунд для лучшего UX

// Шаги персонализации
const PERSONALIZATION_STEPS = [
  "Body Analysis",
  "Muscle Group Focus Analysis",
  "Workout Program Selection",
];

// Компонент для оптимизированного отображения шага
interface StepItemProps {
  step: string;
  isCompleted: boolean;
}

const StepItem = React.memo(({ step, isCompleted }: StepItemProps) => (
  <View style={styles.stepRow}>
    <View style={[styles.checkCircle, isCompleted && styles.completedCircle]}>
      {isCompleted && (
        <SvgXml xml={checkIcon} width={16} height={16} color="#FFFFFF" />
      )}
    </View>
    <Text style={[styles.stepText, isCompleted && styles.completedStepText]}>
      {step}
    </Text>
  </View>
));

// Тип для данных профиля
interface ProfileData {
  age: number;
  height: number;
  weight: number;
  goal_weight: number;
  dob: string;
  muscle_groups: string[];
  allow_notifications: boolean;
  notification_time: string;
}

export default function PersonalizingPlanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Создаем ref для анимации вместо использования Animated.Value напрямую в стейте
  const progressAnimationRef = useRef(new Animated.Value(0)).current;
  const circleProgressRef = useRef(new Animated.Value(0)).current;
  const [progressPercent, setProgressPercent] = useState("0");

  // Анимированные значения для отображения
  const strokeDashoffset = circleProgressRef.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCLE_CIRCUMFERENCE, 0],
    extrapolate: "clamp",
  });

  // Обработка данных профиля
  const profileData = useCallback((): ProfileData => {
    try {
      let muscleGroups: string[] = [];
      if (params.muscleGroups) {
        try {
          muscleGroups = JSON.parse(params.muscleGroups.toString());
        } catch (e) {
          console.error("Error parsing muscle groups:", e);
          if (params.muscleGroupType) {
            muscleGroups = [params.muscleGroupType.toString()];
          }
        }
      } else if (params.muscleGroupType) {
        muscleGroups = [params.muscleGroupType.toString()];
      }

      return {
        age: Number(params.age) || 25,
        height: Number(params.height) || 175,
        weight: Number(params.weight) || 70,
        goal_weight: Number(params.goalWeight) || 70,
        dob: params.dob?.toString() || "2000-01-01",
        muscle_groups: muscleGroups,
        allow_notifications: params.allowNotifications === "true",
        notification_time: params.notificationTime?.toString() || "08:00",
      };
    } catch (error) {
      console.error("Error processing profile data:", error);
      return {
        age: 25,
        height: 175,
        weight: 70,
        goal_weight: 70,
        dob: "2000-01-01",
        muscle_groups: [],
        allow_notifications: false,
        notification_time: "08:00",
      };
    }
  }, [params]);

  // Функция навигации на экран запуска тренировки как план
  const navigateToWorkoutStart = useCallback(
    (planId: string, planData?: any) => {
      try {
        router.replace({
          pathname: "/(workout)/start",
          params: {
            id: planId,
            integration_type: "plan",
            exit_url: "/(tabs)",
          },
        });
      } catch (error) {
        console.error("Navigation error:", error);
        // Упрощенная навигация в случае ошибки
        router.replace(`/(workout)/start?id=${planId}&integration_type=plan`);
      }
    },
    [router]
  );

  // Отправка данных профиля
  const sendProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = profileData();
      const response = await userService.saveOnboardingProfile(data);

      if (response?.plan) {
        navigateToWorkoutStart(response.plan.id, response.plan);
      } else {
        navigateToWorkoutStart(DEFAULT_PROGRAM_ID);
      }
    } catch (error) {
      console.error("Error sending profile data:", error);
      setIsError(true);
      // Даже при ошибке направляем пользователя дальше
      navigateToWorkoutStart(DEFAULT_PROGRAM_ID);
    } finally {
      setIsLoading(false);
    }
  }, [profileData, navigateToWorkoutStart]);

  // Функция для запуска анимации шагов
  const animateSteps = useCallback(() => {
    // Очищаем предыдущие состояния
    setCompletedSteps([]);

    const stepTimers: NodeJS.Timeout[] = [];

    // Анимация первого шага (30%)
    stepTimers.push(
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, 0]);
      }, ANIMATION_DURATION * 0.3)
    );

    // Анимация второго шага (60%)
    stepTimers.push(
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, 1]);
      }, ANIMATION_DURATION * 0.6)
    );

    // Анимация третьего шага (90%)
    stepTimers.push(
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, 2]);

        // Отправка данных после завершения всех анимаций
        setTimeout(sendProfileData, 300);
      }, ANIMATION_DURATION * 0.9)
    );

    return stepTimers;
  }, [sendProfileData]);

  // Основная анимация при монтировании компонента
  useEffect(() => {
    // Сбрасываем анимацию
    progressAnimationRef.setValue(0);
    circleProgressRef.setValue(0);

    // Обновляем текст процентов при изменении значения анимации
    const progressListener = progressAnimationRef.addListener(({ value }) => {
      const percent = Math.floor(value * 100);
      setProgressPercent(`${percent}%`);
    });

    // Запускаем анимацию кругового прогресса
    const progressAnimation = Animated.timing(progressAnimationRef, {
      toValue: 1,
      duration: ANIMATION_DURATION,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    const circleAnimation = Animated.timing(circleProgressRef, {
      toValue: 1,
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    });

    // Запускаем анимации
    Animated.parallel([progressAnimation, circleAnimation]).start();

    // Запускаем анимацию шагов
    const stepTimers = animateSteps();

    // Очистка таймеров при размонтировании
    return () => {
      progressAnimation.stop();
      circleAnimation.stop();
      progressAnimationRef.removeListener(progressListener);
      stepTimers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Анимированный круг прогресса */}
        <View style={styles.progressCircleContainer}>
          <Svg width={140} height={140} viewBox="0 0 140 140">
            {/* Фоновый круг */}
            <Circle
              cx="70"
              cy="70"
              r={CIRCLE_RADIUS}
              stroke="#D1F2E7"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Анимированный круг прогресса */}
            <AnimatedCircle
              cx="70"
              cy="70"
              r={CIRCLE_RADIUS}
              stroke="#00E087"
              strokeWidth="10"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90, 70, 70)"
            />
          </Svg>

          <View style={styles.percentTextContainer}>
            <Text style={styles.progressText}>{progressPercent}</Text>
          </View>
        </View>

        <Text style={styles.title}>
          Personalization of the{"\n"}Training Plan
        </Text>

        {/* Список шагов */}
        <View style={styles.stepsContainer}>
          {PERSONALIZATION_STEPS.map((step, index) => (
            <StepItem
              key={index}
              step={step}
              isCompleted={completedSteps.includes(index)}
            />
          ))}
        </View>

        {/* Индикатор загрузки если API запрос активен */}
        {completedSteps.length === PERSONALIZATION_STEPS.length &&
          isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00E087" />
              <Text style={styles.loadingText}>Finalizing your plan...</Text>
            </View>
          )}
      </View>
    </SafeAreaView>
  );
}

// Анимированная версия Circle
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E7F9F3",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  progressCircleContainer: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    position: "relative",
  },
  percentTextContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  progressText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#00A667",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    marginBottom: 50,
  },
  stepsContainer: {
    width: "100%",
    marginTop: 20,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#AAAAAA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  completedCircle: {
    backgroundColor: "#00E087",
    borderColor: "#00E087",
  },
  stepText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666666",
  },
  completedStepText: {
    color: "#000000",
    fontWeight: "600",
  },
  loadingContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#00A667",
    fontWeight: "500",
  },
});
