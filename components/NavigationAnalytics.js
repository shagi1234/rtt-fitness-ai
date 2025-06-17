// import { useEffect } from "react";
// import { usePathname } from "expo-router";
// import { logScreenView } from "@/lib/firebase";

// export default function NavigationAnalytics() {
//   const pathname = usePathname();

//   useEffect(() => {
//     if (!pathname) return;

//     // Преобразуем путь в удобочитаемый формат для аналитики
//     const screenName = pathname
//       .replace(/^\/(tabs|auth|onboarding)\//, "") // Убираем начальные сегменты пути
//       .replace(/^\//, "") // Убираем начальный слеш
//       .replace(/\/$/, "") // Убираем конечный слеш
//       .replace(/\//g, "_") // Заменяем все слеши на подчеркивания
//       .replace(/^$/, "Home"); // Пустой путь означает домашнюю страницу

//     // Логируем просмотр экрана
//     logScreenView(screenName);
//   }, [pathname]);

//   return null;
// }
