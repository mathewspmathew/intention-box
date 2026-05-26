import { Text, View, StyleSheet } from "react-native";
import { colors, radius, spacing, fontSize } from "../constants/theme";

type Props = { name: string };

export const BirthdayTag = ({ name }: Props) => (
  <View style={styles.tag}>
    <Text style={styles.text} numberOfLines={1}>
      🎂 {name}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.tag,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.mutedText,
  },
  text: { color: colors.primaryText, fontSize: fontSize.xs },
});
