import React, { ReactNode } from "react";
import { StyleSheet, StyleProp, ViewStyle, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface GradientWrapperProps {
  children: ReactNode;
  colors?: [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
}

/**
 * Универсальный компонент-обертка с градиентным фоном
 *
 * @param children - Дочерние элементы, которые будут обернуты градиентом
 * @param colors - Массив цветов для градиента (по умолчанию зеленый градиент)
 * @param start - Начальная точка градиента (по умолчанию { x: 0, y: 0 })
 * @param end - Конечная точка градиента (по умолчанию { x: 1, y: 1 })
 * @param style - Дополнительные стили для контейнера
 * @param onPress - Функция обработки нажатия (опционально)
 * @param disabled - Флаг отключения (для кнопок)
 */
export const GradientWrapper = ({
  children,
  colors = ["#048050", "#06E28A"] as [string, string],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  onPress,
  disabled = false,
}: GradientWrapperProps) => {
  // Если передан onPress, оборачиваем в Pressable
  if (onPress) {
    return (
      <Pressable onPress={onPress} disabled={disabled}>
        <LinearGradient
          colors={colors}
          start={start}
          end={end}
          style={[styles.container, style, disabled && styles.disabled]}
        >
          {children}
        </LinearGradient>
      </Pressable>
    );
  }

  // Иначе просто возвращаем LinearGradient
  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={[styles.container, style, disabled && styles.disabled]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
  },
  disabled: {
    opacity: 0.5,
  },
});
