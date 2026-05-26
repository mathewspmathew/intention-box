import { Text, View, StyleSheet } from "react-native";
import { colors, radius, spacing, fontSize } from "../constants/theme";

type Props = { text: string };

export const IntentionTag = ({ text }: Props) => (
  <View style={styles.tag}>
    <Text style={styles.text} numberOfLines={1}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  tag: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.tag,
    alignSelf: "flex-start",
  },
  text: { color: colors.background, fontSize: fontSize.xs, fontWeight: "600" },
});
