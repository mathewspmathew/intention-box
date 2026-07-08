import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } from "@react-native-google-signin/google-signin";
import { auth } from "../services/firebase";
import { updateWidget } from "../services/widgetService";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_FIREBASE_GOOGLE_WEB_CLIENT_ID,
});

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      void updateWidget();
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    setGoogleError(null);
    setGoogleBusy(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const idToken = response.data.idToken;
        if (!idToken) throw new Error("Google sign-in did not return an ID token.");
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      }
    } catch (e: any) {
      if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) {
        // user closed the picker, no error to show
      } else {
        setGoogleError(e?.message ?? "Google sign-in failed.");
      }
    } finally {
      setGoogleBusy(false);
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
    googleRequestReady: true,
    googleBusy,
    googleError,
  };
};
