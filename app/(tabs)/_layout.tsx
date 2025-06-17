import { Tabs } from "expo-router";
import { useAuth } from "@/lib/AuthContext";
import { SvgXml } from "react-native-svg";
import { View } from "react-native";
import {
  inactiveHomeIcon,
  activeHomeIcon,
  inactiveWorkoutsIcon,
  activeWorkoutsIcon,
  inactiveAnalyticsIcon,
  activeAnalyticsIcon,
  inactiveProfileIcon,
  activeProfileIcon,
} from "@/lib/icon";

export default function TabLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <View />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          // backgroundColor: "rgba(255, 255, 255, 0.75)",
          borderTopWidth: 0,
          height: 79,
          paddingTop: 6,
          paddingBottom: 30,
        },
        tabBarActiveTintColor: "#06E28A",
        tabBarInactiveTintColor: "#666666",
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 0,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        // tabBarIndicatorStyle: {
        //   backgroundColor: "#000000",
        //   height: 2,
        // },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Main",
          tabBarIcon: ({ color, focused }) => (
            <SvgXml
              xml={focused ? activeHomeIcon : inactiveHomeIcon}
              width={24}
              height={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color, focused }) => (
            <SvgXml
              xml={focused ? activeWorkoutsIcon : inactiveWorkoutsIcon}
              width={24}
              height={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, focused }) => (
            <SvgXml
              xml={focused ? activeAnalyticsIcon : inactiveAnalyticsIcon}
              width={24}
              height={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <SvgXml
              xml={focused ? activeProfileIcon : inactiveProfileIcon}
              width={24}
              height={24}
            />
          ),
          href: {
            pathname: "/(tabs)/profile",
          },
        }}
      />
    </Tabs>
  );
}
