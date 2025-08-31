"use client";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
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
    iosClientId: "473987561962-gqe3hs0h5s1mdcmkt9rtaqae8793m9b1.apps.googleusercontent.com",
});

export default function SignInOptions() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login } = useAuth();
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfUse, setShowTermsOfUse] = useState(false);

  const handleEmailSignup = () => {
    router.push("/login");
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
            params.goal_id ? Number(params.goal_id) : 1,
            params.level_id ? Number(params.level_id) : 1,
            false
          );
          console.log("response", response);

          // Check if we received tokens from our backend
          if (response.access_token && response.refresh_token) {
            // Save goal and level IDs if they exist in params
            if (params.goal_id || params.level_id) {
              await Promise.all([
                AsyncStorage.setItem(
                  "user_goal_id",
                  String(Number(params.goal_id) || 1)
                ),
                AsyncStorage.setItem(
                  "user_level_id",
                  String(Number(params.level_id) || 1)
                ),
              ]);
            }

            // Login using AuthContext
            await login(response.access_token, response.refresh_token);

            // Navigate to setup intro or main page
            router.replace("/(onboarding)/setup-intro");
          }
        } catch (apiError: any) {
          console.error("API Authentication error:", apiError);
          // Проверяем, является ли ошибка 404 (пользователь не найден)
          if (apiError && apiError.status === 404) {
            Alert.alert(
              "Not Registered",
              "This account is not registered. Please sign up first.",
              [
                {
                  text: "OK",
                  onPress: () => router.replace("/(auth)/quiz/goal"),
                },
              ]
            );
          } else {
            Alert.alert("Error", "Failed to authenticate with server");
          }
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
      await auth().signInWithCredential(appleCredential);
      
      // Now call your backend API with the identity token
      try {
        const response = await authService.appleAuth(identityToken);
        console.log("Apple auth response", response);
        
        // Check if we received tokens from our backend
        if (response.access_token && response.refresh_token) {
          // Save goal and level IDs if they exist in params
          if (params.goal_id || params.level_id) {
            await Promise.all([
              AsyncStorage.setItem(
                "user_goal_id",
                String(Number(params.goal_id) || 1)
              ),
              AsyncStorage.setItem(
                "user_level_id",
                String(Number(params.level_id) || 1)
              ),
            ]);
          }
          
          // Login using AuthContext
          await login(response.access_token, response.refresh_token);
          
          // Navigate to setup intro or main page
          router.replace("/(onboarding)/setup-intro");
        }
      } catch (apiError: any) {
        console.error("API Authentication error:", apiError);
        // Check if it's a 404 (user not found)
        if (apiError && apiError.status === 404) {
          Alert.alert(
            "Not Registered",
            "This account is not registered. Please sign up first.",
            [
              {
                text: "OK",
                onPress: () => router.replace("/(auth)/quiz/goal"),
              },
            ]
          );
        } else {
          Alert.alert("Error", "Failed to authenticate with server");
        }
      }
      
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
        <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
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
        <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
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

      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      {/* Main Image */}
      <Header showBack />
      <Image
        source={require("../../assets/images/welcome-illustration.png")}
        style={styles.illustration}
        contentFit="contain"
      />

      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>
          Ready to continue? Choose how you want to proceed
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

          {/* Apple Button - Only show on iOS */}
          {Platform.OS === "ios" && (
            <Pressable style={styles.authButton} onPress={onAppleButtonPress}>
              <View style={styles.buttonContent}>
                <AntDesign
                  name="apple1"
                  size={20}
                  color="#000000"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Continue with Apple</Text>
              </View>
            </Pressable>
          )}
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
    fontWeight: "500",
    lineHeight: 22,
    letterSpacing: 0,
    color: "#1A1A1A",
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
