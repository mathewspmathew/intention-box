import { useRef } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useIntentions } from "../../hooks/useIntentions";
import { IntentionCard } from "../../components/IntentionCard";
import { AddIntentionSheet, type AddIntentionSheetRef } from "../../components/AddIntentionSheet";
import { GlobalAddButton } from "../../components/GlobalAddButton";
import { TopBarSpacer } from "../../components/TopBarSpacer";
import { colors, fonts, fontSize, radius, spacing } from "../../constants/theme";
import { todayISO } from "../../utils/dateUtils";

export default function TodayScreen() {
  const { user } = useAuth();
  const { intentions, add, edit, remove, markPrayed } = useIntentions(user?.uid);
  const sheetRef = useRef<AddIntentionSheetRef>(null);

  const today = todayISO();
  const active = intentions.filter(
    (i) => i.active && i.startDate <= today && today <= i.currentEndDate,
  );

  const prayAll = async () => {
    for (const item of active) await markPrayed(item);
  };

  return (
    <View style={styles.container}>
      <TopBarSpacer />
      <View style={styles.intro}>
        <Text style={styles.heading}>Today's Intentions</Text>
        <Text style={styles.subtitle}>May your prayers find their way.</Text>
      </View>

      {active.length === 0 ? (
        <Text style={styles.empty}>No intentions for today. Tap + to add one.</Text>
      ) : (
        <FlatList
          data={active}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <IntentionCard
              intention={item}
              highlighted={index === 0}
              onEdit={() =>
                sheetRef.current?.open({
                  id: item.id,
                  text: item.text,
                  durationDays: item.durationDays,
                })
              }
            />
          )}
        />
      )}

      {active.length > 0 && (
        <View style={styles.footer}>
          <Pressable onPress={prayAll} style={styles.prayAllBtn}>
            <Text style={styles.prayAllText}>Mark all as Prayed</Text>
          </Pressable>
        </View>
      )}

      <GlobalAddButton onPress={() => sheetRef.current?.open()} />

      <AddIntentionSheet
        ref={sheetRef}
        onSubmit={({ text, durationDays, id }) => {
          if (id) edit(id, { text, durationDays });
          else add(text, durationDays);
        }}
        onDelete={(id) => remove(id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  intro: { alignItems: "center", paddingVertical: spacing.lg, gap: spacing.xs },
  heading: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: fontSize.xl, fontWeight: "600" },
  subtitle: { color: colors.mutedText, fontSize: fontSize.md },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 160 },
  empty: { color: colors.mutedText, textAlign: "center", marginTop: spacing.xxxl, fontSize: fontSize.md, paddingHorizontal: spacing.xl },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 72,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  prayAllBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  prayAllText: { color: colors.background, fontSize: fontSize.md, fontWeight: "700", letterSpacing: 0.5 },
});
