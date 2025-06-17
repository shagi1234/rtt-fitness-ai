import { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "@/components/Button";
import { colors } from "@/constants/сolors";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SetupIntroContent {
  title: string;
  subtitle: string;
  buttons: {
    start: string;
    later: string;
  };
}

const content: SetupIntroContent = {
  title: "Let's set up your plan",
  subtitle:
    "To personalize your plan, we need some information about you. This will only take a few minutes.",
  buttons: {
    start: "Start",
    later: "Later",
  },
};

const gradientColors = {
  overlay: ["rgba(0,0,0,0.1)", "rgba(0,0,0,0.7)"] as const,
  button: [colors.primary, colors.primaryLight] as const,
};

export default function SetupIntro() {
  const router = useRouter();

  const handleStart = useCallback(() => {
    router.push("/(onboarding)/date-of-birth");
  }, [router]);

  const handleLater = useCallback(() => {
    // Просто вернуться назад или на главную страницу
    router.push("/(tabs)");
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../../assets/images/intro.png")}
        style={styles.backgroundImage}
        contentFit="cover"
        transition={300}
        cachePolicy="memory-disk"
      />

      <LinearGradient colors={gradientColors.overlay} style={styles.overlay} />

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.subtitle}>{content.subtitle}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button onPress={handleStart} title={content.buttons.start} />

          <TouchableOpacity style={styles.laterButton} onPress={handleLater}>
            <Text style={styles.laterButtonText}>{content.buttons.later}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  backgroundImage: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  textContainer: {
    marginTop: SCREEN_HEIGHT * 0.15,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: 17,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: Platform.OS === "ios" ? 34 : 24,
  },
  button: {
    height: 46,
    borderRadius: 16,
  },
  laterButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(218, 222, 233, 0.15)",
    borderRadius: 12,
  },
  laterButtonText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
