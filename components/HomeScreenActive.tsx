import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { GradientWrapper } from "./GradientWrapper";
import {
  MainPagePlan,
  MainPageWorkout,
  Program,
  CalendarServerItem,
} from "@/lib/api/types";
import { colors } from "@/constants/сolors";
import ProgramsSlider from "./ProgramsSlider";
import ProgramCalendar from "./ProgramCalendar";
import Card from "./Card";
import { SvgXml } from "react-native-svg";
import {
  analyticsCalendarIcon,
  analyticsCaloriesIcon,
  analyticsWorkoutIcon,
} from "@/lib/icon";
import { contentService } from "@/lib/api/services/contentService";

interface HomeScreenActiveProps {
  plan: MainPagePlan;
  workout: MainPageWorkout | undefined;
  availablePrograms: Program[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const HomeScreenActive: React.FC<HomeScreenActiveProps> = ({
  plan,
  workout,
  availablePrograms,
  isLoading,
  error,
  onRetry,
}) => {
  const [calendarData, setCalendarData] = useState<CalendarServerItem[]>([]);
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [paymentModalText, setPaymentModalText] = useState("");
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [showPaymentBanner, setShowPaymentBanner] = useState(false);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const response = await contentService.getUserCalendar();
        setCalendarData(response as CalendarServerItem[]);
      } catch (error: unknown) {
        console.error("Failed to fetch calendar:", error);
      } finally {
        setIsCalendarLoading(false);
      }
    };

