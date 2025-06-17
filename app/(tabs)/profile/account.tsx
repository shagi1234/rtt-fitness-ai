import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Header from "@/components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/Input";
import { colors } from "@/constants/сolors";
import { useProfile } from "@/lib/ProfileContext";
import { GradientWrapper } from "@/components/GradientWrapper";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password: string;
  confirmPassword: string;
}

interface TouchedFields {
  password: boolean;
  confirmPassword: boolean;
}

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

export default function AccountScreen() {
  const router = useRouter();
  const { profile, isLoading, error, refreshProfile, updateProfile } =
    useProfile();

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [originalData, setOriginalData] = useState({
    fullName: "",
    email: "",
  });

  const [touched, setTouched] = useState<TouchedFields>({
    password: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState<FormErrors>({
    password: "",
    confirmPassword: "",
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      const profileFullName = profile.full_name || "";
      const profileEmail = profile.email || "";

      setFormData((prev) => ({
        ...prev,
        fullName: profileFullName,
        email: profileEmail,
      }));

      setOriginalData({
        fullName: profileFullName,
        email: profileEmail,
      });
    }
  }, [profile]);

  useEffect(() => {
    const fullNameChanged = formData.fullName !== originalData.fullName;
    const passwordFilled =
      formData.password !== "" &&
      formData.confirmPassword !== "" &&
      formData.password === formData.confirmPassword &&
      !errors.password &&
      !errors.confirmPassword;

    setHasChanges(fullNameChanged || passwordFilled);
  }, [formData, originalData, errors]);

  const handleChange = (field: keyof typeof formData) => (text: string) => {
    setFormData((prev) => ({ ...prev, [field]: text }));

    if (touched[field as keyof TouchedFields]) {
      const newError = (() => {
        switch (field) {
          case "password":
            return validatePassword(text);
          case "confirmPassword":
            return validateConfirmPassword(text, formData.password);
          default:
            return "";
        }
      })();
      setErrors((prev) => ({ ...prev, [field]: newError }));
    }
  };

  const handleBlur = (field: keyof FormData) => {
    if (field === "password" || field === "confirmPassword") {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = (() => {
        switch (field) {
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
    }
  };

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.confirmPassword,
      formData.password
    );

    if (passwordError || confirmPasswordError) {
      setErrors({
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      setTouched({
        password: true,
        confirmPassword: true,
      });
      return;
    }

    setIsSaving(true);

    try {
      const updatedData: any = {};

      if (formData.fullName !== originalData.fullName) {
        updatedData.full_name = formData.fullName;
      }

      if (formData.password) {
        updatedData.password = formData.password;
      }

      await updateProfile(updatedData);

      await refreshProfile();

      setOriginalData((prev) => ({
        ...prev,
        fullName: formData.fullName,
      }));

      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));

      Alert.alert("Success", "Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }, [formData, originalData, hasChanges, updateProfile, refreshProfile]);

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header showBack />
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !profile) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header showBack />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        showBack
        rightContent={
          hasChanges ? (
            <GradientWrapper
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </GradientWrapper>
          ) : undefined
        }
      />

      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Account</Text>

        <View style={styles.formGroup}>
          <Input
            label="Full name"
            value={formData.fullName}
            onChangeText={handleChange("fullName")}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.customEmailContainer}>
            <Text style={styles.emailText}>{formData.email}</Text>
            <TouchableOpacity onPress={() => router.push("/change-email")}>
              <Text style={styles.changeButton}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Input
            label="Password"
            value={formData.password}
            onChangeText={handleChange("password")}
            onBlur={() => handleBlur("password")}
            placeholder="Enter new password"
            placeholderTextColor="#999"
            isPassword
            style={styles.input}
            error={errors.password}
            touched={touched.password}
          />
        </View>

        <View style={styles.formGroup}>
          <Input
            label="Confirm password"
            value={formData.confirmPassword}
            onChangeText={handleChange("confirmPassword")}
            onBlur={() => handleBlur("confirmPassword")}
            placeholder="Confirm new password"
            placeholderTextColor="#999"
            isPassword
            style={styles.input}
            error={errors.confirmPassword}
            touched={touched.confirmPassword}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 32,
    marginTop: 12,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 10,
    color: "#000",
  },
  input: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  customEmailContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgb(235, 235, 235)",
    borderRadius: 10,
    borderColor: "rgb(221, 223, 228)",
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 46,
  },
  emailText: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  changeButton: {
    fontSize: 16,
    fontWeight: "500",
    color: "#00A87E",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 14,
    letterSpacing: 0,
  },
});
