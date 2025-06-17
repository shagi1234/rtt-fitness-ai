import type React from "react";
import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  RefreshControl,
  Modal,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useAuth } from "@/lib/AuthContext";
import { useProfile } from "@/lib/ProfileContext";
import { SvgXml } from "react-native-svg";
import { WebView } from "react-native-webview";
import { useCameraPermissions } from "expo-camera";
import { colors } from "@/constants/сolors";
import { GradientWrapper } from "@/components/GradientWrapper";
import {
  termsIcon,
  privacyIcon,
  feedbackIcon,
  languageIcon,
  cameraIcon,
  bellIcon,
  workoutsIcon,
  userIcon,
  accountIcon,
} from "@/lib/icon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { userService } from "@/lib/api/services/userService";
import { StatusBar } from "expo-status-bar";
// import { logEvent } from "@/lib/firebase";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string | React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  rightText?: string;
}

const CustomSwitch = ({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
}) => {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[styles.switchContainer]}
    >
      <GradientWrapper
        colors={value ? undefined : ["#E5E5E5", "#E5E5E5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.switchGradient}
      >
        <View
          style={[
            styles.switchThumb,
            { transform: [{ translateX: value ? 18 : 2 }] },
          ]}
        />
      </GradientWrapper>
    </Pressable>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  rightText,
}) => (
  <Pressable style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      {icon}
      <Text style={styles.menuItemLabel}>{label}</Text>
    </View>
    <View style={styles.menuItemRight}>
      {rightText && <Text style={styles.menuItemValue}>{rightText}</Text>}
      {typeof value === "string" ? (
        <Text style={styles.menuItemValue}>{value}</Text>
      ) : (
        value
      )}
      {showChevron && <ChevronRight size={24} color={colors.black} />}
    </View>
  </Pressable>
);

const MenuCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.menuCard}>{children}</View>
);

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            // logEvent("user_logout");
            await logout();
          } catch (error) {
            console.error("Error during logout:", error);
            Alert.alert(
              "Logout Error",
              "An error occurred while logging out. Please try again."
            );
          }
        },
      },
    ]);
  };

  return (
    <MenuCard>
      <Pressable style={styles.menuItem} onPress={handleLogout}>
        <View style={styles.menuItemLeft}>
          <SvgXml xml={workoutsIcon} width={24} height={24} />
          <Text style={styles.menuItemLabel}>Log out</Text>
        </View>
      </Pressable>
    </MenuCard>
  );
};

