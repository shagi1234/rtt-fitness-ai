import { apiClient } from "../client";
import {
  UserProfile,
  ProfileResponse,
  FirstOpenedResponse,
  AppOpenedResponse,
} from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkNetworkConnection } from "@/utils/network";
import { Platform } from "react-native";

// Ключи для кэширования
const CACHE_KEYS = {
  USER_PROFILE: "cache_user_profile",
};

// Время жизни кэша в миллисекундах (1 час)
const CACHE_TTL = 60 * 60 * 1000;

// Интерфейс для кэшированных данных
interface CachedData<T> {
  data: T;
  timestamp: number;
}

// Функция для сохранения данных в кэш
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

// Функция для получения данных из кэша
const getFromCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cachedJson = await AsyncStorage.getItem(key);
    if (!cachedJson) return null;

    const cached: CachedData<T> = JSON.parse(cachedJson);

    // Проверяем, не устарел ли кэш
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

export const userService = {
  // Получение профиля пользователя
  getProfile: async (): Promise<UserProfile> => {
    try {
      // Проверяем наличие сети
      const isConnected = await checkNetworkConnection();

      // Если нет сети, пытаемся получить данные из кэша
      if (!isConnected) {
        const cachedData = await getFromCache<UserProfile>(
          CACHE_KEYS.USER_PROFILE
        );
        if (cachedData) {
          console.log("Using cached user profile (offline mode)");
          return cachedData;
        }
        throw new Error(
          "No network connection and no cached profile available"
        );
      }

      // Если есть сеть, делаем запрос
      const response = await apiClient.get<ProfileResponse>(
        "/api/users/profile"
      );

      // Сохраняем результат в кэш
      await saveToCache(CACHE_KEYS.USER_PROFILE, response.data.profile);

      return response.data.profile;
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      if (error?.status === 403) {
        throw new Error("Unauthorized");
      }

      // В случае ошибки пытаемся получить данные из кэша
      const cachedData = await getFromCache<UserProfile>(
        CACHE_KEYS.USER_PROFILE
      );
      if (cachedData) {
        console.log("Using cached user profile (after error)");
        return cachedData;
      }

      throw error;
    }
  },

  // Обновление настроек тренировок (цель и уровень)
  updateWorkoutOptions: async (options: {
    goal_id: number;
    level_id: number;
  }): Promise<{
    message: string;
    profile: UserProfile;
    plan: {
      id: string;
      title: string;
      img_url: string;
      weeks: number;
      calories: number;
      category_description: string;
      cardio_level?: string | null;
      strength_level?: string | null;
      updated_at?: string;
      created_at?: string;
      workouts?: number;
    };
  }> => {
    try {
      // Проверяем наличие сети
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        throw new Error(
          "No network connection available to update workout options"
        );
      }

      // Отправляем запрос на обновление настроек
      const response = await apiClient.post<{
        message: string;
        profile: UserProfile;
        plan: {
          id: string;
          title: string;
          img_url: string;
          weeks: number;
          calories: number;
          category_description: string;
          cardio_level?: string | null;
          strength_level?: string | null;
          updated_at?: string;
          created_at?: string;
          workouts?: number;
        };
      }>("/api/users/profile", options);

      // Обновляем кэш профиля
      await saveToCache(CACHE_KEYS.USER_PROFILE, response.data.profile);

      // Возвращаем полный ответ с планом
      return response.data;
    } catch (error) {
      console.error("Error updating workout options:", error);
      throw error;
    }
  },

  // Обновление профиля пользователя
  updateProfile: async (
    profileData: Partial<UserProfile>
  ): Promise<UserProfile> => {
    try {
      const response = await apiClient.put<ProfileResponse>(
        "/api/users/profile",
        profileData
      );

      // Обновляем кэш
      await saveToCache(CACHE_KEYS.USER_PROFILE, response.data.profile);

      return response.data.profile;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  // Очистка кэша профиля
  clearProfileCache: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(CACHE_KEYS.USER_PROFILE);
      console.log("Profile cache cleared");
    } catch (error) {
      console.error("Error clearing profile cache:", error);
    }
  },

  // Функция для сохранения данных профиля из онбординга
  saveOnboardingProfile: async (onboardingData: {
    age?: number;
    height?: number;
    weight?: number;
    goal_weight?: number;
    dob?: string;
    muscle_groups?: string[];
    allow_notifications?: boolean;
    notification_time?: string;
  }): Promise<{
    message: string;
    profile: UserProfile;
    plan: {
      id: string;
      title: string;
      img_url: string;
      weeks: number;
      calories: number;
      workouts: any[];
      // Другие поля плана
    };
  }> => {
    try {
      // Проверяем наличие сети
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        throw new Error("No network connection available to save profile");
      }

      // Отправляем данные на сервер
      const response = await apiClient.post<{
        message: string;
        profile: UserProfile;
        plan: {
          id: string;
          title: string;
          img_url: string;
          weeks: number;
          calories: number;
          workouts: any[];
          // Другие поля плана
        };
      }>("/api/users/profile", onboardingData);

      // Сохраняем результат в кэш
      await saveToCache(CACHE_KEYS.USER_PROFILE, response.data.profile);

      return response.data; // Возвращаем весь ответ, включая plan
    } catch (error) {
      console.error("Error saving onboarding profile:", error);
      throw error;
    }
  },

  // Функция для отправки данных о первом открытии приложения
  reportFirstOpen: async (): Promise<boolean> => {
    try {
      // Проверка наличия сети
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        console.log("No network connection available to report first open");
        return false;
      }

      // Отправляем данные на сервер
      const response = await apiClient.post<FirstOpenedResponse>(
        "/api/users/first-opened",
        {
          timestamp: new Date().toISOString(),
          device_info: {
            platform: Platform.OS,
            version: Platform.Version,
          },
        }
      );

      console.log("First open reported successfully:", response.data.message);
      return response.data.success;
    } catch (error) {
      console.error("Error reporting first open:", error);
      return false;
    }
  },

  // Функция для отправки запроса при каждом открытии приложения
  reportAppOpened: async (): Promise<boolean> => {
    try {
      // Проверка наличия сети
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        console.log("No network connection available to report app open");
        return false;
      }

      // Отправляем пустой запрос на сервер
      const response = await apiClient.post<AppOpenedResponse>(
        "/api/users/opened",
        {}
      );

      console.log("App open event reported successfully");
      return true;
    } catch (error) {
      console.error("Error reporting app open:", error);
      return false;
    }
  },

  // Функция для удаления аккаунта пользователя
  deleteAccount: async (): Promise<boolean> => {
    try {
      // Проверка наличия сети
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        console.log("No network connection available to delete account");
        return false;
      }

      // Отправляем пустой запрос на сервер для удаления аккаунта
      const response = await apiClient.post("/api/users/delete-akkaunt", {});

      console.log("Account deletion request sent successfully");
      return true;
    } catch (error) {
      console.error("Error deleting account:", error);
      return false;
    }
  },

  /**
   * Обновление физических данных пользователя (возраст, рост, вес, целевой вес)
   */
  updateUserPhysicalData: async (data: {
    age?: number | null;
    height?: number | null;
    weight?: number | null;
    goal_weight?: number | null;
  }): Promise<void> => {
    try {
      const response = await apiClient.post("/api/users/profile/user", data);
      if (response.status !== 200 && response.status !== 204) {
        throw new Error("Failed to update user physical data");
      }
    } catch (error) {
      console.error("Error updating user physical data:", error);
      throw error;
    }
  },
};
