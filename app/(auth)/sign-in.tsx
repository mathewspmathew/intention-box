import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { colors, fonts, fontSize, radius, spacing } from "../../constants/theme";

export default function SignIn() {
  const { signInWithGoogle, googleRequestReady, googleBusy, googleError } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <MaterialCommunityIcons name="candle" size={64} color={colors.accent} />
        <Text style={styles.title}>Intention Box</Text>
      </View>

      <View style={styles.form}>
        {googleError && <Text style={styles.error}>{googleError}</Text>}

        <Pressable
          onPress={signInWithGoogle}
          disabled={googleBusy || !googleRequestReady}
          style={[styles.primaryBtn, (googleBusy || !googleRequestReady) && { opacity: 0.6 }]}
        >
          {googleBusy ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <>
              <AntDesign name="google" size={18} color={colors.accent} />
              <Text style={styles.primaryBtnText}>CONTINUE WITH GOOGLE</Text>
            </>
          )}
        </Pressable>

        <Text style={styles.tagline}>Enter your sanctuary.</Text>
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
  primaryBtn: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.tag,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
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
  error: { color: colors.danger, marginTop: spacing.xs, fontSize: fontSize.sm, textAlign: "center" },
});