    if (plan) {
      fetchCalendar();
    }
  }, [plan]);

  // Новый useEffect для получения настроек приложения
  useEffect(() => {
    const fetchAppSettings = async () => {
      try {
        const settingsResponse = await contentService.getAppSettings();

        // Ищем настройку payment_banner
        const paymentBannerSetting = settingsResponse.settings.find(
          (setting) => setting.key === "payment_banner"
        );

        // Показываем баннер только если значение "on"
        setShowPaymentBanner(paymentBannerSetting?.value === "on");
      } catch (error) {
        console.error("Failed to fetch app settings:", error);
        // По умолчанию не показываем баннер при ошибке
        setShowPaymentBanner(false);
      }
    };

    fetchAppSettings();
  }, []);

  // Определяем, является ли сегодня днем отдыха
  const isRestDay = !workout || !workout.title;

  const handleGetProgram = async () => {
    setIsPaymentLoading(true);
    try {
      // Вызов API для получения информации о платежной кнопке
      await contentService.getPaymentButton();

      // В случае успешного ответа все равно показываем модальное окно с сообщением
      setPaymentModalText(
        "Good news! The Usyk champion program is free for all early access users. Enjoy your workouts and thank you for being with us!"
      );
      setIsPaymentModalVisible(true);
    } catch (error) {
      console.error("Payment button error:", error);

      // В случае ошибки тоже показываем модальное окно с сообщением
      setPaymentModalText(
        "Good news! The Usyk champion program is free for all early access users. Enjoy your workouts and thank you for being with us!"
      );
      setIsPaymentModalVisible(true);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  // Закрытие модального окна
  const closePaymentModal = () => {
    setIsPaymentModalVisible(false);
  };

  return (
    <>
      <View style={styles.currentProgramSection}>
        <Text style={styles.sectionTitle}>Your workout program</Text>

        {/* Карточка текущей программы тренировок */}
        <Card
          id={plan.plan_id}
          title={plan.title}
          imageUrl={plan.img_url}
          type="plan"
          tags={[{ label: "Strenght" }, { label: "Cardio" }]}
          stats={{
            duration: `${plan.weeks} weeks`,
            bodyFocus: "Full body",
            calories: plan.calories,
          }}
        />

        {/* Обновленные карточки статистики с иконками */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <SvgXml xml={analyticsCalendarIcon} width={24} height={24} />
            <Text style={styles.statValue}>
              {plan.current_weeks}/{plan.weeks}
            </Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statCard}>
            <SvgXml xml={analyticsWorkoutIcon} width={24} height={24} />
            <Text style={styles.statValue}>
              {plan.finished_workouts}/{plan.workouts}
            </Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <SvgXml xml={analyticsCaloriesIcon} width={24} height={24} />
            <Text style={styles.statValue}>
              {plan.fired_calories}/{plan.calories}
            </Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>
      </View>

      {/* Секция для рекламы покупки программы Усика - отображается только если showPaymentBanner=true */}
      {showPaymentBanner && (
        <View style={styles.championProgramSection}>
          <View style={styles.championContentBox}>
            <Image
              source={require("../assets/images/usyk.png")}
              style={styles.championImage}
              resizeMode="cover"
            />
            <View style={styles.championOverlay}>
              <View style={styles.championTextContainer}>
                <Text style={styles.championTitle}>
                  Training with the champion!
                </Text>
                <Text style={styles.championDescription}>
                  20 workouts from Usyk{"\n"}for only $4.99
                </Text>
                <TouchableOpacity
                  style={styles.getProgramButton}
                  onPress={async () => {
                    try {
                      await contentService.sendPaymentPageRequest();
                    } catch (error) {
                      console.error(
                        "Error sending payment page request:",
                        error
                      );
                    }
                    router.push("/usyk-program");
                  }}
                  disabled={isPaymentLoading}
                >
                  <Text style={styles.getProgramButtonText}>
                    {isPaymentLoading ? "Loading..." : "Get program"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      <View
        style={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: "hidden",
        }}
      >
        <View style={styles.todayWorkoutSection}>
          {/* Изменяем заголовок в зависимости от типа дня */}
          <Text style={styles.sectionTitleDark}>
            {isRestDay ? "Today is Rest Day" : "Today's workout"}
          </Text>

          {workout && workout.title ? (
            /* Карточка сегодняшней тренировки */
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
                console.log("workout.workout_id ejjen blat", workout.workout_id);
                
                router.push({
                  pathname: "/(workout)/start",
                  params: {
                    title: workout.title.toLowerCase().trim(),
                    integration_type: "workout",
                    exit_url: "/(tabs)",
                    id: workout.workout_id,
                  },
                })
              }}
              onStartPress={() =>
              {
                console.log("workout.workout_id ejjen blat", workout.workout_id);
                
                router.push({
                  pathname: "/(workout)/start",
                  params: {
                    title: workout.title.toLowerCase().trim(),
                    integration_type: "workout",
                    exit_url: "/(tabs)",
                    id: workout.workout_id,
                  },
                })
              }
              }
            />
          ) : (
            /* Карточка дня отдыха с дополнительной информацией */
            <Card
              id="rest-day"
              title="Rest Day"
              imageUrl={require("../assets/images/rest-day.png")}
              type="workout"
              showStartButton={false}
            />
          )}
        </View>

        <View style={styles.calendarSection}>
          <ProgramCalendar
            title="Program progress"
            collapsible={true}
            initialCollapsed={false}
            selectedMonth={new Date()}
            calendar={calendarData}
          />
        </View>

        <View style={styles.availableProgramsSection}>
          <View style={styles.headerSection}>
            <Text style={styles.sectionTitleDark}>Available programs</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push("/available-programs")}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <ProgramsSlider
            programs={availablePrograms}
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
          />

          {/* Секция с фидбеком */}
          <View style={styles.feedbackSection}>
            <View style={styles.feedbackContent}>
              <Text style={styles.feedbackTitle}>Help us get better</Text>
              <Text style={styles.feedbackDescription}>
                Leave a review or suggestion for the app
              </Text>
              <GradientWrapper
                style={styles.reviewButton}
                onPress={() => router.push("/(tabs)/profile/feedback")}
              >
                <Text style={styles.reviewButtonText}>Leave a review</Text>
              </GradientWrapper>
            </View>
          </View>
        </View>
      </View>

      {/* Модальное окно для сообщения об оплате */}
      <Modal
        visible={isPaymentModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closePaymentModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Special Offer!</Text>
            <Text style={styles.modalText}>{paymentModalText}</Text>
            <GradientWrapper
              style={styles.modalButton}
              onPress={closePaymentModal}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </GradientWrapper>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  currentProgramSection: {
    paddingTop: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
    color: colors.white,
    marginBottom: 16,
  },
  sectionTitleDark: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
    color: colors.black,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    paddingVertical: 12,
    alignItems: "flex-start",
  },
  statValue: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 14,
    letterSpacing: 0,
    color: colors.black,
    marginBottom: 3,
    marginTop: 12,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 14,
    letterSpacing: 0,
    color: colors.textSecondary,
  },
  championProgramSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  championContentBox: {
    backgroundColor: "transparent",
    borderRadius: 20,
    position: "relative",
    height: 175,
  },
  championOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
  },
  championTextContainer: {
    width: "50%",
    justifyContent: "space-between",
  },
  championTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
    marginBottom: 8,
  },
  championDescription: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0,
    marginBottom: 16,
  },
  getProgramButton: {
    backgroundColor: "#fff",
    borderRadius: 200,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
  },
  getProgramButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0,
  },
  championImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    position: "absolute",
  },
  todayWorkoutSection: {
    backgroundColor: colors.background,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  availableProgramsSection: {
    backgroundColor: colors.background,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  viewAllButton: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  viewAllText: {
    color: colors.black,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 14,
    letterSpacing: 0,
  },
  calendarSection: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
    color: colors.black,
    marginBottom: 16,
  },
  modalText: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
    letterSpacing: 0,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 200,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0,
  },
  feedbackSection: {
    backgroundColor: colors.white,
    borderRadius: 20,
    backdropFilter: "blur(6px)",
    margin: 16,
    marginTop: 8,
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
    color: colors.black,
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
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 16,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  reviewButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0,
  },
});

export default HomeScreenActive;
