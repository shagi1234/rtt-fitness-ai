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
import { useRouter, useLocalSearchParams } from "expo-router";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { headphonesIcon } from "@/lib/icon";
import { SvgXml } from "react-native-svg";
import { Input } from "@/components/Input";
import Header from "@/components/Header";
import { colors } from "@/constants/сolors";
import { Button } from "@/components/Button";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

interface TouchedFields {
  email: boolean;
  name: boolean;
  password: boolean;
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

const validateName = (name: string): string => {
  if (!name) return "";
  if (name.length < 2) {
    return "Name must be at least 2 characters";
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

export default function Register() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
    name: false,
    password: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );

  const handleInputChange = (field: keyof FormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    if (touched[field]) {
      const newError = (() => {
        switch (field) {
          case "email":
            return validateEmail(value);
          case "name":
            return validateName(value);
          case "password":
            return validatePassword(value);
          case "confirmPassword":
            return validateConfirmPassword(value, newFormData.password);
          default:
            return "";
        }
      })();
      setErrors((prev) => ({ ...prev, [field]: newError }));
    }

    // Clear email already registered error when email changes
    if (field === "email" && errors.email === "Email already registered") {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }

    setRegistrationError(null);
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = (() => {
      switch (field) {
        case "email":
          return validateEmail(formData.email);
        case "name":
          return validateName(formData.name);
        case "password":
          return validatePassword(formData.password);
        case "confirmPassword":
          return validateConfirmPassword(
            formData.confirmPassword,
            formData.password
          );
        default:
          return "";
      }
    })();
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleRegister = async () => {
    // Validate all fields
    const newErrors = {
      email: validateEmail(formData.email),
      name: validateName(formData.name),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(
        formData.confirmPassword,
        formData.password
      ),
    };
    setErrors(newErrors);
    setTouched({
      email: true,
      name: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.values(newErrors).some((error) => error !== "")) return;

    try {
      setIsLoading(true);
      setRegistrationError(null);

      const goalId = Number(params.goal_id) || 1;
      const levelId = Number(params.level_id) || 1;

      const response = await api.auth.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        goal_id: goalId,
        level_id: levelId,
      });

      if (response.message === "successfully registered") {
        router.push({
          pathname: "/(auth)/confirmation",
          params: {
            email: formData.email,
            goal_id: goalId,
            level_id: levelId,
          },
        });
      } else {
        setRegistrationError("Registration failed. Please try again.");
      }
    } catch (error: any) {
      // Handle 409 Conflict (Email already registered)
      if (
        error.status === 409 ||
        (error.message && error.message.includes("already registered"))
      ) {
        setErrors((prev) => ({
          ...prev,
          email: "Email already registered",
        }));
      } else if (error instanceof Error) {
        setRegistrationError(error.message);
      } else {
        setRegistrationError("An unexpected error occurred");
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
            <Text style={styles.title}>Register</Text>

            {registrationError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{registrationError}</Text>
              </View>
            )}

            <View style={styles.form}>
              <Input
                label="Email"
                // placeholder="Enter your email"
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
                label="Your name"
                // placeholder="Enter your name"
                value={formData.name}
                onChangeText={(text) => handleInputChange("name", text)}
                onBlur={() => handleBlur("name")}
                error={errors.name}
                touched={touched.name}
                editable={!isLoading}
              />

              <Input
                label="Password"
                // placeholder="Enter password"
                value={formData.password}
                onChangeText={(text) => handleInputChange("password", text)}
                onBlur={() => handleBlur("password")}
                error={errors.password}
                touched={touched.password}
                editable={!isLoading}
                isPassword
              />

              <Input
                label="Confirm password"
                // placeholder="Confirm password"
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
              onPress={handleRegister}
              disabled={!isFormValid}
              loading={isLoading}
              title="Register"
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
