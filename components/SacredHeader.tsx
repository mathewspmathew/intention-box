import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fonts, fontSize, spacing } from "../constants/theme";

type Props = {
  onBellPress?: () => void;
};

export const SacredHeader = ({ onBellPress }: Props) => (
  <View style={styles.bar}>
    <View style={styles.spacer} />
    <Text style={styles.title}>Sacred Intentions</Text>
    <Pressable onPress={onBellPress} hitSlop={12} style={styles.iconBtn}>
      <MaterialCommunityIcons name="bell-outline" size={24} color={colors.accent} />
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomColor: colors.background,
    borderBottomWidth: 1,
  },
  iconBtn: { padding: spacing.xs, minWidth: 32, alignItems: "flex-end" },
  spacer: { minWidth: 32 },
  title: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: fontSize.lg,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
});
