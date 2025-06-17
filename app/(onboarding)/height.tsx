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
  Calculator,
  ChevronUp,
  ChevronDown,
} from "lucide-react-native";
import { Button } from "@/components/Button";
import ProgressBar from "@/components/ProgressBar";
import { SafeAreaView } from "react-native-safe-area-context";

type Unit = "cm" | "ft";

// Константы для роста
const MIN_HEIGHT_CM = 140;
const MAX_HEIGHT_CM = 250;

// Улучшенные функции для конвертации между см и футами/дюймами
const cmToFtIn = (cm: number): string => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  // Корректировка, если дюймы округлились до 12
  if (inches === 12) {
    return `${feet + 1}'0″`;
  }
  return `${feet}'${inches}″`;
};

const ftInToCm = (feet: number, inches: number): number => {
  return Math.round((feet * 12 + inches) * 2.54);
};

// Получаем футы и дюймы из см для работы с ними отдельно
const getCmAsFtIn = (cm: number): { feet: number; inches: number } => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  // Корректировка, если дюймы округлились до 12
  if (inches === 12) {
    return { feet: feet + 1, inches: 0 };
  }
  return { feet, inches };
};

// Функция для обработки клика на кнопки увеличения/уменьшения роста
const handleHeightChange = (
  height: number,
  increment: boolean,
  unit: Unit
): number => {
  if (unit === "cm") {
    // Для сантиметров просто увеличиваем/уменьшаем на 1
    const newHeight = increment ? height + 1 : height - 1;
    return Math.min(Math.max(newHeight, MIN_HEIGHT_CM), MAX_HEIGHT_CM);
  } else {
    // Для футов работаем в дюймах для большей точности
    const { feet, inches } = getCmAsFtIn(height);

    // Вычисляем новые значения в футах и дюймах
    let newInches = increment ? inches + 1 : inches - 1;
    let newFeet = feet;

    // Корректируем переходы между футами и дюймами
    if (newInches >= 12) {
      newInches = 0;
      newFeet += 1;
    } else if (newInches < 0) {
      newInches = 11;
      newFeet -= 1;
    }

    // Проверяем, не выходим ли за пределы допустимых значений
    const newCm = ftInToCm(newFeet, newInches);
    if (newCm < MIN_HEIGHT_CM) {
      return MIN_HEIGHT_CM;
    } else if (newCm > MAX_HEIGHT_CM) {
      return MAX_HEIGHT_CM;
    }

    return newCm;
  }
};

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
        unit === "cm" && styles.unitToggleButtonActive,
      ]}
      onPress={() => unit === "ft" && onToggle()}
    >
      <Text
        style={[
          styles.unitToggleText,
          unit === "cm" && styles.unitToggleTextActive,
        ]}
      >
        cm
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[
        styles.unitToggleButton,
        unit === "ft" && styles.unitToggleButtonActive,
      ]}
      onPress={() => unit === "cm" && onToggle()}
    >
      <Text
        style={[
          styles.unitToggleText,
          unit === "ft" && styles.unitToggleTextActive,
        ]}
      >
        ft
      </Text>
    </TouchableOpacity>
  </View>
);

