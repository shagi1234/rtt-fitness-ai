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
import Header from "@/components/Header";
import { GradientWrapper } from "@/components/GradientWrapper";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "@/lib/api/services/authService";
import { useAuth } from "@/lib/AuthContext";

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

export default function ProfileConfirmation() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email } = params;
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<TextInput>(null);
  const { login } = useAuth();

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

  // Обработчик подтверждения для смены email
  const handleConfirmNewEmail = async (completeCode: string) => {
    if (!email) {
      setIsError(true);
      return;
    }

    try {
      setIsLoading(true);

      // Используем метод для подтверждения нового email на указанный API эндпоинт
      const response = await authService.confirmNewEmail(
        email.toString(),
        completeCode
      );

      // Проверяем наличие токенов в ответе и успешное сообщение
      if (
        response.access_token &&
        response.refresh_token &&
        response.message === "new email confirmed"
      ) {
        // Обновляем состояние аутентификации с новыми токенами
        await login(response.access_token, response.refresh_token);

        // Если успешно, показываем сообщение и перенаправляем пользователя
        Alert.alert("Success", "Your email has been successfully changed.", [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)/profile"),
          },
        ]);
      } else {
        // Если не получили ожидаемое сообщение или токены
        resetCodeInput();
        Alert.alert(
          "Error",
          "Failed to confirm email change. Please try again."
        );
      }
    } catch (error) {
      console.error("Email change confirmation error:", error);
      resetCodeInput();

      // Показываем сообщение об ошибке
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to confirm email change. Please try again."
      );
    } finally {
      setIsLoading(false);
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
      handleConfirmNewEmail(truncatedCode);
      return;
    }

    // Обычная обработка ввода
    if (numericText.length <= CODE_LENGTH) {
      setIsError(false);
      setCode(numericText);

      if (numericText.length === CODE_LENGTH) {
        handleConfirmNewEmail(numericText);
      }
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || isResending || !email) return;

    try {
      setIsResending(true);

      // Повторно запрашиваем код для подтверждения смены email
      // Используем тот же метод для повторной отправки кода, что и в auth/confirmation
      const response = await authService.resendPassword(email.toString());

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
          <Text style={styles.title}>Change Email</Text>
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
