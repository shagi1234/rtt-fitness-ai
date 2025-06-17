import { apiClient } from "../client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LoginResponse,
  RegisterResponse,
  ConfirmEmailResponse,
  ResendPasswordResponse,
  TestWorkoutResponse,
} from "../types";
import { saveUserData, clearUserData } from "@/utils/auth";
import { checkNetworkConnection } from "@/utils/network";

// Ключи для кэширования
const CACHE_KEYS = {
  TEST_WORKOUT: (goalId: number, levelId: number) =>
    `cache_test_workout_${goalId}_${levelId}`,
};

// Время жизни кэша в миллисекундах (1 час)
const CACHE_TTL = 60 * 60 * 1000;

interface CachedData<T> {
  data: T;
  timestamp: number;
}

const saveToCache = async <T>(key: string, data: T): Promise<void> => {
  try {
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error(`Error saving to cache (${key}):`, error);
  }
};

const getFromCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cachedJson = await AsyncStorage.getItem(key);
    if (!cachedJson) return null;

    const cached: CachedData<T> = JSON.parse(cachedJson);

    if (Date.now() - cached.timestamp > CACHE_TTL) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return cached.data;
  } catch (error) {
    console.error(`Error getting from cache (${key}):`, error);
    return null;
  }
};

interface TestWorkoutRequest {
  level_id: number;
  goal_id: number;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  goal_id: number;
  level_id: number;
}

interface SocialAuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

// Обновляем интерфейс для запроса Google авторизации
interface GoogleAuthRequest {
  id_token: string;
  email: string;
  name: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>("/api/auth/login", {
        email,
        password,
      });

      if (response.data.access_token && response.data.refresh_token) {
        // Сохраняем токены в ApiClient
        apiClient.setTokens(
          response.data.access_token,
          response.data.refresh_token
        );
        // Сохраняем токены в хранилище
        await saveUserData(
          response.data.access_token,
          response.data.refresh_token
        );
      }

