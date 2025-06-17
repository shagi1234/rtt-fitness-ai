import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  Modal,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SvgXml } from "react-native-svg";
import { colors } from "@/constants/сolors";
import { GradientWrapper } from "@/components/GradientWrapper";
import {
  checkIcon,
  increaseEnduranceIcon,
  buildMuscleIcon,
  loseWeightIcon,
  maintainHealthIcon,
  beginnerIcon,
  intermediateIcon,
  advancedIcon,
} from "@/lib/icon";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { useProfile } from "@/lib/ProfileContext";
import { userService } from "@/lib/api/services/userService";

// Интерфейс для тренировочного плана
interface WorkoutPlan {
  id: string;
  title: string;
  img_url: string;
  weeks: number;
  calories: number;
  category_description: string;
  cardio_level?: string | null;
  strength_level?: string | null;
  updated_at?: string;
  created_at?: string;
  workouts?: number;
}

// Интерфейс для ответа от API
interface WorkoutOptionsResponse {
  message: string;
  plan: WorkoutPlan;
}

export type GoalData = {
  index: number;
  type: "maintain" | "lose" | "build" | "endurance";
  label: string;
};

const goalOptions: GoalData[] = [
  { index: 0, type: "maintain", label: "Maintain health" },
  { index: 1, type: "lose", label: "Lose weight" },
  { index: 2, type: "build", label: "Build muscle" },
  { index: 3, type: "endurance", label: "Increase endurance" },
];

export type LevelData = {
  index: number;
  type: "beginner" | "intermediate" | "advanced";
  label: string;
  description: string;
};

const levelOptions: LevelData[] = [
  {
    index: 0,
    type: "beginner",
    label: "Beginner",
    description: "I rarely and prefer low intensity.",
  },
  {
    index: 1,
    type: "intermediate",
    label: "Intermediate",
    description: "I can do moderate workouts.",
  },
  {
    index: 2,
    type: "advanced",
    label: "Advanced",
    description: "I have years of experience working out.",
  },
];

// Map local goal types to API goal_id values
const goalTypeToId: Record<GoalData["type"], number> = {
  maintain: 1,
  lose: 2,
  build: 3,
  endurance: 4,
};

// Map local level types to API level_id values
const levelTypeToId: Record<LevelData["type"], number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

// Map API goal_id values to local goal types
const goalIdToType: Record<number, GoalData["type"]> = {
  1: "maintain",
  2: "lose",
  3: "build",
  4: "endurance",
};

// Map API level_id values to local level types
const levelIdToType: Record<number, LevelData["type"]> = {
  1: "beginner",
  2: "intermediate",
  3: "advanced",
};

interface GoalOptionProps {
  icon: string;
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}

const GoalOption = ({ icon, label, isSelected, onSelect }: GoalOptionProps) => (
  <Pressable onPress={onSelect}>
    <GradientWrapper
      colors={
        isSelected ? [colors.primary, colors.primary] : ["#E5E5E5", "#E5E5E5"]
      }
      style={styles.optionGradient}
    >
      <View style={styles.option}>
        <View style={styles.optionContent}>
          <View style={styles.iconContainer}>
            <SvgXml xml={icon} width={24} height={24} />
          </View>
          <Text style={styles.optionLabel}>{label}</Text>
        </View>
        {isSelected && (
          <View style={styles.checkContainer}>
            <SvgXml xml={checkIcon} width={22} height={22} />
          </View>
        )}
      </View>
    </GradientWrapper>
  </Pressable>
);

