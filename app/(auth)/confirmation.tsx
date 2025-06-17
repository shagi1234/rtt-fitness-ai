import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Platform,
  Dimensions,
  Alert,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SvgXml } from "react-native-svg";
import { headphonesIcon } from "@/lib/icon";
import { colors } from "@/constants/сolors";
import api from "@/lib/api";
import Header from "@/components/Header";
import { GradientWrapper } from "@/components/GradientWrapper";
import { useAuth } from "@/lib/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "@/lib/api/services/authService";

const CODE_LENGTH = 6;
const INITIAL_COUNTDOWN = 60;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BOX_SIZE = Math.min(56, (SCREEN_WIDTH - 96) / 6);

interface CodeBoxProps {
  value: string;
  isActive: boolean;
  isError: boolean;
}

const CodeBox = ({ value, isActive, isError }: CodeBoxProps) => {
  return (
    <GradientWrapper style={styles.codeBoxGradient}>
      <View style={styles.codeBoxInner}>
        {isActive && !value ? (
          <View style={styles.cursor} />
        ) : (
          <Text style={[styles.codeText, isError && styles.codeTextError]}>
            {value}
          </Text>
        )}
      </View>
    </GradientWrapper>
  );
};

export default function Confirmation() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email, goal_id, level_id, password, is_reset_password } = params;
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<TextInput>(null);
  const { login } = useAuth();

  // Определяем, используется ли страница для сброса пароля
  const isPasswordReset = is_reset_password === "true";

  useEffect(() => {
    startTimer();
    inputRef.current?.focus();
    return () => clearInterval(timerRef.current);
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    setCountdown(INITIAL_COUNTDOWN);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetCodeInput = () => {
    setCode("");
    setIsError(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Обработчик подтверждения для обычной регистрации
  const handleRegisterConfirmation = async (completeCode: string) => {
    if (!email) {
      setIsError(true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.auth.confirmEmail(
        email.toString(),
        completeCode
      );

      if (response.message === "new email confirmed") {
        if (response.access_token && response.refresh_token) {
          await Promise.all([
            AsyncStorage.setItem("user_goal_id", String(Number(goal_id) || 1)),
            AsyncStorage.setItem(
              "user_level_id",
              String(Number(level_id) || 1)
            ),
          ]);

          await login(response.access_token, response.refresh_token);
          router.replace("/(onboarding)/setup-intro");
        }
      } else {
        resetCodeInput();
      }
    } catch (error) {
      console.error("Confirmation error:", error);
      resetCodeInput();
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик подтверждения для сброса пароля
  const handleResetPasswordConfirmation = async (completeCode: string) => {
    if (!email || !password) {
      setIsError(true);
      return;
    }

    try {
      setIsLoading(true);

      // Отправляем данные для сброса пароля
      const response = await authService.resetPassword(
        email.toString(),
        password.toString(),
        completeCode
      );

      // Проверяем сообщение об успешном изменении пароля
      if (response.message === "password successfully changed") {
        // Если успешно сбросили пароль
        Alert.alert(
          "Success",
          "Your password has been successfully reset. Please login with your new password.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/login"),
            },
          ]
        );
      } else {
        resetCodeInput();
      }
    } catch (error) {
      console.error("Password reset confirmation error:", error);
      resetCodeInput();
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = async (completeCode: string) => {
    // Выбираем нужный обработчик в зависимости от сценария использования
    if (isPasswordReset) {
      await handleResetPasswordConfirmation(completeCode);
    } else {
      await handleRegisterConfirmation(completeCode);
    }
  };

  const handleCodeChange = (text: string) => {
    // Очищаем от нецифровых символов
    const numericText = text.replace(/[^0-9]/g, "");

    // Если пользователь вставил полный код одним действием
    if (numericText.length > CODE_LENGTH) {
      // Берем только первые CODE_LENGTH цифр
      const truncatedCode = numericText.substring(0, CODE_LENGTH);
      setIsError(false);
      setCode(truncatedCode);

      // Если длина равна требуемой, отправляем на проверку
      handleConfirmation(truncatedCode);
      return;
    }

    // Обычная обработка ввода
    if (numericText.length <= CODE_LENGTH) {
      setIsError(false);
      setCode(numericText);

      if (numericText.length === CODE_LENGTH) {
        handleConfirmation(numericText);
      }
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || isResending || !email) return;

    try {
      setIsResending(true);
      const response = await api.auth.resendPassword(email.toString());

      if (response.message === "password sended to your email") {
        startTimer();
        setCode("");
        setIsError(false);
        inputRef.current?.focus();
        Alert.alert("Success", "A new code has been sent to your email");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to resend code"
      );
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) =>
    `${seconds.toString().padStart(2, "0")}`;

  return (
    <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
      <SafeAreaView
        style={styles.container}
        edges={Platform.OS === "ios" ? ["top"] : []}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header
          showBack
          rightContent={<SvgXml xml={headphonesIcon} width={24} height={24} />}
        />

        <View style={styles.content}>
          <Text style={styles.title}>
            {isPasswordReset ? "Reset Password" : "Confirmation"}
          </Text>
          <Text style={styles.subtitle}>
            We have sent a confirmation code to{"\n"}
            <Text style={styles.email}>{email}</Text>
          </Text>

          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleCodeChange}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              style={styles.hiddenInput}
              editable={!isLoading}
              autoFocus
            />

            <View style={styles.codeContainer}>
              {Array(CODE_LENGTH)
                .fill(0)
                .map((_, index) => (
                  <CodeBox
                    key={index}
                    value={code[index] || ""}
                    isActive={index === code.length}
                    isError={isError}
                  />
                ))}
            </View>

            {isError && <Text style={styles.errorText}>Incorrect code</Text>}

            <Text
              style={[
                countdown > 0 ? styles.timerText : styles.resendText,
                (isLoading || isResending) && styles.textDisabled,
              ]}
              onPress={handleResendCode}
            >
              {countdown > 0
                ? `Send the code again in ${formatTime(countdown)}`
                : "Send code again"}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    marginTop: "30%",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 28,
    letterSpacing: 0,
    color: colors.black,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 20,
    letterSpacing: 0,
    color: colors.black,
  },
  email: {
    fontWeight: "700",
  },
  inputWrapper: {
    alignItems: "center",
    marginTop: 40,
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  codeBoxGradient: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 12,
    padding: 1,
  },
  codeBoxInner: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  codeText: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.black,
  },
  codeTextError: {
    color: "#FF0000",
  },
  errorText: {
    fontSize: 15,
    color: "#FF0000",
    marginTop: 16,
    fontWeight: "500",
  },
  timerText: {
    fontSize: 15,
    color: colors.black,
    marginTop: 32,
  },
  resendText: {
    fontSize: 15,
    color: colors.primary,
    marginTop: 32,
    fontWeight: "500",
  },
  textDisabled: {
    opacity: 0.5,
  },
  cursor: {
    width: 2,
    height: 24,
    backgroundColor: colors.black,
    borderRadius: 1,
  },
});
