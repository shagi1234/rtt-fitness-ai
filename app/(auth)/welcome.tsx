import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Welcome() {
  const router = useRouter();
  console.log("uhuhuhuhugffgggggggg");
  const handleGetStarted = () => {
    router.push("/(auth)/quiz/goal"); // Updated path
  };

  const handleLogin = () => {
    router.push("/(auth)/sign-in-options");
  };

  const handleLanguageSelect = () => {
    router.push("/language");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      {/* Language Selector */}
      {/* <Pressable style={styles.languageButton} onPress={handleLanguageSelect}>
        <Image
          source={require("../../assets/images/globe.png")}
          style={styles.globeIcon}
          contentFit="contain"
        />
        <Text style={styles.languageText}>EN</Text>
      </Pressable> */}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to FitMentor Ai!</Text>

        <Text style={styles.subtitle}>
          Reach new heights with your personal fitness coach powered by
          artificial intelligence.
        </Text>

        {/* Main Image */}
        <Image
          source={require("../../assets/images/welcome-illustration.png")}
          style={styles.illustration}
          contentFit="contain"
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable onPress={handleGetStarted}>
          <LinearGradient
            colors={["#048050", "#06E28A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </LinearGradient>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={handleLogin}>
          <Text style={styles.secondaryButtonText}>
            I already have an account
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  languageButton: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    zIndex: 1,
    padding: 8,
  },
  globeIcon: {
    width: 24,
    height: 24,
  },
  languageText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    color: "#1A1A1A",
    lineHeight: 28,
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666666",
    marginBottom: 20,
    lineHeight: 22,
    fontWeight: "400",
    letterSpacing: 0,
    paddingHorizontal: 20,
  },
  illustration: {
    width: SCREEN_WIDTH * 1,
    height: SCREEN_WIDTH * 1,
    marginRight: "5%",
    marginTop: 20,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    gap: 8,
  },
  primaryButton: {
    width: "100%",
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
  },
  secondaryButton: {
    width: "100%",
    height: 42,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  secondaryButtonText: {
    color: "#1A1A1A",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
  },
});