interface LevelOptionProps {
  icon: string;
  label: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

const LevelOption = ({
  icon,
  label,
  description,
  isSelected,
  onSelect,
}: LevelOptionProps) => (
  <Pressable onPress={onSelect}>
    <GradientWrapper
      colors={
        isSelected ? [colors.primary, colors.primary] : ["#E5E5E5", "#E5E5E5"]
      }
      style={styles.optionGradient}
    >
      <View style={styles.option}>
        <View style={styles.optionContent}>
          <View style={styles.iconContainer}>
            <SvgXml xml={icon} width={24} height={24} />
          </View>
          <View style={styles.levelOptionText}>
            <Text style={styles.optionLabel}>{label}</Text>
            <Text style={styles.levelOptionDescription}>{description}</Text>
          </View>
        </View>
        {isSelected && (
          <View style={styles.checkContainer}>
            <SvgXml xml={checkIcon} width={22} height={22} />
          </View>
        )}
      </View>
    </GradientWrapper>
  </Pressable>
);

const getGoalIconByType = (type: GoalData["type"]) => {
  switch (type) {
    case "maintain":
      return maintainHealthIcon;
    case "lose":
      return loseWeightIcon;
    case "build":
      return buildMuscleIcon;
    case "endurance":
      return increaseEnduranceIcon;
    default:
      return maintainHealthIcon;
  }
};

const getLevelIconByType = (type: LevelData["type"]) => {
  switch (type) {
    case "beginner":
      return beginnerIcon;
    case "intermediate":
      return intermediateIcon;
    case "advanced":
      return advancedIcon;
    default:
      return beginnerIcon;
  }
};

// Helper functions to map profile data to our options
const mapGoalIdToGoalOption = (goalId: number | null): GoalData | null => {
  if (!goalId) return null;
  const type = goalIdToType[goalId];
  return type ? goalOptions.find((goal) => goal.type === type) || null : null;
};

const mapLevelIdToLevelOption = (levelId: number | null): LevelData | null => {
  if (!levelId) return null;
  const type = levelIdToType[levelId];
  return type
    ? levelOptions.find((level) => level.type === type) || null
    : null;
};

export default function WorkoutOptionsScreen() {
  const router = useRouter();
  const { profile, refreshProfile } = useProfile();
  const [selectedGoal, setSelectedGoal] = useState<GoalData | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);
  const [initialGoal, setInitialGoal] = useState<GoalData | null>(null);
  const [initialLevel, setInitialLevel] = useState<LevelData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState<WorkoutPlan | null>(null);

  // Load initial values from profile
  useEffect(() => {
    if (profile) {
      const goalOption = mapGoalIdToGoalOption(profile.goal_id);
      const levelOption = mapLevelIdToLevelOption(profile.level_id);

      setSelectedGoal(goalOption);
      setSelectedLevel(levelOption);
      setInitialGoal(goalOption);
      setInitialLevel(levelOption);
    }
  }, [profile]);

  // Check if there are changes to show the save button
  useEffect(() => {
    const goalChanged =
      initialGoal?.index !== selectedGoal?.index &&
      (initialGoal !== null || selectedGoal !== null);

    const levelChanged =
      initialLevel?.index !== selectedLevel?.index &&
      (initialLevel !== null || selectedLevel !== null);

    setHasChanges(goalChanged || levelChanged);
  }, [selectedGoal, selectedLevel, initialGoal, initialLevel]);

