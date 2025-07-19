// Типы для API
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Типы для ответов API аутентификации
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface RegisterResponse {
  message: string;
}

export interface ConfirmEmailResponse {
  message: string;
  access_token?: string;
  refresh_token?: string;
  success?: boolean;
}

export interface ResendPasswordResponse {
  message: string;
}

// Типы для данных контента
export interface Exercise {
  id: string;
  title: string;
  thumbnail_url: string;
  body_parts: string[];
  dif_level: string;
  calories: number;
  description?: string;
  video_url?: string;
  repeats?: number;
  steps?: string[];
  tips?: string;
  common_mistakes?: string;
  correct_second?: string;
  countdown?: string | null;
  position?: string;
  rest_speech?: string;
  rest_speech_text?: string;
  slow_down_phrases?: string;
  speech_seconds?: Record<string, string>;
  updated_at?: string;
  created_at?: string;
}

export interface Program {
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
}

export interface AvailableContentResponse {
  workouts: Workout[];
  plans: Program[];
}

// Тип для профиля пользователя
export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  muscle_groups: string[] | null;
  language: string | null;
  goal_weight: number | null;
  goal_id: number | null;
  level_id: number | null;
  total_calories: number | null;
  total_minutes: number | null;
  completed_workouts: number | null;
  started_workouts: number | null;
  created_at: string;
  completed_exercises: number | null;
}

export interface ProfileResponse {
  profile: UserProfile;
}

// Типы для календаря
export interface CalendarApiItem {
  date: string;
  status: "completed" | "planned" | "missed" | "active";
}

// Новый формат элемента календаря с сервера
export interface CalendarServerItem {
  date: string;
  title: string;
  workout_title: string;
  workout_id: string;
  trained: boolean;
  canceled: boolean;
}

export interface CalendarResponse {
  calendar: CalendarApiItem[] | CalendarServerItem[];
}

// Тип для параметров фильтрации
export interface FilterParams {
  goal_id?: number;
  level_id?: number;
  muscle_groups?: string;
}

// Тип для ответа фильтрации
export interface FilterResponse {
  plans: Program[];
}

export interface MainPagePlan {
  user_id: number;
  plan_id: string;
  img_url: string;
  title: string;
  weeks: number;
  calories: number;
  current_weeks: number;
  fired_calories: number;
  started_workouts: number;
  workouts: number;
  finished_workouts: number;
  finished_exercises: number;
}

export interface MainPageWorkout {
  trained: boolean;
  date: string;
  canceled: boolean;
  title: string;
  total_minutes: number;
  type: string;
  workout_desc_img: string;
  dif_level: string;
  calories: number;
  workout_id: string;
}

export interface MainPageResponse {
  plan: MainPagePlan[] | null;
  workout: MainPageWorkout[] | null;
}

export interface Workout {
  id: string;
  body_img: string;
  calories: string;
  title: string;
  total_minutes: number;
  type: string;
  workout_desc_img: string;
  dif_level: string;
  body_parts: string[];
  description: string;
  workout_id: Record<string, any>;
}

export interface TestWorkoutResponse {
  workouts: Workout[];
}

// Интерфейс для отслеживания первого открытия приложения
export interface FirstOpenedResponse {
  message: string;
  success: boolean;
}

// Интерфейс для отслеживания каждого открытия приложения
export interface AppOpenedResponse {
  message: string;
  success: boolean;
}
