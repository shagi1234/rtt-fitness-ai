import React from "react";
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { GradientWrapper } from "@/components/GradientWrapper";
import { colors } from "@/constants/сolors";
// import { logEvent } from "@/lib/firebase";

interface ButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  title: string;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  disabled = false,
  loading = false,
  title,
  style,
}) => {
  // const handlePress = () => {
  //   // Логируем событие при нажатии на кнопку
  //   logEvent("button_press", { button_title: title });

  //   // Вызываем оригинальный обработчик
  //   if (onPress) {
  //     onPress();
  //   }
  // };

  return (
    <GradientWrapper
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, style]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </GradientWrapper>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
  },
});
