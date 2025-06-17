import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Check,
  AlertCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react-native";
import { Button } from "@/components/Button";
import ProgressBar from "@/components/ProgressBar";
import { SafeAreaView } from "react-native-safe-area-context";

type Unit = "kg" | "lb";

// Константы для веса
const MIN_WEIGHT_KG = 40;
const MAX_WEIGHT_KG = 150;

// Функции для конвертации между кг и фунтами
const kgToLb = (kg: number): number => {
  return kg * 2.20462;
};

const lbToKg = (lb: number): number => {
  return lb / 2.20462;
};

// Функция для расчета ИМТ
const calculateBMI = (weightKg: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
};

// Получение статуса ИМТ
const getBMIStatus = (
  bmi: number
): {
  message: string;
  isNormal: boolean;
} => {
  if (bmi < 18.5) {
    return {
      message: `Your current BMI - ${bmi.toFixed(
        0
      )}, which is lower than normal, but with us you can easily get into the shape you want!`,
      isNormal: false,
    };
  } else if (bmi >= 18.5 && bmi < 25) {
    return {
      message: `Your current BMI - ${bmi.toFixed(
        0
      )}, which is within the normal range, so keep it up!`,
      isNormal: true,
    };
  } else {
    return {
      message: `Your current BMI - ${bmi.toFixed(
        0
      )}, which is higher than normal, but with us you can easily get into the shape you want!`,
      isNormal: false,
    };
  }
};

// Функция для обработки клика на кнопки увеличения/уменьшения веса
const handleWeightChange = (
  weight: number,
  increment: boolean,
  unit: Unit
): number => {
  if (unit === "kg") {
    // Для килограммов изменяем на 0.5 кг
    const newWeight = increment ? weight + 0.5 : weight - 0.5;
    return Math.min(Math.max(newWeight, MIN_WEIGHT_KG), MAX_WEIGHT_KG);
  } else {
    // Для фунтов изменяем на 1 фунт
    const weightKg = weight;
    const weightLb = kgToLb(weightKg);
    const newWeightLb = increment ? weightLb + 1 : weightLb - 1;
    const newWeightKg = lbToKg(newWeightLb);

    // Проверяем ограничения в кг
    return Math.min(Math.max(newWeightKg, MIN_WEIGHT_KG), MAX_WEIGHT_KG);
  }
};

// Компонент переключения единиц измерения
const UnitToggle = ({
  unit,
  onToggle,
}: {
  unit: Unit;
  onToggle: () => void;
}) => (
  <View style={styles.unitToggleContainer}>
    <TouchableOpacity
      style={[
        styles.unitToggleButton,
        unit === "kg" && styles.unitToggleButtonActive,
      ]}
      onPress={() => unit === "lb" && onToggle()}
    >
      <Text
        style={[
          styles.unitToggleText,
          unit === "kg" && styles.unitToggleTextActive,
        ]}
      >
        kg
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[
        styles.unitToggleButton,
        unit === "lb" && styles.unitToggleButtonActive,
      ]}
      onPress={() => unit === "kg" && onToggle()}
    >
      <Text
        style={[
          styles.unitToggleText,
          unit === "lb" && styles.unitToggleTextActive,
        ]}
      >
        lb
      </Text>
    </TouchableOpacity>
  </View>
);

