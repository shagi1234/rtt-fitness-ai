import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import Header from "@/components/Header";
import { colors } from "@/constants/сolors";
import { useProfile } from "@/lib/ProfileContext";

export default function FeedbackScreen() {
  const { profile } = useProfile();
  const [email] = useState(profile?.email || "");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const maxCharacters = 1000;

  // Мемоизированный подсчет оставшихся символов
  const charactersRemaining = useMemo(
    () => maxCharacters - feedback.length,
    [feedback, maxCharacters]
  );

  // Проверка валидности формы
  const isFormValid = useMemo(
    () => email.trim() !== "" && feedback.trim() !== "",
    [email, feedback]
  );

  // Обработчик отправки обратной связи
  const handleSendFeedback = useCallback(async () => {
    if (!isFormValid) {
      Alert.alert("Error", "Please fill in your feedback");
      return;
    }

    setLoading(true);

    try {
      // Имитация API запроса
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert("Success", "Thank you for your feedback!");
      setFeedback("");
    } catch (error) {
      Alert.alert("Error", "Failed to send feedback. Please try again later.");
      console.error("Feedback error:", error);
    } finally {
      setLoading(false);
    }
  }, [email, feedback, isFormValid]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header showBack />
      <KeyboardAvoidingView
        behavior={"padding"}
        style={styles.keyboardAvoidingView}
        // keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Feedback</Text>

            <View style={styles.form}>
              <View style={styles.emailContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.emailFieldContainer}>
                  <Text style={styles.emailText}>{email}</Text>
                </View>
              </View>

              <View style={styles.feedbackContainer}>
                <Text style={styles.label}>Your feedback</Text>
                <TextInput
                  style={styles.textArea}
                  value={feedback}
                  onChangeText={setFeedback}
                  multiline
                  maxLength={maxCharacters}
                  textAlignVertical="top"
                  placeholder="Tell us what you think..."
                  placeholderTextColor="#999999"
                />
                <View style={styles.counterContainer}>
                  <Text
                    style={[
                      styles.charCounter,
                      charactersRemaining < 100 && styles.warningText,
                    ]}
                  >
                    {charactersRemaining}/{maxCharacters}
                  </Text>
                </View>
              </View>
            </View>

            {/* <View style={styles.buttonContainer}> */}
            <Button
              title="Send"
              onPress={handleSendFeedback}
              disabled={!isFormValid}
              loading={loading}
            />
            {/* </View> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 32,
    marginTop: 12,
    color: colors.black,
  },
  form: {
    gap: 24,
    marginBottom: 24,
  },
  emailContainer: {
    gap: 8,
  },
  emailFieldContainer: {
    backgroundColor: "rgb(235, 235, 235)",
    borderRadius: 12,
    borderColor: "rgb(221, 223, 228)",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 46,
  },
  emailText: {
    fontSize: 16,
    color: "#666",
  },
  label: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.black,
    marginBottom: 8,
  },
  feedbackContainer: {
    gap: 8,
  },
  textArea: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 150,
    borderWidth: 1,
    borderColor: "rgb(221, 223, 228)",
  },
  counterContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  charCounter: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  warningText: {
    color: "#FF9500",
  },
  buttonContainer: {
    padding: 20,
  },
  sendButton: {
    height: 50,
    borderRadius: 12,
  },
});