// Компонент для кнопок "быстрого" выбора роста
const HeightPresets = ({
  value,
  onChange,
  unit,
}: {
  value: number;
  onChange: (val: number) => void;
  unit: Unit;
}) => {
  // Пресеты в см (стандартные значения)
  const cmPresets = [150, 165, 180, 195, 210];

  // Пресеты в футах (точные значения для лучшего соответствия)
  const ftInPresets = [
    { ft: 4, in: 11 }, // 4'11" ~ 150cm
    { ft: 5, in: 5 }, // 5'5" ~ 165cm
    { ft: 5, in: 11 }, // 5'11" ~ 180cm
    { ft: 6, in: 5 }, // 6'5" ~ 195cm
    { ft: 6, in: 11 }, // 6'11" ~ 210cm
  ];

  const getPresetLabel = (index: number) => {
    if (unit === "cm") {
      return cmPresets[index].toString();
    } else {
      const { ft, in: inches } = ftInPresets[index];
      return `${ft}'${inches}″`;
    }
  };

  const getPresetValue = (index: number) => {
    if (unit === "cm") {
      return cmPresets[index];
    } else {
      const { ft, in: inches } = ftInPresets[index];
      return ftInToCm(ft, inches);
    }
  };

  // Проверяем, активен ли пресет (для визуального выделения)
  const isPresetActive = (presetIndex: number) => {
    const presetValue = getPresetValue(presetIndex);
    if (unit === "cm") {
      return value === presetValue;
    } else {
      // Для футов более точное сравнение
      const { feet: valueFeet, inches: valueInches } = getCmAsFtIn(value);
      const { ft: presetFeet, in: presetInches } = ftInPresets[presetIndex];
      return valueFeet === presetFeet && valueInches === presetInches;
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

export default function HeightScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [unit, setUnit] = useState<Unit>("cm");
  const [height, setHeight] = useState(173);

  const handleUnitToggle = () => {
    // При переключении единиц измерения сохраняем текущее значение в см
    setUnit(unit === "cm" ? "ft" : "cm");
  };

  const handleNext = () => {
    // Передаем рост в сантиметрах и данные с предыдущей страницы
    router.push({
      pathname: "/(onboarding)/weight",
      params: {
        ...params, // Передаем параметры с предыдущей страницы
        height: Math.round(height).toString(), // Рост всегда в см
      },
    });
  };

  // Отображаем значение в футах для экрана с правильным форматированием
  const displayFtIn = () => {
    if (unit === "ft") {
      const { feet, inches } = getCmAsFtIn(height);
      return `${feet}'${inches}″`;
    }
    return null;
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={Platform.OS === "ios" ? ["top"] : []}
    >
      <View style={styles.container}>
        <ProgressBar
          currentStep={2}
          totalSteps={5}
          onBack={() => router.back()}
        />

        <View style={styles.content}>
          <Text style={styles.title}>What is your height?</Text>

          <View style={styles.infoContainer}>
            <View style={styles.infoIconContainer}>
              <Calculator size={24} color="#000" />
            </View>
            <Text style={styles.infoText}>
              This data is needed to calculate your body mass index.
            </Text>
          </View>

          <UnitToggle unit={unit} onToggle={handleUnitToggle} />

          {/* Блок выбора роста с кнопками + и - */}
          <View style={styles.heightSelectorContainer}>
            <TouchableOpacity
              style={styles.heightAdjustButton}
              onPress={() => setHeight(handleHeightChange(height, false, unit))}
            >
              <ChevronDown size={28} color="#666666" />
            </TouchableOpacity>

            <View style={styles.heightDisplayContainer}>
              {unit === "cm" ? (
                <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                  <Text style={styles.heightValue}>{Math.round(height)}</Text>
                  <Text style={styles.heightUnit}>cm</Text>
                </View>
              ) : (
                <Text style={styles.heightValue}>{displayFtIn()}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.heightAdjustButton}
              onPress={() => setHeight(handleHeightChange(height, true, unit))}
            >
              <ChevronUp size={28} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* Пресеты для быстрого выбора распространенных значений роста */}
          <HeightPresets value={height} onChange={setHeight} unit={unit} />

          {/* Цветовая шкала для визуализации */}
          <View style={styles.scaleContainer}>
            <View style={styles.scaleBar}>
              <View
                style={[
                  styles.scaleActive,
                  {
                    width: `${
                      ((height - MIN_HEIGHT_CM) /
                        (MAX_HEIGHT_CM - MIN_HEIGHT_CM)) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleLabel}>
                {unit === "cm" ? MIN_HEIGHT_CM : cmToFtIn(MIN_HEIGHT_CM)}
              </Text>
              <Text style={styles.scaleLabel}>
                {unit === "cm" ? MAX_HEIGHT_CM : cmToFtIn(MAX_HEIGHT_CM)}
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
  infoContainer: {
    backgroundColor: "#F6F6F6",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginBottom: 40,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 17,
    color: "#000000",
    lineHeight: 22,
    textAlign: "center",
    fontWeight: "400",
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
  heightSelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  heightAdjustButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F6F6F6",
    alignItems: "center",
    justifyContent: "center",
  },
  heightDisplayContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  heightValue: {
    fontSize: 62,
    fontWeight: "700",
    color: "#000000",
    lineHeight: 70,
  },
  heightUnit: {
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
