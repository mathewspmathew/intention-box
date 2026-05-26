import { Pressable, Text, View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, fontSize, radius, spacing } from "../constants/theme";

type Props = { onPress: () => void };

export const GlobalAddButton = ({ onPress }: Props) => (
  <View style={styles.wrap}>
    <Pressable onPress={onPress} style={styles.button}>
      <Feather name="plus" size={18} color={colors.accent} />
      <Text style={styles.label}>Add Intention</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
  },
  label: { color: colors.accent, fontSize: fontSize.md, fontWeight: "600" },
});
