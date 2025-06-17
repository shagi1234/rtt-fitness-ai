import { Stack } from "expo-router";
import { View } from "react-native";
import { useAuth } from "@/lib/AuthContext";

export default function ProfileLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <View />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="feedback" />
      <Stack.Screen name="language" />
      <Stack.Screen name="account" />
    </Stack>
  );
}
