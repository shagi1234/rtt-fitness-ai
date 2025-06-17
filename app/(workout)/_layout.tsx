import { Stack } from "expo-router";

export default function WorkoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="start" options={{ headerShown: false }} />
      <Stack.Screen
        name="program-details"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
