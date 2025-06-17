// Экспорт типов
export * from "./types";

// Экспорт конфигурации
export * from "./config";

// Экспорт клиента
export { apiClient } from "./client";

// Экспорт сервисов
import { authService } from "./services/authService";
import { contentService } from "./services/contentService";
import { userService } from "./services/userService";

// Объединенный API для удобного импорта
const api = {
  auth: authService,
  content: contentService,
  user: userService,
};

export default api;
