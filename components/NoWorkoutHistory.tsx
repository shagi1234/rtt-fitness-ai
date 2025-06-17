import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SvgXml } from "react-native-svg";
import { GradientWrapper } from "./GradientWrapper";
import { colors } from "@/constants/сolors";

interface NoWorkoutHistoryProps {
  icon: string; // SVG строка для иконки
}

export const NoWorkoutHistory: React.FC<NoWorkoutHistoryProps> = ({ icon }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <SvgXml xml={icon} width={32} height={32} style={styles.icon} />
        <Text style={styles.title}>No workout history yet</Text>
        <Text style={styles.description}>
          Complete workouts and track your progress here
        </Text>
        <View style={styles.buttonContainer}>
          <GradientWrapper
            style={styles.button}
            onPress={() => router.push("/(tabs)/workouts")}
          >
            <Text style={styles.buttonText}>Select a workout</Text>
          </GradientWrapper>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  content: {
    padding: 16,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
    color: colors.black,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
    letterSpacing: 0,
    color: colors.black,
    marginBottom: 12,
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 100,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0,
  },
});

export default NoWorkoutHistory;
