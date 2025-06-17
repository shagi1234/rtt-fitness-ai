import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { View, Platform } from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import AnimatedSplash from "@/components/AnimatedSplash";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { ProfileProvider } from "@/lib/ProfileContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { isFirstLaunch, setAppLaunched } from "@/utils/appState";
import { userService } from "@/lib/api/services/userService";
// import NavigationAnalytics from "@/components/NavigationAnalytics";

export const unstable_settings = {
  initialRouteName: "(auth)",
};

// Компонент-обертка для безопасной области и корректного отображения StatusBar
function SafeAreaWrapper({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const segments = useSegments();

  // Определяем, какой раздел приложения активен
  const isWorkoutScreen = segments[0] === "(workout)";
  const isTabsScreen = segments[0] === "(tabs)";
  const isAuthScreen = segments[0] === "(auth)";
  const isOnboardingScreen = segments[0] === "(onboarding)";

  // Выбираем цвет фона в зависимости от экрана
  let backgroundColor = "#FFFFFF";
  if (isWorkoutScreen) {
    backgroundColor = "#000000";
  } else if (isAuthScreen) {
    backgroundColor = "#000000"; // На экранах авторизации обычно темный фон
  }

  // Определяем стиль статус-бараr
  let statusBarStyle: "light" | "dark" | "auto" = "dark";
  if (isWorkoutScreen || isAuthScreen) {
    statusBarStyle = "light";
  } else if (isTabsScreen) {
    statusBarStyle = "dark";
  }

  return (
    <View style={{ flex: 1, backgroundColor }}>
      {/* StatusBar настраивается в зависимости от раздела */}
      <StatusBar style={statusBarStyle} />

      <View
        style={{
          flex: 1,
          paddingTop:
            Platform.OS === "android" && !isTabsScreen ? insets.top : 0,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !router || !segments) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inWorkoutGroup = segments[0] === "(workout)";

    // Если пользователь находится в разделе тренировок, не перенаправляем
    if (inWorkoutGroup) {
      return;
    }

    // Упрощенная логика навигации - только проверка авторизации
    if (!isAuthenticated && !inAuthGroup) {
      // Если пользователь не авторизован и пытается получить доступ к защищенным разделам
      router.replace("/(auth)/welcome");
    } else if (isAuthenticated && inAuthGroup) {
      // Если пользователь авторизован и пытается получить доступ к страницам авторизации
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return (
    <SafeAreaWrapper>
      <Slot />
    </SafeAreaWrapper>
  );
}

function AuthWrapper() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <AnimatedSplash onComplete={() => {}} />;
  }

  return <RootLayoutNav />;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "VelaSans-ExtraLight": require("../assets/fonts/VelaSans-ExtraLight.ttf"),
    "VelaSans-Light": require("../assets/fonts/VelaSans-Light.ttf"),
    "VelaSans-Regular": require("../assets/fonts/VelaSans-Regular.ttf"),
    "VelaSans-Medium": require("../assets/fonts/VelaSans-Medium.ttf"),
    "VelaSans-SemiBold": require("../assets/fonts/VelaSans-SemiBold.ttf"),
    "VelaSans-Bold": require("../assets/fonts/VelaSans-Bold.ttf"),
    "VelaSans-ExtraBold": require("../assets/fonts/VelaSans-ExtraBold.ttf"),
    "DINCondensed-DemiBold": require("../assets/fonts/DINCondensed-DemiBold.otf"),
    ...FontAwesome.font,
  });
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Эффект для проверки первого запуска и отправки данных о первом открытии
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const isFirst = await isFirstLaunch();
        if (isFirst) {
          console.log("This is the first app launch, sending API request");
          // Отправляем запрос в API о первом запуске
          await userService.reportFirstOpen();
          // Отмечаем, что приложение уже запускалось
          await setAppLaunched();
        }
      } catch (error) {
        console.error("Error during first launch check:", error);
      }
    };

    checkFirstLaunch();
  }, []);

  // Эффект для отправки данных о каждом открытии приложения
  useEffect(() => {
    const reportAppOpening = async () => {
      try {
        console.log("App opened, sending API request to track app opening");
        await userService.reportAppOpened();
      } catch (error) {
        console.error("Error reporting app open:", error);
      }
    };

    reportAppOpening();
  }, []);

  const handleSplashComplete = () => {
    setShowAnimatedSplash(false);
  };

  if (!loaded) {
    return null;
  }

  if (showAnimatedSplash) {
    return <AnimatedSplash onComplete={handleSplashComplete} />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileProvider>
          {/* <NavigationAnalytics /> */}
          <AuthWrapper />
        </ProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
