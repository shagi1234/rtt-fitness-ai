import { API_URL, API_TIMEOUT } from "./config";
import { ApiResponse, ApiError } from "./types";
import { getUserData } from "@/utils/auth";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  timeout?: number;
};

export class ApiClient {
  private static instance: ApiClient;
  private token: string | null = null;
  private refreshToken: string | null = null;

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.token = accessToken;
    this.refreshToken = refreshToken;
  }

  clearTokens(): void {
    this.token = null;
    this.refreshToken = null;
  }

  private async getHeaders(): Promise<Headers> {
    const headers = new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
    });

    // Сначала проверяем токены в памяти
    if (this.token) {
      headers.append("Authorization", `Bearer ${this.token}`);
      return headers;
    }

    // Если токенов нет в памяти, пытаемся получить из хранилища
    const userData = await getUserData();
    if (userData?.token) {
      this.token = userData.token;
      this.refreshToken = userData.refreshToken;
      headers.append("Authorization", `Bearer ${userData.token}`);
    }

    return headers;
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    // Проверяем, начинается ли endpoint с "/"
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    const url = new URL(`${API_URL}${normalizedEndpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }

    return url.toString();
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = "GET", body, params, timeout = API_TIMEOUT } = options;

    try {
      const headers = await this.getHeaders();
      const url = this.buildUrl(endpoint, params);

      console.log(`API Request: ${method} ${url}`);
      if (body) console.log("Request body:", body);

      // Создаем AbortController для таймаута
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      // Очищаем таймаут
      clearTimeout(timeoutId);

      // Проверяем Content-Type ответа
      const contentType = response.headers.get("content-type");
      let data: any;

      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          // Получаем текст ответа для отладки
          const textResponse = await response.text();
          console.error("Response text:", textResponse);
          throw {
            status: response.status,
            message: `JSON Parse error: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          } as ApiError;
        }
      } else {
        // Если ответ не JSON, получаем его как текст
        const textResponse = await response.text();
        console.warn("Non-JSON response received:", textResponse);

        // Пытаемся преобразовать текст в JSON, если он похож на JSON
        try {
          data = JSON.parse(textResponse);
        } catch (e) {
          // Если не удалось преобразовать, возвращаем текст как есть
          data = { message: textResponse };
        }
      }

      console.log(`API Response: ${response.status}`);
      console.log("Response data:", data);

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || "An error occurred",
          errors: data.errors,
        } as ApiError;
      }

      return {
        data: data as T,
        status: response.status,
        message: data.message || "Success",
      };
    } catch (error) {
      // Обработка ошибки таймаута
      if (error instanceof Error && error.name === "AbortError") {
        throw {
          status: 408,
          message: "Request timeout",
        } as ApiError;
      }

      if ((error as ApiError).status) {
        throw error;
      }

      throw {
        status: 500,
        message: (error as Error).message || "Network error occurred",
      } as ApiError;
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string>,
    options?: Omit<RequestOptions, "method" | "params">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET", params });
  }

  async post<T>(
    endpoint: string,
    body: any,
    options?: Omit<RequestOptions, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  async put<T>(
    endpoint: string,
    body: any,
    options?: Omit<RequestOptions, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  async delete<T>(
    endpoint: string,
    options?: Omit<RequestOptions, "method">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Экспортируем экземпляр API клиента
export const apiClient = ApiClient.getInstance();
