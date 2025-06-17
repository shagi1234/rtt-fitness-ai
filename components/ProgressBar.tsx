import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { GradientWrapper } from "@/components/GradientWrapper";
import { colors } from "@/constants/сolors";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  showBackButton?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  onBack,
  showBackButton = true,
}) => {
  // Вычисляем процент прогресса
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.progressContainer}>
      {showBackButton && (
        <Pressable onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={20} color={colors.black} />
        </Pressable>
      )}
      <View style={styles.progressBar}>
        <GradientWrapper
          style={[styles.progressFill, { width: `${progressPercentage}%` }]}
        >
          <View />
        </GradientWrapper>
      </View>
      <View style={styles.progressText}>
        <Text style={styles.progressTextCurrent}>{currentStep}</Text>
        <Text style={styles.progressTextSeparator}>/</Text>
        <Text style={styles.progressTextTotal}>{totalSteps}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 32,
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(1, 1, 1, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "rgb(221, 223, 228)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressTextCurrent: {
    fontSize: 16,
    color: colors.black,
    fontWeight: "600",
    lineHeight: 22,
  },
  progressTextSeparator: {
    fontSize: 16,
    color: colors.textSecondary,
    marginHorizontal: 4,
    lineHeight: 22,
  },
  progressTextTotal: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default ProgressBar;
