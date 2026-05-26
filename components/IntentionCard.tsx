import { Text, View, Pressable, StyleSheet } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import type { Intention } from "../types";
import { colors, radius, spacing, fontSize } from "../constants/theme";
import { daysBetween, todayISO } from "../utils/dateUtils";

type Props = {
  intention: Intention;
  onEdit: () => void;
  highlighted?: boolean;
};

export const IntentionCard = ({ intention, onEdit, highlighted = false }: Props) => {
  const today = todayISO();
  const prayedToday = (intention.prayedDates ?? []).includes(today);
  const baseRemaining = Math.max(0, daysBetween(today, intention.currentEndDate) + 1);
  const daysRemaining = prayedToday ? Math.max(0, baseRemaining - 1) : baseRemaining;
  const completed = prayedToday && baseRemaining <= 1;

  return (
    <View
      style={[
        styles.card,
        highlighted && !prayedToday && styles.cardHighlighted,
        prayedToday && styles.cardPrayed,
      ]}
    >
      <View style={styles.row}>
        <Text style={[styles.text, prayedToday && styles.textPrayed]}>{intention.text}</Text>
        {!prayedToday && (
          <Pressable onPress={onEdit} hitSlop={8} style={styles.editBtn}>
            <Feather name="edit-2" size={18} color={colors.accent} />
          </Pressable>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        {completed ? (
          <>
            <Text style={styles.meta}>PRAYED TODAY</Text>
            <View style={styles.prayedPill}>
              <MaterialCommunityIcons name="check-circle" size={16} color={colors.background} />
              <Text style={styles.prayedPillText}>Completed</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.meta}>
              {daysRemaining} {daysRemaining === 1 ? "DAY" : "DAYS"} REMAINING
            </Text>
            {prayedToday && (
              <View style={styles.prayedPill}>
                <MaterialCommunityIcons name="check-circle" size={16} color={colors.background} />
                <Text style={styles.prayedPillText}>Prayed</Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardHighlighted: { borderColor: colors.accent },
  cardPrayed: { opacity: 0.7, borderColor: colors.accent },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  text: { color: colors.primaryText, fontSize: fontSize.md, flex: 1, lineHeight: 22 },
  textPrayed: {
    textDecorationLine: "line-through",
    color: colors.mutedText,
  },
  editBtn: { padding: spacing.xs, marginLeft: spacing.md },
  divider: { height: 1, backgroundColor: colors.mutedText, opacity: 0.2, marginVertical: spacing.md },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  meta: { color: colors.accent, fontSize: fontSize.xs, fontWeight: "700", letterSpacing: 1 },
  prayedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.button,
  },
  prayedPillText: {
    color: colors.background,
    fontSize: fontSize.sm,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