const DeleteAccountButton: React.FC = () => {
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Здесь добавить логику удаления аккаунта
            console.log("Delete account requested");
          },
        },
      ]
    );
  };

  return (
    <Pressable style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
      <Text style={styles.deleteAccountButtonText}>Delete account</Text>
    </Pressable>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { profile, isLoading, error, refreshProfile } = useProfile();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfUse, setShowTermsOfUse] = useState(false);
  const [cameraPermission] = useCameraPermissions();
  const [isDeleting, setIsDeleting] = useState(false);

  // Проверка разрешения камеры при загрузке компонента и при изменении cameraPermission
  useEffect(() => {
    if (cameraPermission) {
      setCameraEnabled(cameraPermission.granted);
    }
  }, [cameraPermission]);

  // Обработчик переключения доступа к камере
  const handleCameraToggle = async (value: boolean) => {
    // Логируем событие изменения доступа к камере
    // logEvent("camera_access_changed", { enabled: value });

    if (value && cameraPermission && !cameraPermission.granted) {
      try {
        // Просто устанавливаем значение в соответствии с user's choice
        setCameraEnabled(value);
      } catch (error) {
        console.error("Error with camera permission:", error);
        setCameraEnabled(false);
      }
    } else {
      setCameraEnabled(value);
    }
  };

  // Функция для открытия Privacy Policy в WebView
  const openPrivacyPolicy = () => {
    setShowPrivacyPolicy(true);
  };

  // Функция для открытия Terms of Use в WebView
  const openTermsOfUse = () => {
    setShowTermsOfUse(true);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfile]);

  // Обработчик для выхода из аккаунта
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            // logEvent("user_logout");
            await logout();
          } catch (error) {
            console.error("Error during logout:", error);
            Alert.alert(
              "Logout Error",
              "An error occurred while logging out. Please try again."
            );
          }
        },
      },
    ]);
  };

  // Обработчик для удаления аккаунта
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              // Отправляем запрос на сервер для удаления аккаунта
              const success = await userService.deleteAccount();

              if (success) {
                // Очищаем всё AsyncStorage
                await AsyncStorage.clear();

                // Если запрос выполнен успешно, выходим из аккаунта
                console.log("Account successfully deleted");
                Alert.alert(
                  "Account Deleted",
                  "Your account has been successfully deleted.",
                  [
                    {
                      text: "OK",
                      onPress: async () => {
                        await logout();
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(
                  "Error",
                  "Failed to delete account. Please try again later."
                );
              }
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert(
                "Error",
                "An error occurred while deleting your account. Please try again later."
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Отображаем сообщение об ошибке, если не удалось загрузить профиль
  if (error && !profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={refreshProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
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

      <View style={styles.container}>
        {/* Header с кнопкой Back */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Profile Info */}
          <View style={styles.profileCard}>
            <Text style={styles.name}>
              {profile?.full_name || "Loading..."}
            </Text>
            <Text style={styles.email}>{profile?.email || "Loading..."}</Text>
          </View>

          {/* Меню */}
          <View style={styles.contentInner}>
            <View style={styles.group}>
              <MenuCard>
                <MenuItem
                  icon={<SvgXml xml={accountIcon} width={24} height={24} />}
                  label="Account"
                  onPress={() => router.push("/(tabs)/profile/account")}
                />
              </MenuCard>

              <MenuCard>
                <MenuItem
                  icon={<SvgXml xml={userIcon} width={24} height={24} />}
                  label="User"
                  onPress={() => router.push("/(tabs)/profile/user")}
                />
              </MenuCard>

              <MenuCard>
                <MenuItem
                  icon={<SvgXml xml={workoutsIcon} width={24} height={24} />}
                  label="Workouts"
                  onPress={() => router.push("/(tabs)/profile/workoutOptions")}
                />
              </MenuCard>
            </View>

            <View style={styles.group}>
              <MenuCard>
                <MenuItem
                  icon={<SvgXml xml={bellIcon} width={24} height={24} />}
                  label="Notifications"
                  rightText={notificationsEnabled ? "Allowed" : "Not allowed"}
                  value={
                    <CustomSwitch
                      value={notificationsEnabled}
                      onValueChange={setNotificationsEnabled}
                    />
                  }
                  showChevron={false}
                />
              </MenuCard>

              <MenuCard>
                <MenuItem
                  icon={<SvgXml xml={cameraIcon} width={24} height={24} />}
                  label="Camera access"
                  rightText={cameraEnabled ? "Allowed" : "Not allowed"}
                  value={
                    <CustomSwitch
                      value={cameraEnabled}
                      onValueChange={handleCameraToggle}
                    />
                  }
                  showChevron={false}
                />
              </MenuCard>

              <MenuCard>
                <MenuItem
                  icon={<SvgXml xml={languageIcon} width={24} height={24} />}
                  label="Language"
                  value={"EN"}
                  showChevron={false}
                />
              </MenuCard>
            </View>

            <View style={styles.group}>
              <MenuCard>
                <MenuItem
                  icon={<SvgXml xml={feedbackIcon} width={24} height={24} />}
                  label="Feedback"
                  onPress={() => router.push("/(tabs)/profile/feedback")}
                />
              </MenuCard>

              <MenuCard>
                <MenuItem
                  icon={<SvgXml xml={privacyIcon} width={24} height={24} />}
                  label="Privacy policy"
                  onPress={openPrivacyPolicy}
                />
              </MenuCard>

              <MenuCard>
                <MenuItem
                  icon={<SvgXml xml={termsIcon} width={24} height={24} />}
                  label="Terms of use"
                  onPress={openTermsOfUse}
                />
              </MenuCard>
            </View>

            <View style={styles.group}>
              <MenuCard>
                <Pressable style={styles.menuItem} onPress={handleLogout}>
                  <View style={styles.menuItemLeft}>
                    <SvgXml xml={workoutsIcon} width={24} height={24} />
                    <Text style={styles.menuItemLabel}>Log out</Text>
                  </View>
                </Pressable>
              </MenuCard>
              <View style={styles.deleteAccountContainer}>
                <Pressable
                  style={[
                    styles.deleteAccountButton,
                    isDeleting && styles.deleteAccountButtonDisabled,
                  ]}
                  onPress={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  <Text style={styles.deleteAccountButtonText}>
                    {isDeleting ? "Deleting..." : "Delete account"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backText: {
    fontSize: 17,
    lineHeight: 22,
    color: "#000000",
    marginLeft: -4,
    fontWeight: "400",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 24,
    letterSpacing: 0,
    color: colors.black,
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 22,
    letterSpacing: 0,
    color: "rgb(114, 114, 114)",
  },
  contentInner: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 26,
  },
  group: {
    gap: 8,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
    color: colors.black,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuItemValue: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 14,
    letterSpacing: 0,
    color: colors.black,
  },
  switchContainer: {
    width: 35,
    height: 20,
    borderRadius: 100,
    backgroundColor: "#E5E5E5",
  },
  switchGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 100,
    justifyContent: "center",
  },
  switchThumb: {
    width: 14,
    height: 14,
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  logoutButtonContainer: {
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 32,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
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
  webViewTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginRight: 40,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  deleteAccountContainer: {
    // paddingHorizontal: 16,
    // paddingTop: 26,
    // paddingBottom: 32,
  },
  deleteAccountButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    // height: 70,
    alignItems: "center",
  },
  deleteAccountButtonText: {
    color: "#F43811",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  deleteAccountButtonDisabled: {
    opacity: 0.7,
  },
});
