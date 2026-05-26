import { useState } from "react";
import { View, Text, Pressable, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { colors, fonts, fontSize, radius, spacing } from "../../constants/theme";

export default function SignIn() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!email || password.length < 6) {
      setError("Enter a valid email and a password of at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") await signIn(email, password);
      else await signUp(email, password);
    } catch (e: any) {
      setError(e?.message ?? "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <MaterialCommunityIcons name="candle" size={64} color={colors.accent} />
        <Text style={styles.title}>Intention Box</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.mutedText}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.mutedText}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable onPress={submit} disabled={busy} style={[styles.primaryBtn, busy && { opacity: 0.6 }]}>
          {busy ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <Text style={styles.primaryBtnText}>
              {mode === "signin" ? "CONTINUE" : "CREATE ACCOUNT"}
            </Text>
          )}
        </Pressable>

        <Text style={styles.tagline}>Enter your sanctuary.</Text>

        <Pressable onPress={() => setMode(mode === "signin" ? "signup" : "signin")}>
          <Text style={styles.switch}>
            {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  title: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 40,
    fontWeight: "600",
    textAlign: "center",
  },
  form: { gap: spacing.md },
  input: {
    backgroundColor: colors.surface,
    color: colors.primaryText,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.md,
  },
  primaryBtn: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.tag,
    paddingVertical: spacing.lg,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  primaryBtnText: {
    color: colors.accent,
    fontWeight: "700",
    letterSpacing: 2,
    fontSize: fontSize.md,
  },
  tagline: {
    color: colors.mutedText,
    fontSize: fontSize.md,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  switch: {
    color: colors.mutedText,
    marginTop: spacing.md,
    textAlign: "center",
    fontSize: fontSize.sm,
  },
  error: { color: colors.danger, marginTop: spacing.xs, fontSize: fontSize.sm, textAlign: "center" },
});
