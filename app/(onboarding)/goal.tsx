import type React from "react";

import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { SvgXml } from "react-native-svg";
import { colors } from "@/constants/сolors";
import { Button } from "@/components/Button";
import { GradientWrapper } from "@/components/GradientWrapper";
import ProgressBar from "@/components/ProgressBar";
import { checkIcon, heartIcon, rukaIcon, vesyIcon } from "@/lib/icon";
import { SafeAreaView } from "react-native-safe-area-context";

export type MuscleGroupData = {
  id: string;
  type: string;
  label: string;
  icon: string;
};

// Определяем группы мышц с правильными SVG-иконками
const muscleGroupOptions: MuscleGroupData[] = [
  {
    id: "0",
    type: "maintain",
    label: "Arm",
    icon: heartIcon,
  },
  {
    id: "1",
    type: "shoulder",
    label: "Shoulder",
    icon: vesyIcon,
  },
  {
    id: "2",
    type: "chest",
    label: "Chest",
    icon: rukaIcon,
  },
  {
    id: "3",
    type: "abs",
    label: "Abs",
    icon: rukaIcon,
  },
  {
    id: "4",
    type: "leg",
    label: "Leg",
    icon: rukaIcon,
  },
  {
    id: "5",
    type: "full_body",
    label: "Full Body",
    icon: rukaIcon,
  },
];

interface MuscleGroupOptionProps {
  group: MuscleGroupData;
  isSelected: boolean;
  onSelect: () => void;
}

// Компонент для отображения опции группы мышц в стиле quiz/goal.tsx
const MuscleGroupOption = ({
  group,
  isSelected,
  onSelect,
}: MuscleGroupOptionProps) => (
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
            <SvgXml xml={group.icon} width={24} height={24} />
          </View>
          <Text style={styles.goalOptionLabel}>{group.label}</Text>
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

export default function GoalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // Используем массив для хранения выбранных групп мышц
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<
    MuscleGroupData[]
  >([
    muscleGroupOptions[0], // По умолчанию выбрана первая группа
  ]);

  const handleToggleSelect = (group: MuscleGroupData) => {
    // Особая логика для "Full Body"
    if (group.type === "full_body") {
      // Если выбран "Full Body", очищаем все остальные выборы
      setSelectedMuscleGroups([group]);
      return;
    }

    // Проверяем, содержит ли текущий выбор "Full Body"
    const hasFullBody = selectedMuscleGroups.some(
      (g) => g.type === "full_body"
    );
    if (hasFullBody) {
      // Если был выбран "Full Body", и теперь выбрана другая группа,
      // удаляем "Full Body" и добавляем только новую группу
      setSelectedMuscleGroups([group]);
      return;
    }

    // Обычная логика множественного выбора
    const isAlreadySelected = selectedMuscleGroups.some(
      (g) => g.id === group.id
    );

    if (isAlreadySelected) {
      // Удаляем группу, если она уже выбрана, но только если останется хотя бы одна выбранная группа
      if (selectedMuscleGroups.length > 1) {
        setSelectedMuscleGroups((prev) =>
          prev.filter((g) => g.id !== group.id)
        );
      }
    } else {
      // Добавляем группу к выбранным
      setSelectedMuscleGroups((prev) => [...prev, group]);
    }
  };

  const handleNext = () => {
    if (selectedMuscleGroups.length > 0) {
      // Получаем текущий вес из params
      const currentWeight = Number(params.weight) || 70;

      // Вычисляем целевой вес на основе типа тренировки
      // Используем среднее значение для нескольких выбранных групп или логику для конкретной группы
      let goalWeight = currentWeight;

      // Проверяем наличие определенных групп в выбранных
      const hasAbsOrFullBody = selectedMuscleGroups.some(
        (g) => g.type === "abs" || g.type === "full_body"
      );

      const hasChestOrShoulder = selectedMuscleGroups.some(
        (g) => g.type === "chest" || g.type === "shoulder"
      );

      if (hasAbsOrFullBody) {
        goalWeight = Math.max(50, currentWeight - 5);
      } else if (hasChestOrShoulder) {
        goalWeight = currentWeight + 5;
      }

      // Формируем массив типов групп мышц
      const muscleGroupTypes = selectedMuscleGroups.map((g) => g.type);

      // Для параметров используем первую выбранную группу для совместимости
      const primaryGroup = selectedMuscleGroups[0];

      router.push({
        pathname: "/(onboarding)/notifications",
        params: {
          ...params,
          muscleGroups: JSON.stringify(muscleGroupTypes),
          goalWeight: Math.round(goalWeight).toString(),
          muscleGroupId: primaryGroup.id,
          muscleGroupType: primaryGroup.type,
          muscleGroupLabel: primaryGroup.label,
          // Добавляем информацию о количестве выбранных групп
          muscleGroupCount: selectedMuscleGroups.length.toString(),
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
        currentStep={4}
        totalSteps={5}
        onBack={() => router.back()}
      />
      <View style={styles.content}>
        <Text style={styles.title}>
          Which muscle group do you want to focus on?
        </Text>

        <Text style={styles.subtitle}>You can select multiple options</Text>

        <View style={styles.optionsContainer}>
          {muscleGroupOptions.map((group) => (
            <MuscleGroupOption
              key={group.id}
              group={group}
              isSelected={selectedMuscleGroups.some((g) => g.id === group.id)}
              onSelect={() => handleToggleSelect(group)}
            />
          ))}
        </View>
      </View>

      <View style={styles.buttonWrapper}>
        <Button
          onPress={handleNext}
          disabled={selectedMuscleGroups.length === 0}
          title="Next"
        />
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
    marginBottom: 8,
    paddingHorizontal: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    paddingHorizontal: 8,
    textAlign: "center",
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
