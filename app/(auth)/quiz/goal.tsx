import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SvgXml } from "react-native-svg";
import { colors } from "@/constants/сolors";
import { Button } from "@/components/Button";
import { GradientWrapper } from "@/components/GradientWrapper";
import {
  checkIcon,
  increaseEnduranceIcon,
  buildMuscleIcon,
  loseWeightIcon,
  maintainHealthIcon,
} from "@/lib/icon";
import { SafeAreaView } from "react-native-safe-area-context";
import ProgressBar from "@/components/ProgressBar";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      style={styles.goalOptionGradient}
    >
      <View style={styles.goalOption}>
        <View style={styles.goalOptionContent}>
          <View style={styles.iconContainer}>
            <SvgXml xml={icon} width={24} height={24} />
          </View>
          <Text style={styles.goalOptionLabel}>{label}</Text>
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

const getIconByType = (type: GoalData["type"]) => {
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

export default function GoalScreen() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<GoalData | null>(null);

  const handleNext = async () => {
    if (selectedGoal) {
      // Сохраняем goal_id в AsyncStorage
      await AsyncStorage.setItem(
        "user_goal_id",
        (selectedGoal.index + 1).toString()
      );

      router.push({
        pathname: "/(auth)/quiz/level",
        params: {
          goalIndex: selectedGoal.index,
          goalType: selectedGoal.type,
          goalLabel: selectedGoal.label,
        },
      });
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={Platform.OS === "ios" ? ["top"] : []}
    >
      <ProgressBar
        currentStep={1}
        totalSteps={2}
        onBack={() => router.back()}
      />
      <View style={styles.content}>
        {/* Используем компонент ProgressBar */}

        <Text style={styles.title}>What is your goal?</Text>

        <View style={styles.optionsContainer}>
          {goalOptions.map((goal) => (
            <GoalOption
              key={goal.index}
              icon={getIconByType(goal.type)}
              label={goal.label}
              isSelected={selectedGoal?.index === goal.index}
              onSelect={() => setSelectedGoal(goal)}
            />
          ))}
        </View>
      </View>

      <View style={styles.buttonWrapper}>
        <Button onPress={handleNext} disabled={!selectedGoal} title="Next" />
      </View>
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
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 28,
    letterSpacing: 0,
    color: colors.black,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  optionsContainer: {
    gap: 10,
    marginBottom: 100,
  },
  goalOptionGradient: {
    borderRadius: 16,
    padding: 1,
  },
  goalOption: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 15,
  },
  goalOptionContent: {
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
  goalOptionLabel: {
    fontSize: 17,
    color: colors.black,
    fontWeight: "600",
  },
  checkContainer: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -11 }],
  },
  buttonWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 50,
    backgroundColor: colors.background,
  },
});
