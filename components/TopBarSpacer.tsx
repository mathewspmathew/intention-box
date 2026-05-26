import { View, StyleSheet } from "react-native";
import { colors, spacing } from "../constants/theme";

export const TopBarSpacer = () => <View style={styles.spacer} />;

const styles = StyleSheet.create({
  spacer: {
    height: spacing.xl + spacing.xl,
    backgroundColor: colors.background,
  },
});
