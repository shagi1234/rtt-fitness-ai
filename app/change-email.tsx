import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { colors } from "@/constants/сolors";
import { authService } from "@/lib/api/services/authService";

export default function ChangeEmailScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Валидация email с помощью регулярного выражения
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleConfirm = async () => {
    // Проверка валидности email
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Отправляем запрос на смену email
      const response = await authService.changeEmail(email);

      // Если успешно, перенаправляем на новую страницу подтверждения в папке profile
      router.push({
        pathname: "/(tabs)/profile/confirmation",
        params: {
          email: email,
        },
      });
    } catch (error) {
      console.error("Failed to change email:", error);

      // Показываем уведомление об ошибке
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to change email. Please try again.");
      }

      Alert.alert("Error", "Failed to change email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header showBack />

      <View style={styles.content}>
        <Text style={styles.title}>New email</Text>
        <Text style={styles.subtitle}>
          We will send a confirmation code to your new email.
        </Text>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your new email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            error={error}
            touched={!!error}
          />

          <Button
            title="Confirm"
            onPress={handleConfirm}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: "30%",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: "#000000",
    marginBottom: 32,
  },
  form: {
    gap: 32,
  },
  input: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderColor: "#06E28A",
  },
  confirmButton: {
    height: 56,
    borderRadius: 16,
  },
});
