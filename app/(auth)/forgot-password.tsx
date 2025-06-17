import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { headphonesIcon } from "@/lib/icon";
import { SvgXml } from "react-native-svg";
import { Input } from "@/components/Input";
import Header from "@/components/Header";
import { colors } from "@/constants/сolors";
import { Button } from "@/components/Button";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "@/lib/api/services/authService";

interface FormData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

interface TouchedFields {
  email: boolean;
  newPassword: boolean;
  confirmPassword: boolean;
}

const validateEmail = (email: string): string => {
  if (!email) return "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email";
  }
  return "";
};

const validatePassword = (password: string): string => {
  if (!password) return "";
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  return "";
};

const validateConfirmPassword = (
  confirmPassword: string,
  password: string
): string => {
  if (!confirmPassword) return "";
  if (confirmPassword !== password) {
    return "Passwords do not match";
  }
  return "";
};

export default function ForgotPassword() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    if (touched[field]) {
      const newError = (() => {
        switch (field) {
          case "email":
            return validateEmail(value);
          case "newPassword":
            return validatePassword(value);
          case "confirmPassword":
            return validateConfirmPassword(value, newFormData.newPassword);
          default:
            return "";
        }
      })();
      setErrors((prev) => ({ ...prev, [field]: newError }));
    }

    setResetError(null);
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = (() => {
      switch (field) {
        case "email":
          return validateEmail(formData.email);
        case "newPassword":
          return validatePassword(formData.newPassword);
        case "confirmPassword":
          return validateConfirmPassword(
            formData.confirmPassword,
            formData.newPassword
          );
        default:
          return "";
      }
    })();
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleResetPassword = async () => {
    const emailError = validateEmail(formData.email);
    const newPasswordError = validatePassword(formData.newPassword);
    const confirmPasswordError = validateConfirmPassword(
      formData.confirmPassword,
      formData.newPassword
    );

    setErrors({
      email: emailError,
      newPassword: newPasswordError,
      confirmPassword: confirmPasswordError,
    });
    setTouched({
      email: true,
      newPassword: true,
      confirmPassword: true,
    });

    if (emailError || newPasswordError || confirmPasswordError) return;

    try {
      setIsLoading(true);
      setResetError(null);

      // Отправляем запрос на получение кода подтверждения
      const response = await authService.resendPassword(formData.email);

      // Проверяем успешность запроса
      if (response.message === "password sended to your email") {
        // Перенаправляем на страницу подтверждения с передачей данных
        router.replace({
          pathname: "/confirmation",
          params: {
            email: formData.email,
            password: formData.newPassword,
            is_reset_password: "true",
          },
        });
      } else {
        setResetError("Failed to send confirmation code");
      }
    } catch (error) {
      if (error instanceof Error) {
        setResetError(error.message);
      } else {
        setResetError("Failed to reset password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    Object.values(formData).every((value) => value !== "") &&
    Object.values(errors).every((error) => error === "");

  return (
    <SafeAreaView
      style={styles.container}
      edges={Platform.OS === "ios" ? ["top"] : []}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        behavior={"padding"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Header
            showBack
            rightContent={
              <SvgXml xml={headphonesIcon} width={24} height={24} />
            }
          />
          <View style={styles.content}>
            <Text style={styles.title}>Sign In</Text>

            {resetError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{resetError}</Text>
              </View>
            )}

            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                onBlur={() => handleBlur("email")}
                error={errors.email}
                touched={touched.email}
                editable={!isLoading}
              />

              <Input
                label="New password"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChangeText={(text) => handleInputChange("newPassword", text)}
                onBlur={() => handleBlur("newPassword")}
                error={errors.newPassword}
                touched={touched.newPassword}
                editable={!isLoading}
                isPassword
              />

              <Input
                label="Confirm password"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  handleInputChange("confirmPassword", text)
                }
                onBlur={() => handleBlur("confirmPassword")}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
                editable={!isLoading}
                isPassword
              />
            </View>

            <Button
              onPress={handleResetPassword}
              disabled={!isFormValid}
              loading={isLoading}
              title="Change password"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    marginTop: 32,
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  form: {
    gap: 24,
    marginBottom: 32,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    marginTop: 4,
  },
});