      return response.data;
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post<RegisterResponse>(
        "/api/auth/register",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Registration Error:", error);
      throw error;
    }
  },

  confirmEmail: async (
    email: string,
    code: string
  ): Promise<ConfirmEmailResponse> => {
    try {
      const response = await apiClient.post<ConfirmEmailResponse>(
        "/api/auth/confirm-email",
        {
          email,
          mail_password: code,
        }
      );

      if (response.data.access_token && response.data.refresh_token) {
        // Сохраняем токены в ApiClient
        apiClient.setTokens(
          response.data.access_token,
          response.data.refresh_token
        );
        // Сохраняем токены в хранилище
        await saveUserData(
          response.data.access_token,
          response.data.refresh_token
        );
      }

      return response.data;
    } catch (error) {
      console.error("Email Confirmation Error:", error);
      throw error;
    }
  },

  resendPassword: async (email: string): Promise<ResendPasswordResponse> => {
    try {
      const response = await apiClient.post<ResendPasswordResponse>(
        "/api/auth/resend-password",
        {
          email,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Resend Password Error:", error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    // Очищаем токены в ApiClient
    apiClient.clearTokens();
    // Очищаем токены в хранилище
    await clearUserData();
  },

  getTestWorkout: async (
    data: TestWorkoutRequest
  ): Promise<TestWorkoutResponse> => {
    try {
      const isConnected = await checkNetworkConnection();
      const cacheKey = CACHE_KEYS.TEST_WORKOUT(data.goal_id, data.level_id);

      // Если нет сети, пытаемся получить данные из кэша
      if (!isConnected) {
        const cachedData = await getFromCache<TestWorkoutResponse>(cacheKey);
        if (cachedData) {
          console.log("Using cached test workout (offline mode)");
          return cachedData;
        }
        throw new Error("No network connection and no cached data available");
      }

      // Если есть сеть, делаем запрос
      const response = await apiClient.post<TestWorkoutResponse>(
        "/api/users/test-workout-filter",
        data
      );

      // Сохраняем результат в кэш
      await saveToCache(cacheKey, response.data);

      return response.data;
    } catch (error) {
      console.error("Test Workout Error:", error);

      // В случае ошибки пытаемся получить данные из кэша
      const cacheKey = CACHE_KEYS.TEST_WORKOUT(data.goal_id, data.level_id);
      const cachedData = await getFromCache<TestWorkoutResponse>(cacheKey);
      if (cachedData) {
        console.log("Using cached test workout (after error)");
        return cachedData;
      }

      throw error;
    }
  },

  googleAuth: async (
    // idToken: string,
    email: string,
    name: string,
    goal_id: number,
    level_id: number,
    blabla: boolean
  ): Promise<SocialAuthResponse> => {
    try {
      let response;
      if (blabla) {
        response = await apiClient.post<SocialAuthResponse>(
          "/api/auth/register/google",
          {
            // id_token: idToken,
            email: email,
            name: name,
            goal_id: goal_id,
            level_id: level_id,
          }
        );
      } else {
        response = await apiClient.post<SocialAuthResponse>(
          "/api/auth/login/google",
          {
            email: email,
            name: name,
            goal_id: goal_id,
            level_id: level_id,
          }
        );
      }
      if (response.data.access_token && response.data.refresh_token) {
        apiClient.setTokens(
          response.data.access_token,
          response.data.refresh_token
        );
        await saveUserData(
          response.data.access_token,
          response.data.refresh_token
        );
      }

      return response.data;
    } catch (error) {
      console.error("Google Authentication Error:", error);
      throw error;
    }
  },

  appleAuth: async (idToken: string): Promise<SocialAuthResponse> => {
    try {
      const response = await apiClient.post<SocialAuthResponse>(
        "/api/auth/apple",
        {
          id_token: idToken,
        }
      );

      if (response.data.access_token && response.data.refresh_token) {
        apiClient.setTokens(
          response.data.access_token,
          response.data.refresh_token
        );
        await saveUserData(
          response.data.access_token,
          response.data.refresh_token
        );
      }

      return response.data;
    } catch (error) {
      console.error("Apple Authentication Error:", error);
      throw error;
    }
  },

  // Функция для сброса пароля после подтверждения кода
  resetPassword: async (
    email: string,
    password: string,
    mailPassword: string
  ): Promise<ConfirmEmailResponse> => {
    try {
      const response = await apiClient.post<ConfirmEmailResponse>(
        "/api/auth/reset-password",
        {
          email,
          password,
          mail_password: mailPassword,
        }
      );

      if (response.data.access_token && response.data.refresh_token) {
        // Сохраняем токены в ApiClient
        apiClient.setTokens(
          response.data.access_token,
          response.data.refresh_token
        );
        // Сохраняем токены в хранилище
        await saveUserData(
          response.data.access_token,
          response.data.refresh_token
        );
      }

      return response.data;
    } catch (error) {
      console.error("Reset Password Confirmation Error:", error);
      throw error;
    }
  },

  // Функция для изменения email пользователя
  changeEmail: async (
    newEmail: string
  ): Promise<{ message: string; new_email: string }> => {
    try {
      const response = await apiClient.post<{
        message: string;
        new_email: string;
      }>("/api/auth/change-email", {
        new_email: newEmail,
      });

      return response.data;
    } catch (error) {
      console.error("Change Email Error:", error);
      throw error;
    }
  },

  // Функция для подтверждения нового email
  confirmNewEmail: async (
    newEmail: string,
    code: string
  ): Promise<{
    message: string;
    access_token?: string;
    refresh_token?: string;
  }> => {
    try {
      const response = await apiClient.post<{
        message: string;
        access_token?: string;
        refresh_token?: string;
      }>("/api/auth/confirm-new-email", {
        new_email: newEmail,
        mail_password: code,
      });

      return response.data;
    } catch (error) {
      console.error("Confirm New Email Error:", error);
      throw error;
    }
  },
};
