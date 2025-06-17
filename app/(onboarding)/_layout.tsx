import { Stack } from "expo-router";

export default function OnboardingLayout() {
  // Убираем все проверки и эффекты - просто рендерим стек
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="setup-intro" />
      <Stack.Screen name="date-of-birth" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="height" />
      <Stack.Screen name="weight" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
