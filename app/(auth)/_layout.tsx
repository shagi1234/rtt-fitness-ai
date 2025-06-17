import { Stack } from "expo-router";
import { useAuth } from "@/lib/AuthContext";
import { View } from "react-native";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <View />;
  }

  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="confirmation" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="quiz/goal" options={{ headerShown: false }} />
      <Stack.Screen name="quiz/level" options={{ headerShown: false }} />
      <Stack.Screen name="language" options={{ headerShown: false }} />
      <Stack.Screen name="test-workout" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in-options" options={{ headerShown: false }} />
    </Stack>
  );
}
