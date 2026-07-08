import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  // @ts-ignore - getReactNativePersistence is exported but not in the public typings
  getReactNativePersistence,
  type Auth,
} from "firebase/auth";
import { initializeFirestore, getFirestore, type Firestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? extra.FIREBASE_API_KEY ?? "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? extra.FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? extra.FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? extra.FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? extra.FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? extra.FIREBASE_APP_ID ?? "",
};

const isNewApp = getApps().length === 0;
export const app: FirebaseApp = isNewApp ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = isNewApp
  ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
  : getAuth(app);

export const db: Firestore = isNewApp
  ? initializeFirestore(app, { experimentalForceLongPolling: true })
  : getFirestore(app);
