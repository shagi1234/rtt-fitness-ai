// Здесь будет код для работы с хранилищем токенов
// В реальном приложении здесь будет использоваться AsyncStorage или другое хранилище

import AsyncStorage from "@react-native-async-storage/async-storage";

// Ключи для хранения данных
const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  SOCIAL_AUTH_PROVIDER: "social_auth_provider",
  SOCIAL_AUTH_DATA: "social_auth_data",
};

// Интерфейс для данных пользователя
export interface UserData {
  token: string;
  refreshToken: string;
  socialProvider?: string;
  socialData?: any;
}

// Получение данных пользователя
export const getUserData = async (): Promise<UserData | null> => {
  try {
    const [accessToken, refreshToken, socialProvider, socialData] =
      await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.SOCIAL_AUTH_PROVIDER),
        AsyncStorage.getItem(STORAGE_KEYS.SOCIAL_AUTH_DATA),
      ]);

    // Проверяем, авторизован ли пользователь через токены или социальную сеть
    if (accessToken && refreshToken) {
      return {
        token: accessToken,
        refreshToken: refreshToken,
      };
    } else if (socialProvider && socialData) {
      return {
        token: "", // Для социальной авторизации может не быть традиционного токена
        refreshToken: "",
        socialProvider,
        socialData: JSON.parse(socialData),
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

// Сохранение токенов для обычной авторизации
export const saveUserData = async (
  accessToken: string,
  refreshToken: string
): Promise<void> => {
  try {
    // При обычной авторизации очищаем данные социальной авторизации
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
      AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
      AsyncStorage.removeItem(STORAGE_KEYS.SOCIAL_AUTH_PROVIDER),
      AsyncStorage.removeItem(STORAGE_KEYS.SOCIAL_AUTH_DATA),
    ]);
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};

// Сохранение данных для социальной авторизации
export const saveSocialUserData = async (
  provider: string,
  authData: any
): Promise<void> => {
  try {
    // При социальной авторизации очищаем данные обычной авторизации
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.setItem(STORAGE_KEYS.SOCIAL_AUTH_PROVIDER, provider),
      AsyncStorage.setItem(
        STORAGE_KEYS.SOCIAL_AUTH_DATA,
        JSON.stringify(authData)
      ),
    ]);
  } catch (error) {
    console.error(`Error saving ${provider} auth data:`, error);
    throw error;
  }
};

// Очистка данных пользователя
export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.SOCIAL_AUTH_PROVIDER,
      STORAGE_KEYS.SOCIAL_AUTH_DATA,
    ]);
  } catch (error) {
    console.error("Error clearing user data:", error);
    throw error;
  }
};

// Функции для работы с социальной авторизацией
export const processGoogleAuthData = async (googleUser: any) => {
  // Здесь вы можете обработать данные Google-пользователя
  // Например, отправить на ваш бэкенд для верификации
  return googleUser;
};

export const processFacebookAuthData = async (facebookUser: any) => {
  // Здесь вы можете обработать данные Facebook-пользователя
  return facebookUser;
};

export const processAppleAuthData = async (appleUser: any) => {
  // Здесь вы можете обработать данные Apple-пользователя
  return appleUser;
};
