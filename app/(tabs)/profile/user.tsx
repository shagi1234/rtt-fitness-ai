import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/сolors";
import { GradientWrapper } from "@/components/GradientWrapper";
import { useProfile } from "@/lib/ProfileContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "@/components/Header";
import { Input } from "@/components/Input";
import { userService } from "@/lib/api/services/userService";

export default function UserScreen() {
  const router = useRouter();
  const { profile, refreshProfile } = useProfile();
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    goalWeight: "",
  });
  const [originalData, setOriginalData] = useState({
    age: "",
    height: "",
    weight: "",
    goalWeight: "",
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Всегда обновляем formData и originalData при изменении profile
  useEffect(() => {
    if (profile) {
      const data = {
        age: profile.age ? profile.age.toString() : "",
        height: profile.height ? profile.height.toString() : "",
        weight: profile.weight ? profile.weight.toString() : "",
        goalWeight: profile.goal_weight ? profile.goal_weight.toString() : "",
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [profile]);

  // Проверка на наличие изменений
  useEffect(() => {
    setHasChanges(
      formData.age !== originalData.age ||
        formData.height !== originalData.height ||
        formData.weight !== originalData.weight ||
        formData.goalWeight !== originalData.goalWeight
    );
  }, [formData, originalData]);

  // Обработчик изменения формы
  const handleChange = (field: keyof typeof formData) => (text: string) => {
    setFormData((prev) => ({ ...prev, [field]: text }));
  };

  // Обработчик сохранения данных
  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      // Формируем данные для отправки
      const userData = {
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        goal_weight: formData.goalWeight
          ? parseFloat(formData.goalWeight)
          : null,
      };

      // Отправляем PATCH запрос через userService
      await userService.updateUserPhysicalData(userData);

      // Обновляем профиль из API
      await refreshProfile();

      Alert.alert("Success", "User data updated successfully");
    } catch (error) {
      console.error("Error saving user data:", error);
      Alert.alert("Error", "Failed to update user data");
    } finally {
      setIsSaving(false);
    }
  }, [formData, hasChanges, refreshProfile]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        showBack
        rightContent={
          hasChanges ? (
            <GradientWrapper
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </GradientWrapper>
          ) : undefined
        }
      />

      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>User</Text>

        <View style={styles.formGroup}>
          <Input
            label="Age"
            value={formData.age}
            onChangeText={handleChange("age")}
            placeholder="Enter your age"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Input
            label="Height"
            value={formData.height}
            onChangeText={handleChange("height")}
            placeholder="Enter your height in meters"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Input
            label="Weight"
            value={formData.weight}
            onChangeText={handleChange("weight")}
            placeholder="Enter your current weight in kg"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Input
            label="Goal weight"
            value={formData.goalWeight}
            onChangeText={handleChange("goalWeight")}
            placeholder="Enter your goal weight in kg"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 32,
    marginTop: 12,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 10,
    color: "#000",
  },
  input: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 14,
    letterSpacing: 0,
  },
});
