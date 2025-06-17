import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import {
  getUserData,
  saveUserData,
  clearUserData,
  saveSocialUserData,
} from "@/utils/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  loginWithSocial: (provider: string, authData: any) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type SocialAuthData = {
  firebaseUser: any;
  email?: string;
  name?: string;
  picture?: string;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      // Получаем только данные аутентификации
      const userData = await getUserData();
      setIsAuthenticated(Boolean(userData));
      console.log("[AuthContext] Auth state updated:", {
        isAuthenticated: Boolean(userData),
      });
    } catch (error) {
      console.error("[AuthContext] Error checking auth status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (accessToken: string, refreshToken: string) => {
    await saveUserData(accessToken, refreshToken);
    setIsAuthenticated(true);
    console.log("[AuthContext] User logged in");
  };

  // Новый метод для входа через социальные сети
  const loginWithSocial = async (
    provider: string,
    authData: SocialAuthData
  ) => {
    try {
      await saveSocialUserData(provider, authData);
      setIsAuthenticated(true);
      console.log(`[AuthContext] User logged in with ${provider}`);
    } catch (error) {
      console.error(`[AuthContext] Error during ${provider} login:`, error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Очищаем данные аутентификации
      await clearUserData();

      // Очищаем только ключи, связанные с аутентификацией
      try {
        const keysToRemove = [
          "accessToken",
          "refreshToken",
          "user_data",
          "user_profile",
          "social_auth_provider",
          "social_auth_data",
        ];
        await AsyncStorage.multiRemove(keysToRemove);
      } catch (clearError) {
        console.error("[AuthContext] Error clearing auth data:", clearError);
      }

      // Обновляем состояние контекста
      setIsAuthenticated(false);
      console.log("[AuthContext] User logged out");
    } catch (error) {
      console.error("[AuthContext] Error during logout:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        loginWithSocial,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
