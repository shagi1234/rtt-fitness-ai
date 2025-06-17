import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { GradientWrapper } from "./GradientWrapper";
import { colors } from "@/constants/сolors";

export const FeedbackSection = () => {
  return (
    <View style={styles.feedbackSection}>
      <View style={styles.feedbackContent}>
        <Text style={styles.feedbackTitle}>Help us get better</Text>
        <Text style={styles.feedbackDescription}>
          Leave a review or suggestion for the app
        </Text>
        <GradientWrapper
          style={styles.reviewButton}
          onPress={() => router.push("/feedback" as any)}
        >
          <Text style={styles.reviewButtonText}>Leave a review</Text>
        </GradientWrapper>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  feedbackSection: {
    backgroundColor: colors.white,
    borderRadius: 20,
    backdropFilter: "blur(6px)",
    marginTop: 16,
    overflow: "hidden",
    marginHorizontal: 16,
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
    color: colors.textSecondary,
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