  const handleSave = async () => {
    if (selectedGoal && selectedLevel) {
      try {
        setIsSaving(true);

        // Get the corresponding API IDs for the selected goal and level
        const goal_id = goalTypeToId[selectedGoal.type];
        const level_id = levelTypeToId[selectedLevel.type];

        // Call the new API function to update workout options
        const result = (await userService.updateWorkoutOptions({
          goal_id,
          level_id,
        })) as any;

        // Update initial values to match current selection
        setInitialGoal(selectedGoal);
        setInitialLevel(selectedLevel);
        setHasChanges(false);

        // Always refresh profile after saving
        await refreshProfile();

        // Check if we received a new plan in the response
        if (result && result.plan) {
          setNewPlan(result.plan);
          setShowPlanModal(true);
        } else {
          router.replace("/(tabs)/profile");
        }
      } catch (error) {
        console.error("Failed to save workout options:", error);
        Alert.alert(
          "Error",
          "Failed to save workout options. Please try again."
        );
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Save button to display in header when changes are made
  const SaveButton = () =>
    hasChanges ? (
      <Pressable
        onPress={handleSave}
        style={styles.saveButton}
        disabled={isSaving}
      >
        <Text style={styles.saveText}>{isSaving ? "Saving..." : "Save"}</Text>
      </Pressable>
    ) : null;

  // Функция для перехода к тренировке с новым планом
  const handleSwitchToNewProgram = async () => {
    if (newPlan) {
      setShowPlanModal(false);

      // Refresh profile before navigating
      await refreshProfile();

      // Перенаправляем на экран начала тренировки
      router.replace({
        pathname: "/(workout)/start",
        params: {
          id: newPlan.id,
          integration_type: "plan",
          exit_url: "/(tabs)",
        },
      });
    }
  };

  // Функция для отмены и возврата к профилю
  const handleCancelNewProgram = async () => {
    setShowPlanModal(false);

    // Refresh profile before navigating back
    await refreshProfile();
    router.replace("/(tabs)/profile");
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={Platform.OS === "ios" ? ["top"] : ["top"]}
    >
      {/* <StatusBar barStyle="dark-content" /> */}
      <Header showBack rightContent={<SaveButton />} />
      <View style={styles.headerTitle}>
        <Text style={styles.title}>Workouts</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Goal</Text>
        <View style={styles.optionsContainer}>
          {goalOptions.map((goal) => (
            <GoalOption
              key={goal.index}
              icon={getGoalIconByType(goal.type)}
              label={goal.label}
              isSelected={selectedGoal?.index === goal.index}
              onSelect={() => setSelectedGoal(goal)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Level</Text>
        <View style={styles.optionsContainer}>
          {levelOptions.map((level) => (
            <LevelOption
              key={level.index}
              icon={getLevelIconByType(level.type)}
              label={level.label}
              description={level.description}
              isSelected={selectedLevel?.index === level.index}
              onSelect={() => setSelectedLevel(level)}
            />
          ))}
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Модальное окно с новым планом тренировок */}
      <Modal
        visible={showPlanModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPlanModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setShowPlanModal(false)}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>

            <Text style={styles.modalTitle}>
              You have changed the training goal
            </Text>

            <Text style={styles.modalSubtitle}>
              Based on the changes, we have selected a new training program for
              you.
            </Text>

            {newPlan && (
              <View style={styles.planContainer}>
                <Text style={styles.planSectionTitle}>
                  A new program for you:
                </Text>

                <View style={styles.planCard}>
                  <Image
                    source={{ uri: newPlan.img_url }}
                    style={styles.planImage}
                    resizeMode="cover"
                  />

                  <View style={styles.planInfo}>
                    <View style={styles.planHeader}>
                      <View style={styles.tagContainer}>
                        <Text style={styles.tagText}>Strenght</Text>
                      </View>

                      <View style={styles.tagContainer}>
                        <Text style={styles.tagText}>Cardio</Text>
                      </View>
                    </View>

                    <Text style={styles.planTitle}>{newPlan.title}</Text>

                    <View style={styles.planDetails}>
                      <Text style={styles.planDetailText}>
                        {newPlan.weeks} weeks
                      </Text>
                      <View style={styles.planDetailsDot} />
                      <Text style={styles.planDetailText}>Full body</Text>
                      <View style={styles.planDetailsDot} />
                      <Text style={styles.planDetailText}>
                        {newPlan.calories} kcal
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.primaryButton}
                onPress={handleSwitchToNewProgram}
              >
                <Text style={styles.primaryButtonText}>
                  Switch to the new program
                </Text>
              </Pressable>

              <Pressable
                style={styles.secondaryButton}
                onPress={handleCancelNewProgram}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerTitle: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.black,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 20,
    color: colors.black,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  optionsContainer: {
    gap: 10,
    marginBottom: 32,
  },
  optionGradient: {
    borderRadius: 16,
    padding: 1,
  },
  option: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 15,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 17,
    color: colors.black,
    fontWeight: "600",
  },
  levelOptionText: {
    flex: 1,
  },
  levelOptionDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: "400",
  },
  checkContainer: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -11 }],
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.white,
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 34,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  closeText: {
    fontSize: 24,
    color: "#000",
    fontWeight: "300",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.black,
    marginTop: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.black,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  planContainer: {
    width: "100%",
    marginBottom: 24,
  },
  planSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  planImage: {
    width: "100%",
    height: 180,
  },
  planInfo: {
    padding: 16,
  },
  planHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  tagContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  tagText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "500",
  },
  planTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.black,
    marginBottom: 8,
  },
  planDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  planDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  planDetailsDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textSecondary,
    marginHorizontal: 6,
  },
  modalButtons: {
    width: "100%",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: "600",
  },
  bottomPadding: {
    height: 20,
  },
});
