import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Clock } from "lucide-react-native";
import { GradientWrapper } from "./GradientWrapper";
import { colors } from "@/constants/сolors";
import { useRouter } from "expo-router";

interface SetupProgramCardProps {
  onSetupPress?: () => void;
}

export const SetupProgramCard: React.FC<SetupProgramCardProps> = ({
  onSetupPress,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSetupPress = () => {
    if (isLoading) return;

    if (onSetupPress) {
      onSetupPress();
      return;
    }

    setIsLoading(true);
    // Простой переход на страницу онбординга без всяких флагов
    router.push("/(onboarding)/setup-intro");

    // Сбросим состояние загрузки через короткое время
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <View style={styles.setupCard}>
      <View style={styles.timeTag}>
        <Clock size={16} color={colors.primary} />
        <Text style={styles.timeTagText}>5 minutes</Text>
      </View>

      <Text style={styles.setupTitle}>Let's set up your program</Text>
      <Text style={styles.setupDescription}>
        Provide a few answers about your parameters and goals to personalize the
        program.
      </Text>

      <GradientWrapper
        style={styles.setupButton}
        onPress={handleSetupPress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.setupButtonText}>Set up</Text>
        )}
      </GradientWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  setupCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  timeTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgb(227, 241, 236)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 6,
  },
  timeTagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 14,
    letterSpacing: 0,
    marginLeft: 8,
  },
  setupTitle: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
    color: colors.black,
    marginBottom: 6,
  },
  setupDescription: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
    letterSpacing: 0,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  setupButton: {
    borderRadius: 10,
    paddingVertical: 7,
    alignItems: "center",
    width: "25%",
    minHeight: 32,
    justifyContent: "center",
  },
  setupButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0,
  },
});
