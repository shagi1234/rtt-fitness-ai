"use client";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
  StatusBar,
  Alert,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { appleAuth } from "@invertase/react-native-apple-authentication";
import auth from "@react-native-firebase/auth";
import { authService } from "@/lib/api/services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/lib/AuthContext";
import { WebView } from "react-native-webview";
import { ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import Header from "@/components/Header";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

GoogleSignin.configure({
  webClientId:
    "473987561962-b47054msl1ef8rkk50qvf8gtfmb7ev8t.apps.googleusercontent.com",
  // "473987561962-b47054msl1ef8rkk50qvf8gtfmb7ev8t.apps.googleusercontent.com"
});

export default function Auth() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login } = useAuth();
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfUse, setShowTermsOfUse] = useState(false);

  const handleEmailSignup = async () => {
    router.push({
      pathname: "/register",
      params: {
        goal_id: await AsyncStorage.getItem("user_goal_id"),
        level_id: await AsyncStorage.getItem("user_level_id"),
      },
    });
  };

  const onGoogleButtonPress = async () => {
    try {
      console.log("onGoogleButtonPress");
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      await GoogleSignin.signOut();

      const signInResult = await GoogleSignin.signIn();
      console.log("signInResult", signInResult);

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(
        signInResult.data?.idToken || null
      );
      await auth().signInWithCredential(googleCredential);

      if (
        signInResult.data &&
        signInResult.data.user &&
        signInResult.data.user.email &&
        signInResult.data.user.name
      ) {
        try {
          const response = await authService.googleAuth(
            signInResult.data.user.email,
            signInResult.data.user.name,
            Number(await AsyncStorage.getItem("user_goal_id")),
            Number(await AsyncStorage.getItem("user_level_id")),
            true
          );
          console.log("response", response);

          // Check if we received tokens from our backend
          if (response.access_token && response.refresh_token) {
            // Login using AuthContext
            await login(response.access_token, response.refresh_token);

            // Navigate to setup intro or main page
            router.replace("/(onboarding)/setup-intro");
          }
        } catch (apiError) {
          console.error("API Authentication error:", apiError);
          Alert.alert("Error", "Failed to authenticate with server");
        }
      } else {
        console.log("No user data");
        Alert.alert("Error", "Failed to get user data");
        return;
      }
    } catch (error) {
      console.log("Google Sign-In Error:", error);
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            Alert.alert("Error", "Sign in was cancelled");
            break;
          case statusCodes.IN_PROGRESS:
            Alert.alert("Error", "Sign in is already in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert("Error", "Play services are not available");
            break;
          default:
            Alert.alert("Error", "Something went wrong with Google Sign-In");
            break;
        }
      } else {
        Alert.alert("Error", "An unexpected error occurred");
      }
    }
  };

  const onAppleButtonPress = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });
      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        throw new Error("Apple Sign-In failed - no identify token returned");
      }
      // Create a Firebase credential from the response
      const { identityToken, nonce } = appleAuthRequestResponse;
      console.log("identityToken", identityToken);
      console.log("nonce", nonce);
      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce
      );
      // Sign the user in with the credential
      return auth().signInWithCredential(appleCredential);
    } catch (error: any) {
      if (error.code !== "ERR_CANCELED") {
        console.error("Apple Sign-In Error:", error);
        Alert.alert("Error", "Failed to sign in with Apple");
      }
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={Platform.OS === "ios" ? ["top"] : []}
    >
      {/* WebView Modal для Privacy Policy */}
      <Modal
        visible={showPrivacyPolicy}
        animationType="slide"
        onRequestClose={() => setShowPrivacyPolicy(false)}
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            paddingTop: Platform.OS === "ios" ? 44 : 0,
          }}
        >
          <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
            <View style={styles.webViewHeader}>
              <Pressable
                style={styles.closeButton}
                onPress={() => setShowPrivacyPolicy(false)}
              >
                <ChevronLeft size={24} color="#000000" />
                <Text style={styles.backText}>Back</Text>
              </Pressable>
              <Text style={styles.webViewTitle}>Privacy Policy</Text>
            </View>
            <WebView
              source={{ uri: "https://fitmentor.space/policy.html" }}
              style={{ flex: 1 }}
            />
          </SafeAreaView>
        </View>
      </Modal>

      {/* WebView Modal для Terms of Use */}
      <Modal
        visible={showTermsOfUse}
        animationType="slide"
        onRequestClose={() => setShowTermsOfUse(false)}
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            paddingTop: Platform.OS === "ios" ? 44 : 0,
          }}
        >
          <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
            <View style={styles.webViewHeader}>
              <Pressable
                style={styles.closeButton}
                onPress={() => setShowTermsOfUse(false)}
              >
                <ChevronLeft size={24} color="#000000" />
                <Text style={styles.backText}>Back</Text>
              </Pressable>
              <Text style={styles.webViewTitle}>Terms of Use</Text>
            </View>
            <WebView
              source={{ uri: "https://fitmentor.space/terms.html" }}
              style={{ flex: 1 }}
            />
          </SafeAreaView>
        </View>
      </Modal>

      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Main Image */}
      <Header showBack />
      <Image
        source={require("../../assets/images/welcome-illustration.png")}
        style={styles.illustration}
        contentFit="contain"
      />

      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>
          To receive your workout program and track your progress.
        </Text>

        {/* Auth Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable style={styles.authButton} onPress={handleEmailSignup}>
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color="#000000"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Continue with Email</Text>
            </View>
          </Pressable>

          {/* Google Button */}
          <Pressable style={styles.authButton} onPress={onGoogleButtonPress}>
            <View style={styles.buttonContent}>
              <AntDesign
                name="google"
                size={20}
                color="#000000"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Continue with Google</Text>
            </View>
          </Pressable>
        </View>

        {/* Agreement Text */}
        <Text style={styles.agreementText}>
          By signing up you agree to the{" "}
          <Text style={styles.link} onPress={() => setShowTermsOfUse(true)}>
            User Agreement
          </Text>
          {" and "}
          <Text style={styles.link} onPress={() => setShowPrivacyPolicy(true)}>
            Privacy policy
          </Text>
          .
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  illustration: {
    width: SCREEN_WIDTH * 1,
    height: SCREEN_WIDTH * 1,
    marginRight: "5%",
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 28,
    letterSpacing: 0,
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 22,
    letterSpacing: 0,
    color: "#666666",
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 12,
  },
  authButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    justifyContent: "center",
  },
  authButtonDisabled: {
    opacity: 0.7,
    backgroundColor: "#F0F0F0",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#1A1A1A",
    textAlign: "center",
  },
  agreementText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginTop: 24,
    lineHeight: 20,
    paddingBottom: 24,
  },
  link: {
    color: "#06E28A",
    textDecorationLine: "none",
  },
  webViewHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    paddingHorizontal: 8,
  },
  backText: {
    fontSize: 17,
    lineHeight: 22,
    color: "#000000",
    marginLeft: -4,
    fontWeight: "400",
  },
  webViewTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginRight: 40,
  },
});
