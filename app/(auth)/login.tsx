import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { forgotPasswordIcon, headphonesIcon } from "@/lib/icon";
import { SvgXml } from "react-native-svg";
import { Input } from "@/components/Input";
import Header from "@/components/Header";
import { colors } from "@/constants/сolors";
import { Button } from "@/components/Button";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email: string;
  password: string;
}

interface TouchedFields {
  email: boolean;
  password: boolean;
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

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
    password: false,
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Convert email to lowercase
    const processedValue = field === "email" ? value.toLowerCase() : value;

    const newFormData = { ...formData, [field]: processedValue };
    setFormData(newFormData);

    if (touched[field]) {
      const newError =
        field === "email"
          ? validateEmail(processedValue)
          : validatePassword(processedValue);
      setErrors((prev) => ({ ...prev, [field]: newError }));
    }

    // Clear login error when user starts typing again
    setLoginError(null);
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error =
      field === "email"
        ? validateEmail(formData[field])
        : validatePassword(formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSignIn = async () => {
    // Validate all fields before submission
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });

    if (emailError || passwordError) return;

    try {
      setIsLoading(true);
      setLoginError(null);

      // Convert email to lowercase to ensure consistency
      const emailLowerCase = formData.email.toLowerCase();

      // Check for test credentials
      if (
        emailLowerCase === "biar@test.com" &&
        formData.password === "biartest"
      ) {
        // Use mock tokens for test login
        await login("test_access_token", "test_refresh_token");
        router.replace("/(tabs)");
        return;
      }

      const response = await api.auth.login(emailLowerCase, formData.password);
      await login(response.access_token, response.refresh_token);
      router.replace("/(tabs)");
    } catch (error) {
      if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError("Failed to sign in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const isFormValid =
    formData.email !== "" &&
    formData.password !== "" &&
    errors.email === "" &&
    errors.password === "";

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

            {loginError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{loginError}</Text>
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
                label="Password"
                placeholder="Enter password"
                value={formData.password}
                onChangeText={(text) => handleInputChange("password", text)}
                onBlur={() => handleBlur("password")}
                error={errors.password}
                touched={touched.password}
                editable={!isLoading}
                isPassword
              />

              <Pressable
                onPress={handleForgotPassword}
                disabled={isLoading}
                style={styles.forgotPassword}
              >
                <Text
                  style={[
                    styles.forgotPasswordText,
                    isLoading && styles.textDisabled,
                  ]}
                >
                  Forgot password?
                </Text>
                {/* <SvgXml xml={forgotPasswordIcon} width={22} height={22} /> */}
              </Pressable>
            </View>

            <Button
              onPress={handleSignIn}
              disabled={!isFormValid}
              loading={isLoading}
              title="Sign In"
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
  forgotPassword: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "500",
  },
  textDisabled: {
    opacity: 0.5,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    marginTop: 4,
  },
});
