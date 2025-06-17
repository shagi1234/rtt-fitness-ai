import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export type WorkoutHistoryItem = {
  workout_desc_img: string;
  title: string;
  trained_date: string;
  total_minutes: number;
};

interface WorkoutHistoryListProps {
  workouts: WorkoutHistoryItem[];
}

export const WorkoutHistoryList: React.FC<WorkoutHistoryListProps> = ({
  workouts,
}) => {
  return (
    <View style={styles.workoutHistoryList}>
      {workouts.map((workout, index) => (
        <View key={index} style={styles.workoutHistoryItem}>
          <Image
            source={{ uri: workout.workout_desc_img }}
            style={styles.workoutHistoryImage}
          />
          <View style={styles.workoutHistoryInfo}>
            <Text style={styles.workoutHistoryName}>{workout.title}</Text>
            <View style={styles.workoutHistoryMeta}>
              <Text style={styles.workoutHistoryDate}>
                {new Date(workout.trained_date).toLocaleDateString()},
                {new Date(workout.trained_date).toLocaleTimeString()}
              </Text>
              <Text style={styles.workoutHistoryDuration}>
                {workout.total_minutes} min
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  workoutHistoryList: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  workoutHistoryItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
    alignItems: "center",
  },
  workoutHistoryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  workoutHistoryInfo: {
    flex: 1,
  },
  workoutHistoryName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 4,
  },
  workoutHistoryMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  workoutHistoryDate: {
    fontSize: 14,
    color: "#666666",
    marginRight: 8,
  },
  workoutHistoryDuration: {
    fontSize: 14,
    color: "#666666",
  },
});