// Компонент для кнопок "быстрого" выбора веса
const WeightPresets = ({
  value,
  onChange,
  unit,
}: {
  value: number;
  onChange: (val: number) => void;
  unit: Unit;
}) => {
  // Пресеты в кг
  const kgPresets = [40, 60, 80, 100, 120];

  // Получаем метку и значение для пресета
  const getPresetLabel = (index: number): string => {
    if (unit === "kg") {
      return kgPresets[index].toString();
    } else {
      return Math.round(kgToLb(kgPresets[index])).toString();
    }
  };

  const getPresetValue = (index: number): number => {
    return kgPresets[index];
  };

  // Проверяем, активен ли пресет
  const isPresetActive = (presetIndex: number): boolean => {
    const presetValue = getPresetValue(presetIndex);
    if (unit === "kg") {
      // Для кг проверяем с точностью до 2 кг
      return Math.abs(value - presetValue) < 2;
    } else {
      // Для фунтов проверяем с точностью до 4 фунтов
      return Math.abs(kgToLb(value) - kgToLb(presetValue)) < 4;
    }
  };

  return (
    <View style={styles.presetsContainer}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Pressable
          key={index}
          style={[
            styles.presetButton,
            isPresetActive(index) && styles.presetButtonActive,
          ]}
          onPress={() => onChange(getPresetValue(index))}
        >
          <Text
            style={[
              styles.presetText,
              isPresetActive(index) && styles.presetTextActive,
            ]}
          >
            {getPresetLabel(index)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

export default function WeightScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [unit, setUnit] = useState<Unit>("kg");
  const [weight, setWeight] = useState(67);

  // Получаем рост из параметров
  const height = Number(params.height) || 173;

  const bmi = calculateBMI(weight, height);
  const bmiStatus = getBMIStatus(bmi);

  const handleUnitToggle = () => {
    setUnit(unit === "kg" ? "lb" : "kg");
  };

  const handleNext = () => {
    router.push({
      pathname: "/(onboarding)/goal",
      params: {
        ...params, // Передаем параметры с предыдущих страниц
        weight: Math.round(weight).toString(), // Вес всегда в кг
      },
    });
  };

  // Форматирование отображаемого веса
  const displayWeight = (): string => {
    if (unit === "kg") {
      return weight.toFixed(1).replace(/\.0$/, "");
    } else {
      return Math.round(kgToLb(weight)).toString();
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={Platform.OS === "ios" ? ["top"] : []}
    >
      <View style={styles.container}>
        <ProgressBar
          currentStep={3}
          totalSteps={5}
          onBack={() => router.back()}
        />

        <View style={styles.content}>
          <Text style={styles.title}>What is your weight?</Text>

          <View
            style={[
              styles.bmiContainer,
              bmiStatus.isNormal
                ? styles.bmiContainerSuccess
                : styles.bmiContainerWarning,
            ]}
          >
            <View
              style={[
                styles.bmiIconContainer,
                bmiStatus.isNormal
                  ? styles.bmiIconSuccess
                  : styles.bmiIconWarning,
              ]}
            >
              {bmiStatus.isNormal ? (
                <Check size={24} color="#00E087" />
              ) : (
                <AlertCircle size={24} color="#FF3B30" />
              )}
            </View>
            <Text
              style={[
                styles.bmiMessage,
                bmiStatus.isNormal
                  ? styles.bmiMessageSuccess
                  : styles.bmiMessageWarning,
              ]}
            >
              {bmiStatus.message}
            </Text>
          </View>

          <UnitToggle unit={unit} onToggle={handleUnitToggle} />

          {/* Блок выбора веса с кнопками + и - */}
          <View style={styles.weightSelectorContainer}>
            <TouchableOpacity
              style={styles.weightAdjustButton}
              onPress={() => setWeight(handleWeightChange(weight, false, unit))}
            >
              <ChevronDown size={28} color="#666666" />
            </TouchableOpacity>

            <View style={styles.weightDisplayContainer}>
              <Text style={styles.weightValue}>{displayWeight()}</Text>
              <Text style={styles.weightUnit}>{unit}</Text>
            </View>

            <TouchableOpacity
              style={styles.weightAdjustButton}
              onPress={() => setWeight(handleWeightChange(weight, true, unit))}
            >
              <ChevronUp size={28} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* Пресеты для быстрого выбора распространенных значений веса */}
          <WeightPresets value={weight} onChange={setWeight} unit={unit} />

          {/* Цветовая шкала для визуализации */}
          <View style={styles.scaleContainer}>
            <View style={styles.scaleBar}>
              <View
                style={[
                  styles.scaleActive,
                  {
                    width: `${
                      ((weight - MIN_WEIGHT_KG) /
                        (MAX_WEIGHT_KG - MIN_WEIGHT_KG)) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleLabel}>
                {unit === "kg"
                  ? MIN_WEIGHT_KG
                  : Math.round(kgToLb(MIN_WEIGHT_KG))}
              </Text>
              <Text style={styles.scaleLabel}>
                {unit === "kg"
                  ? MAX_WEIGHT_KG
                  : Math.round(kgToLb(MAX_WEIGHT_KG))}
              </Text>
            </View>
          </View>
        </View>

        <Button title="Next" onPress={handleNext} style={styles.buttonStyle} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 24,
    textAlign: "center",
  },
  bmiContainer: {
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginBottom: 40,
  },
  bmiContainerSuccess: {
    backgroundColor: "rgba(0, 224, 135, 0.1)",
  },
  bmiContainerWarning: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  bmiIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  bmiIconSuccess: {
    backgroundColor: "rgba(0, 224, 135, 0.1)",
  },
  bmiIconWarning: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  bmiMessage: {
    fontSize: 17,
    lineHeight: 22,
    textAlign: "center",
    fontWeight: "400",
  },
  bmiMessageSuccess: {
    color: "#00E087",
  },
  bmiMessageWarning: {
    color: "#FF3B30",
  },
  unitToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 100,
    padding: 2,
    marginBottom: 40,
    alignSelf: "center",
    width: 170,
  },
  unitToggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 100,
    flex: 1,
    alignItems: "center",
  },
  unitToggleButtonActive: {
    backgroundColor: "#00E087",
  },
  unitToggleText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#666666",
  },
  unitToggleTextActive: {
    color: "#FFFFFF",
  },
  weightSelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  weightAdjustButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F6F6F6",
    alignItems: "center",
    justifyContent: "center",
  },
  weightDisplayContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  weightValue: {
    fontSize: 62,
    fontWeight: "700",
    color: "#000000",
    lineHeight: 70,
  },
  weightUnit: {
    fontSize: 42,
    color: "#000000",
    fontWeight: "400",
    marginBottom: 10,
    marginLeft: 8,
  },
  presetsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  presetButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: "#F6F6F6",
    minWidth: 60,
    alignItems: "center",
  },
  presetButtonActive: {
    backgroundColor: "#00E08722",
  },
  presetText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  presetTextActive: {
    color: "#00E087",
    fontWeight: "600",
  },
  scaleContainer: {
    marginBottom: 20,
  },
  scaleBar: {
    height: 8,
    backgroundColor: "#F6F6F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  scaleActive: {
    height: "100%",
    backgroundColor: "#00E087",
    borderRadius: 4,
  },
  scaleLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  scaleLabel: {
    fontSize: 14,
    color: "#666666",
  },
  buttonStyle: {
    marginHorizontal: 20,
    marginBottom: Platform.OS === "ios" ? 34 : 24,
  },
});
