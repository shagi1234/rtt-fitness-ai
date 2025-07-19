// import { initializeApp, getApps } from 'firebase/app';
// import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const firebaseConfig = {
//   apiKey: "your-api-key",
//   authDomain: "your-project.firebaseapp.com",
//   projectId: "your-project-id",
//   storageBucket: "your-project.appspot.com",
//   messagingSenderId: "123456789",
//   appId: "your-app-id"
// };

// // Initialize Firebase
// let app;
// if (getApps().length === 0) {
//   app = initializeApp(firebaseConfig);
// } else {
//   app = getApps()[0];
// }

// // Initialize Auth with AsyncStorage persistence
// let auth;
// try {
//   auth = initializeAuth(app, {
//     persistence: getReactNativePersistence(AsyncStorage)
//   });
// } catch (error) {
//   // If already initialized, get the existing instance
//   auth = getAuth(app);
// }

// export { authFirebase };
// export default app;

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
