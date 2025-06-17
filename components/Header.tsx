import React, { ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SvgXml } from "react-native-svg";
import { backIcon } from "@/lib/icon";
import { colors } from "@/constants/сolors";

interface HeaderProps {
  showBack?: boolean;
  rightContent?: ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  showBack = true,
  rightContent,
}) => {
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {showBack && (
          <Pressable onPress={handleBackPress} style={styles.backButton}>
            <SvgXml xml={backIcon} width={24} height={24} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        )}
      </View>
      {rightContent && <View>{rightContent}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
    color: colors.black,
    marginLeft: 10,
  },
});

export default Header;
