import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { SvgXml } from "react-native-svg";
import { colors } from "@/constants/сolors";
import { Button } from "@/components/Button";
import { GradientWrapper } from "@/components/GradientWrapper";
import ProgressBar from "@/components/ProgressBar";
import {
  beginnerIcon,
  intermediateIcon,
  advancedIcon,
  checkIcon,
} from "@/lib/icon";
import { GoalData } from "./goal";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      style={styles.levelOptionGradient}
    >
      <View style={styles.levelOption}>
        <View style={styles.levelOptionContent}>
          <View style={styles.iconContainer}>
            <SvgXml xml={icon} width={24} height={24} />
          </View>
          <View style={styles.levelOptionText}>
            <Text style={styles.levelOptionLabel}>{label}</Text>
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

const getIconByType = (type: LevelData["type"]) => {
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

export default function LevelScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);

  const goalData = {
    index: Number(params.goalIndex),
    type: params.goalType,
    label: params.goalLabel,
  };

  const handleNext = async () => {
    if (selectedLevel) {
      await AsyncStorage.setItem(
        "user_level_id",
        (selectedLevel.index + 1).toString()
      );

      router.push({
        pathname: "/(auth)/test-workout",
        params: {
          goalIndex: goalData.index,
          goalType: goalData.type,
          goalLabel: goalData.label,
          levelIndex: selectedLevel.index,
          levelType: selectedLevel.type,
          levelLabel: selectedLevel.label,
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
        currentStep={2}
        totalSteps={2}
        onBack={() => router.back()}
      />
      <View style={styles.content}>
        {/* Используем компонент ProgressBar */}

        <Text style={styles.title}>Indicate your training level?</Text>

        <View style={styles.optionsContainer}>
          {levelOptions.map((level) => (
            <LevelOption
              key={level.index}
              icon={getIconByType(level.type)}
              label={level.label}
              description={level.description}
              isSelected={selectedLevel?.index === level.index}
              onSelect={() => setSelectedLevel(level)}
            />
          ))}
        </View>
      </View>

      <View style={styles.buttonWrapper}>
        <Button onPress={handleNext} disabled={!selectedLevel} title="Next" />
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
    textAlign: "center",
  },
  optionsContainer: {
    gap: 10,
    marginBottom: 100,
  },
  levelOptionGradient: {
    borderRadius: 16,
    padding: 1,
  },
  levelOption: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 15,
  },
  levelOptionContent: {
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
  levelOptionText: {
    flex: 1,
  },
  levelOptionLabel: {
    fontSize: 17,
    color: colors.black,
    fontWeight: "600",
    marginBottom: 4,
  },
  levelOptionDescription: {
    fontSize: 15,
    color: colors.textSecondary,
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
