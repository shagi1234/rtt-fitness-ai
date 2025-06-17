// import { Platform } from "react-native";
// import firebase from "@react-native-firebase/app";
// import analytics from "@react-native-firebase/analytics";

// const firebaseConfig = {
//   // Эти данные нужно заменить на ваши из консоли Firebase
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID",
//   measurementId: "YOUR_MEASUREMENT_ID",
// };

// // Инициализация Firebase
// if (!firebase.apps.length) {
//   firebase.initializeApp(firebaseConfig);
// }

// // Функция для отслеживания просмотра экрана
// export const logScreenView = async (screenName) => {
//   try {
//     if (Platform.OS === "web") return;
//     await analytics().logScreenView({
//       screen_name: screenName,
//       screen_class: screenName,
//     });
//   } catch (error) {
//     console.error("Failed to log screen view:", error);
//   }
// };

// // Функция для отслеживания пользовательских событий
// export const logEvent = async (eventName, params = {}) => {
//   try {
//     if (Platform.OS === "web") return;
//     await analytics().logEvent(eventName, params);
//   } catch (error) {
//     console.error("Failed to log event:", error);
//   }
// };

// export default firebase;
