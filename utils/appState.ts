import AsyncStorage from "@react-native-async-storage/async-storage";

const APP_STATE_KEYS = {
  FIRST_LAUNCH: "app_first_launch",
};

/**
 * Проверяет, является ли текущий запуск приложения первым
 * @returns Promise<boolean> - true если это первый запуск, иначе false
 */
export const isFirstLaunch = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(APP_STATE_KEYS.FIRST_LAUNCH);
    // Если значения нет, значит это первый запуск
    return value === null;
  } catch (error) {
    console.error("Error checking if this is first launch:", error);
    // В случае ошибки считаем, что не первый запуск,
    // чтобы не отправлять запрос при каждой ошибке
    return false;
  }
};

/**
 * Отмечает, что приложение уже было запущено
 */
export const setAppLaunched = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(APP_STATE_KEYS.FIRST_LAUNCH, "false");
  } catch (error) {
    console.error("Error setting app as launched:", error);
  }
};
