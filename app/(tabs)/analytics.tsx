import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { contentService } from "@/lib/api/services/contentService";
import { userService } from "@/lib/api/services/userService";
import {
  MainPageResponse,
  UserProfile,
  CalendarServerItem,
} from "@/lib/api/types";
import { SetupProgramCard } from "@/components/SetupProgramCard";
import { NoWorkoutHistory } from "@/components/NoWorkoutHistory";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import {
  analyticsExerciseIcon,
  analyticsWorkoutsStartedIcon,
  analyticsWorkoutsCompletedIcon,
  analyticsCaloriesIcon,
  analyticsWorkoutIcon,
  analyticsCalendarIcon,
  analyticsActivityIcon,
  noWoroutHistoryIcon,
} from "@/lib/icon";
import ProgramCalendar from "@/components/ProgramCalendar";
import {
  WorkoutHistoryList,
  type WorkoutHistoryItem,
} from "@/components/WorkoutHistoryList";

interface CalendarItem {
  date: string;
  title: string;
  workout_title: string;
  workout_id: string;
  trained: boolean;
  canceled: boolean;
}

export default function AnalyticsScreen() {
  const [isMainDataLoading, setIsMainDataLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isWorkoutHistoryLoading, setIsWorkoutHistoryLoading] = useState(true);
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);
  const [mainData, setMainData] = useState<MainPageResponse | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>(
    []
  );
  const [calendarData, setCalendarData] = useState<CalendarServerItem[]>([]);
  const [workoutHistoryError, setWorkoutHistoryError] = useState<string | null>(
    null
  );

  const isProgramSelected = mainData?.plan && mainData.plan.length > 0;

  useEffect(() => {
    const fetchMainData = async () => {
      try {
        const response = await contentService.getMainPageData();
        setMainData(response);
      } catch (error: unknown) {
        console.error("Failed to fetch main data:", error);
      } finally {
        setIsMainDataLoading(false);
      }
    };

    fetchMainData();
  }, []);

  useEffect(() => {
    const fetchWorkoutHistory = async () => {
      try {
        const response = await contentService.getUserWorkoutHistory();
        setWorkoutHistory(response);
      } catch (error: unknown) {
        console.error("Failed to fetch workout history:", error);
        setWorkoutHistoryError("Failed to load workout history");
      } finally {
        setIsWorkoutHistoryLoading(false);
      }
    };

    if (isProgramSelected) {
      fetchWorkoutHistory();
    }
  }, [isProgramSelected]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userService.getProfile();
        setProfile(response);
      } catch (error: unknown) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    if (isProgramSelected) {
      fetchProfile();
    }
  }, [isProgramSelected]);

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

    if (isProgramSelected) {
      fetchCalendar();
    }
  }, [isProgramSelected]);

  // Обновляем историю тренировок
  const handleRefreshWorkoutHistory = async () => {
    try {
      setIsWorkoutHistoryLoading(true);
      const response = await contentService.getUserWorkoutHistory();
      setWorkoutHistory(response);
      setWorkoutHistoryError(null);
    } catch (error: unknown) {
      console.error("Failed to refresh workout history:", error);
      setWorkoutHistoryError("Failed to refresh workout history");
    } finally {
      setIsWorkoutHistoryLoading(false);
    }
  };

  // Stats for history section
  const historyStats: Array<{
    icon: string | React.ComponentType<{ size: number; color: string }>;
    label: string;
    value: string;
  }> = [
    {
      icon: analyticsCalendarIcon,
      label: "Workouts",
      value: isProgramSelected ? String(profile?.completed_workouts || 0) : "0",
    },
    {
      icon: analyticsWorkoutIcon,
      label: "Exercises",
      value: isProgramSelected
        ? String(profile?.completed_exercises || 0)
        : "0",
    },
    {
      icon: analyticsCaloriesIcon,
      label: "Calories",
      value: isProgramSelected ? String(profile?.total_calories || 0) : "0",
    },
    {
      icon: analyticsWorkoutsStartedIcon,
      label: "Workouts\nstarted",
      value: isProgramSelected ? String(profile?.started_workouts || 0) : "0",
    },
    {
      icon: analyticsWorkoutsCompletedIcon,
      label: "Completed\nworkouts",
      value: isProgramSelected ? String(profile?.completed_workouts || 0) : "0",
    },
    {
      icon: analyticsActivityIcon,
      label: "Activity time\n(min)",
      value: isProgramSelected ? String(profile?.total_minutes || 0) : "0",
    },
  ];

  // Обновленная логика для общей проверки загрузки
  const shouldShowLoading =
    isMainDataLoading ||
    (isProgramSelected && (isProfileLoading || isWorkoutHistoryLoading));

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Activity analytics</Text>

          {shouldShowLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00E087" />
              <Text style={styles.loadingText}>Loading analytics data...</Text>
            </View>
          ) : !isProgramSelected ? (
            <SetupProgramCard
              onSetupPress={() => router.push("/(onboarding)/setup-intro")}
            />
          ) : (
            <View>
              {/* Current Program Card */}
              <View style={styles.programCard}>
                <Image
                  source={
                    mainData?.plan?.[0]?.img_url
                      ? { uri: mainData.plan[0].img_url }
                      : require("../../assets/images/workout.png")
                  }
                  style={styles.programImage}
                />
                <View style={styles.programInfo}>
                  <Text style={styles.programLabel}>Your program</Text>
                  <Text style={styles.programName}>
                    {mainData?.plan?.[0]?.title || "Your Program"}
                  </Text>
                </View>
              </View>

              {/* Program Progress */}
              <Text style={styles.sectionTitle}>Program progress</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <SvgXml xml={analyticsCalendarIcon} width={24} height={24} />
                  <Text style={styles.statValue}>
                    {mainData?.plan?.[0]?.current_weeks || 0}/
                    {mainData?.plan?.[0]?.weeks || 0}{" "}
                    <Text style={styles.statValueUnit}>weeks</Text>
                  </Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>

                <View style={styles.statCard}>
                  <SvgXml xml={analyticsWorkoutIcon} width={24} height={24} />
                  <Text style={styles.statValue}>
                    {mainData?.plan?.[0]?.finished_workouts || 0}/
                    {mainData?.plan?.[0]?.workouts || 0}
                  </Text>
                  <Text style={styles.statLabel}>Workouts</Text>
                </View>

                <View style={styles.statCard}>
                  <SvgXml xml={analyticsCaloriesIcon} width={24} height={24} />
                  <Text style={styles.statValue}>
                    {mainData?.plan?.[0]?.fired_calories || 0}/
                    {mainData?.plan?.[0]?.calories || 0}
                  </Text>
                  <Text style={styles.statLabel}>Calories</Text>
                </View>

                <View style={styles.statCard}>
                  <SvgXml xml={analyticsExerciseIcon} width={24} height={24} />
                  <Text style={styles.statValue}>
                    {profile?.completed_exercises || 0}
                  </Text>
                  <Text style={styles.statLabel}>Exercises completed</Text>
                </View>

                <View style={styles.statCard}>
                  <SvgXml
                    xml={analyticsWorkoutsStartedIcon}
                    width={24}
                    height={24}
                  />
                  <Text style={styles.statValue}>
                    {mainData?.plan?.[0]?.started_workouts ||
                      profile?.started_workouts ||
                      0}
                  </Text>
                  <Text style={styles.statLabel}>Workouts started</Text>
                </View>

                <View style={styles.statCard}>
                  <SvgXml
                    xml={analyticsWorkoutsCompletedIcon}
                    width={24}
                    height={24}
                  />
                  <Text style={styles.statValue}>
                    {mainData?.plan?.[0]?.finished_workouts || 0}
                  </Text>
                  <Text style={styles.statLabel}>Completed workouts</Text>
                </View>
              </View>

              {/* Program Calendar Component */}
              <Text style={styles.sectionTitle}>Program calendar</Text>
              <View style={styles.calendarSection}>
                <ProgramCalendar
                  title="Program progress"
                  collapsible={true}
                  initialCollapsed={false}
                  selectedMonth={new Date()}
                  calendar={calendarData}
                />
              </View>
            </View>
          )}

          {/* Workouts History */}
          {!isMainDataLoading && (
            <>
              <Text style={styles.sectionTitle}>Workouts history</Text>
              <Text style={styles.sectionSubtitle}>
                Analytics of training outside the program
              </Text>

              <View style={styles.statsGrid}>
                {historyStats.map((stat, index) => (
                  <View key={index} style={styles.statCard}>
                    {typeof stat.icon === "string" ? (
                      <SvgXml xml={stat.icon} width={24} height={24} />
                    ) : (
                      <stat.icon size={24} color="#000000" />
                    )}
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              {!isProgramSelected ? (
                <NoWorkoutHistory icon={noWoroutHistoryIcon} />
              ) : isWorkoutHistoryLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#00E087" />
                  <Text style={styles.loadingText}>
                    Loading workout history...
                  </Text>
                </View>
              ) : workoutHistoryError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{workoutHistoryError}</Text>
                  <Pressable
                    style={styles.retryButton}
                    onPress={handleRefreshWorkoutHistory}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </Pressable>
                </View>
              ) : workoutHistory.length === 0 ? (
                <NoWorkoutHistory icon={noWoroutHistoryIcon} />
              ) : (
                <WorkoutHistoryList workouts={workoutHistory} />
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 28,
    letterSpacing: 0,
    color: "#000000",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
    color: "rgb(1,1,1)",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionSubtitle: {
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 14,
    letterSpacing: 0,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
    marginHorizontal: 16,
  },
  statCard: {
    width: "32%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 14,
    letterSpacing: 0,
    color: "rgb(1,1,1)",
    marginBottom: 3,
    marginTop: 12,
  },
  statValueUnit: {
    fontSize: 14,
    fontWeight: "400",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 14,
    letterSpacing: 0,
  },
  programCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
    alignItems: "center",
    marginHorizontal: 16,
  },
  programImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  programInfo: {
    flex: 1,
  },
  programLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  programName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  calendarSection: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    marginBottom: 10,
    fontSize: 14,
    color: "#ff3b30",
  },
  retryButton: {
    backgroundColor: "#00E087",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
});
