import { apiClient } from "../client";
import {
  AvailableContentResponse,
  Program,
  Exercise,
  CalendarApiItem,
  CalendarResponse,
  MainPageResponse,
  CalendarServerItem,
} from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkNetworkConnection } from "@/utils/network";

// Ключи для кэширования
const CACHE_KEYS = {
  AVAILABLE_CONTENT: "cache_available_content",
  PROGRAM_DETAILS: (id: string) => `cache_program_${id}`,
  EXERCISE_DETAILS: (id: string) => `cache_exercise_${id}`,
  USER_CALENDAR: "cache_user_calendar",
  USER_WORKOUT_HISTORY: "cache_user_workout_history",
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

// Добавляем интерфейс для параметров фильтрации
export interface FilterParams {
  goal_id?: number;
  level_id?: number;
  muscle_groups?: string;
}

// Добавляем интерфейс для ответа фильтрации
export interface FilterResponse {
  plans: Program[];
}

export interface WorkoutHistoryItem {
  user_id: number;
  trained_date: string;
  body_img: string;
  calories: string;
  title: string;
  total_minutes: number;
  type: string;
  workout_desc_img: string;
  dif_level: string;
}

export interface WorkoutHistoryResponse {
  data: WorkoutHistoryItem[];
}

// Интерфейс для запроса начала тренировки
interface WorkoutStartedRequest {
  plan?: boolean;
  title?: string;
  workout_id?: string | number;
}

// Интерфейс для запроса завершения упражнения
interface ExerciseFinishedRequest {
  plan: boolean;
}

// Интерфейс для запроса сожженных калорий
interface FiredCaloriesRequest {
  calories: number;
}

interface WorkoutFinishedRequest {
  plan?: boolean;
  time_spent?: number;
  total_calories?: number;
  total_repeats?: number;
  percentage_completed?: number;
}

interface TestWorkoutRequest {
  calories: number;
  activity_time: number;
}

interface AppSettingsResponse {
  settings: {
    key: string;
    value: string;
  }[];
}

export const contentService = {
  getAvailableContent: async (): Promise<AvailableContentResponse> => {
    try {
      // Проверяем наличие сети
      const isConnected = await checkNetworkConnection();

      // Если нет сети, пытаемся получить данные из кэша
      if (!isConnected) {
        const cachedData = await getFromCache<AvailableContentResponse>(
          CACHE_KEYS.AVAILABLE_CONTENT
        );
        if (cachedData) {
          console.log("Using cached available content (offline mode)");
          return cachedData;
        }
        throw new Error("No network connection and no cached data available");
      }

      // Если есть сеть, делаем запрос
      const response = await apiClient.get<AvailableContentResponse>(
        "/api/users/available"
      );

      // Сохраняем результат в кэш
      await saveToCache(CACHE_KEYS.AVAILABLE_CONTENT, response.data);

      return response.data;
    } catch (error) {
      console.error("Error fetching available content:", error);

      // В случае ошибки пытаемся получить данные из кэша
      const cachedData = await getFromCache<AvailableContentResponse>(
        CACHE_KEYS.AVAILABLE_CONTENT
      );
      if (cachedData) {
        console.log("Using cached available content (after error)");
        return cachedData;
      }

      throw error;
    }
  },

  getProgramDetails: async (programId: string): Promise<Program> => {
    try {
      // Проверяем наличие сети
      const isConnected = await checkNetworkConnection();

      // Если нет сети, пытаемся получить данные из кэша
      if (!isConnected) {
        const cachedData = await getFromCache<Program>(
          CACHE_KEYS.PROGRAM_DETAILS(programId)
        );
        if (cachedData) {
          console.log(
            `Using cached program details for ${programId} (offline mode)`
          );
          return cachedData;
        }
        throw new Error("No network connection and no cached data available");
      }

      // Если есть сеть, делаем запрос
      const response = await apiClient.get<Program>(`/api/plans/${programId}`);

      // Сохраняем результат в кэш
      await saveToCache(CACHE_KEYS.PROGRAM_DETAILS(programId), response.data);

      return response.data;
    } catch (error) {
      console.error(`Error fetching program details for ${programId}:`, error);

      // В случае ошибки пытаемся получить данные из кэша
      const cachedData = await getFromCache<Program>(
        CACHE_KEYS.PROGRAM_DETAILS(programId)
      );
      if (cachedData) {
        console.log(
          `Using cached program details for ${programId} (after error)`
        );
        return cachedData;
      }

      throw error;
    }
  },

  getExerciseDetails: async (exerciseId: string): Promise<Exercise> => {
    try {
      // Проверяем наличие сети
      const isConnected = await checkNetworkConnection();

      // Если нет сети, пытаемся получить данные из кэша
      if (!isConnected) {
        const cachedData = await getFromCache<Exercise>(
          CACHE_KEYS.EXERCISE_DETAILS(exerciseId)
        );
        if (cachedData) {
          console.log(
            `Using cached exercise details for ${exerciseId} (offline mode)`
          );
          return cachedData;
        }
        throw new Error("No network connection and no cached data available");
      }

      // Если есть сеть, делаем запрос
      const response = await apiClient.get<Exercise>(
        `/api/exercises/${exerciseId}`
      );

      // Сохраняем результат в кэш
      await saveToCache(CACHE_KEYS.EXERCISE_DETAILS(exerciseId), response.data);

      return response.data;
    } catch (error) {
      console.error(
        `Error fetching exercise details for ${exerciseId}:`,
        error
      );

      // В случае ошибки пытаемся получить данные из кэша
      const cachedData = await getFromCache<Exercise>(
        CACHE_KEYS.EXERCISE_DETAILS(exerciseId)
      );
      if (cachedData) {
        console.log(
          `Using cached exercise details for ${exerciseId} (after error)`
        );
        return cachedData;
      }

      throw error;
    }
  },

  getUserCalendar: async (): Promise<
    CalendarApiItem[] | CalendarServerItem[]
  > => {
    try {
      // Проверяем наличие сети
      const isConnected = await checkNetworkConnection();

      // Если нет сети, пытаемся получить данные из кэша
      if (!isConnected) {
        const cachedData = await getFromCache<
          CalendarApiItem[] | CalendarServerItem[]
        >(CACHE_KEYS.USER_CALENDAR);
        if (cachedData) {
          console.log("Using cached calendar data (offline mode)");
          return cachedData;
        }
        throw new Error("No network connection and no cached data available");
      }

      // Если есть сеть, делаем запрос
      const response = await apiClient.get<CalendarResponse>(
        "/api/users/calendar"
      );

      // Проверяем и обрабатываем ответ
      if (response && response.data && Array.isArray(response.data.calendar)) {
        // Сохраняем результат в кэш
        await saveToCache(CACHE_KEYS.USER_CALENDAR, response.data.calendar);
        return response.data.calendar;
      }

      return [];
    } catch (error) {
      console.error("Error fetching user calendar:", error);

      // В случае ошибки пытаемся получить данные из кэша
      const cachedData = await getFromCache<
        CalendarApiItem[] | CalendarServerItem[]
      >(CACHE_KEYS.USER_CALENDAR);
      if (cachedData) {
        console.log("Using cached calendar data (after error)");
        return cachedData;
      }

      throw error;
    }
  },

  getUserWorkoutHistory: async (): Promise<WorkoutHistoryItem[]> => {
    try {
      // Проверяем наличие сети
      const isConnected = await checkNetworkConnection();

      // Если нет сети, пытаемся получить данные из кэша
      if (!isConnected) {
        const cachedData = await getFromCache<WorkoutHistoryItem[]>(
          CACHE_KEYS.USER_WORKOUT_HISTORY
        );
        if (cachedData) {
          console.log("Using cached workout history data (offline mode)");
          return cachedData;
        }
        throw new Error("No network connection and no cached data available");
      }

      // Если есть сеть, делаем запрос
      const response = await apiClient.get<WorkoutHistoryResponse>(
        "/api/users/workout-history"
      );

      // Проверяем и обрабатываем ответ
      if (response && response.data && Array.isArray(response.data.data)) {
        // Сохраняем результат в кэш
        await saveToCache(CACHE_KEYS.USER_WORKOUT_HISTORY, response.data.data);
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error("Error fetching user workout history:", error);

      // В случае ошибки пытаемся получить данные из кэша
      const cachedData = await getFromCache<WorkoutHistoryItem[]>(
        CACHE_KEYS.USER_WORKOUT_HISTORY
      );
      if (cachedData) {
        console.log("Using cached workout history data (after error)");
        return cachedData;
      }

      throw error;
    }
  },

  // Метод для очистки кэша
  clearCache: async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(
        (key) =>
          key === CACHE_KEYS.AVAILABLE_CONTENT ||
          key === CACHE_KEYS.USER_CALENDAR ||
          key.startsWith("cache_program_") ||
          key.startsWith("cache_exercise_")
      );

      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        console.log(`Cleared ${cacheKeys.length} cache items`);
      }
    } catch (error) {
      console.error("Error clearing cache:", error);
      throw error;
    }
  },

  // Метод для фильтрации программ
  filterPrograms: async (
    params: FilterParams = {}
  ): Promise<FilterResponse> => {
    try {
      // Проверяем наличие сети
      const isConnected = await checkNetworkConnection();

      if (!isConnected) {
        throw new Error("No network connection available");
      }

      // Делаем POST-запрос на API фильтрации
      const response = await apiClient.post<FilterResponse>(
        "/api/users/filter",
        params
      );

      return response.data;
    } catch (error) {
      console.error("Error filtering programs:", error);
      throw error;
    }
  },

  async getMainPageData(): Promise<MainPageResponse> {
    const { data } = await apiClient.get<MainPageResponse>(
      "/api/users/main?date=" + new Date().toISOString().split("T")[0]
    );
    return data;
  },

  // Функция для установки плана для пользователя
  setPlanForUser: async (planId: string): Promise<boolean> => {
    try {
      const response = await apiClient.post("/api/users/set-plan", {
        plan_id: planId,
        date: new Date().toISOString().split("T")[0], // Текущая дата в формате YYYY-MM-DD
      });

      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.error("Error setting plan for user:", error);
      return false;
    }
  },

  // Новый метод для отправки данных о начале тренировки
  trackWorkoutStarted: async (
    data: WorkoutStartedRequest
  ): Promise<boolean> => {
    try {
      // Проверяем наличие сети
      const isConnected = await checkNetworkConnection();

      if (!isConnected) {
        console.log("No network connection, can't track workout start");
        return false;
      }

      // Отправляем POST запрос на API
      const response = await apiClient.post("/api/users/workout-started", data);

      // Логируем успешный ответ
      console.log("Workout start tracked successfully:", response.data);

      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.error("Error tracking workout start:", error);
      return false;
    }
  },

  // Новый метод для отправки данных о завершении упражнения
  trackExerciseFinished: async (
    data: ExerciseFinishedRequest
  ): Promise<boolean> => {
    try {
      // Проверяем наличие сети
      const isConnected = await checkNetworkConnection();

      if (!isConnected) {
        console.log("No network connection, can't track exercise completion");
        return false;
      }

      // Отправляем POST запрос на API
      const response = await apiClient.post(
        "/api/users/exercise-finished",
        data
      );

      // Логируем успешный ответ
      console.log("Exercise completion tracked successfully:", response.data);

      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.error("Error tracking exercise completion:", error);
      return false;
    }
  },

  // Новый метод для отправки данных о сожженных калориях
  trackFiredCalories: async (data: FiredCaloriesRequest): Promise<boolean> => {
    try {
      // Проверяем наличие сети
      const isConnected = await checkNetworkConnection();

      if (!isConnected) {
        console.log("No network connection, can't track fired calories");
        return false;
      }

      // Отправляем POST запрос на API
      const response = await apiClient.post("/api/users/fired-calories", data);

      // Логируем успешный ответ
      console.log("Fired calories tracked successfully:", response.data);

      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.error("Error tracking fired calories:", error);
      return false;
    }
  },

  // Новый метод для отправки данных о завершении тренировки
  trackWorkoutFinished: async (
    data: WorkoutFinishedRequest
  ): Promise<boolean> => {
    try {
      // Проверяем наличие сети
      const isConnected = await checkNetworkConnection();

      if (!isConnected) {
        console.log("No network connection, can't track workout completion");
        return false;
      }

      // Отправляем POST запрос на API
      const response = await apiClient.post(
        "/api/users/workout-finished",
        data
      );

      // Логируем успешный ответ
      console.log("Workout completion tracked successfully:", response.data);

      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.error("Error tracking workout completion:", error);
      return false;
    }
  },

  // Функция для обработки нажатия на кнопку оплаты программы
  getPaymentButton: async (): Promise<any> => {
    try {
      // Проверяем наличие сети
      const isConnected = await checkNetworkConnection();

      if (!isConnected) {
        throw new Error("No network connection available");
      }

      // Отправляем POST запрос на получение кнопки оплаты
      const response = await apiClient.post("/api/users/payment-button", {});

      return response.data;
    } catch (error) {
      console.error("Error getting payment button:", error);
      throw error;
    }
  },

  // Функция для получения настроек приложения
  getAppSettings: async (): Promise<AppSettingsResponse> => {
    try {
      // Проверяем наличие сети
      const isConnected = await checkNetworkConnection();

      if (!isConnected) {
        throw new Error("No network connection available");
      }

      // Делаем GET-запрос на API настроек
      const response = await apiClient.get<AppSettingsResponse>(
        "/api/users/settings"
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching app settings:", error);
      // В случае ошибки возвращаем пустой объект настроек
      return { settings: [] };
    }
  },

  // Функция для начала тестовой тренировки
  startTestWorkout: async (): Promise<boolean> => {
    try {
      // Проверяем наличие сети
      const isConnected = await checkNetworkConnection();

      if (!isConnected) {
        console.log("No network connection, can't start test workout");
        return false;
      }

      // Отправляем POST запрос на API
      const response = await apiClient.post(
        "/api/users/start-test-workout",
        {}
      );

      // Логируем успешный ответ
      console.log("Test workout started successfully:", response.data);

      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.error("Error starting test workout:", error);
      return false;
    }
  },

  // Функция для завершения тестовой тренировки
  finishTestWorkout: async (data: TestWorkoutRequest): Promise<boolean> => {
    try {
      // Проверяем наличие сети
      const isConnected = await checkNetworkConnection();

      if (!isConnected) {
        console.log("No network connection, can't finish test workout");
        return false;
      }

      // Отправляем POST запрос на API
      const response = await apiClient.post(
        "/api/users/finish-test-workout",
        data
      );

      // Логируем успешный ответ
      console.log("Test workout finished successfully:", response.data);

      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.error("Error finishing test workout:", error);
      return false;
    }
  },

  // Функция для отправки запроса на страницу оплаты
  sendPaymentPageRequest: async (): Promise<boolean> => {
    try {
      // Проверяем наличие сети
      const isConnected = await checkNetworkConnection();

      if (!isConnected) {
        console.log("No network connection, can't send payment page request");
        return false;
      }

      // Отправляем POST запрос на API
      const response = await apiClient.post("/api/users/payment-page", {});

      // Логируем успешный ответ
      console.log("Payment page request sent successfully:", response.data);

      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.error("Error sending payment page request:", error);
      return false;
    }
  },
};
