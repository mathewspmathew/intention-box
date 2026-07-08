import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { useAuth } from "../hooks/useAuth";
import { useSettingsStore } from "../stores/settingsStore";
import { useSettings } from "../hooks/useSettings";
import {
  deleteHistoryEntry,
  listHistory,
  pruneHistoryOlderThan,
} from "../services/historyService";
import type { HistoryEntry } from "../types";
import { colors, fonts, fontSize, radius, spacing } from "../constants/theme";
import { fromISO } from "../utils/dateUtils";

type RetentionOption = { label: string; value: number };
const OPTIONS: RetentionOption[] = [
  { label: "7 days", value: 7 },
  { label: "1 month", value: 30 },
];

export default function CompletedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { historyRetentionDays } = useSettingsStore();
  const { setSettings } = useSettings(user?.uid);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (historyRetentionDays === 0) {
        const existing = await listHistory(user.uid);
        for (const e of existing) await deleteHistoryEntry(user.uid, e.id);
        setEntries([]);
        return;
      }
      if (historyRetentionDays > 0) {
        await pruneHistoryOlderThan(user.uid, historyRetentionDays);
      }
      const list = await listHistory(user.uid);
      list.sort((a, b) => (a.completedDate < b.completedDate ? 1 : -1));
      setEntries(list);
    } catch (e: any) {
      console.warn("history load failed", e?.message ?? e);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [user, historyRetentionDays]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onRetentionChange = async (value: number) => {
    await setSettings({ historyRetentionDays: value });
  };

  const onClearAll = async () => {
    if (!user) return;
    try {
      const existing = await listHistory(user.uid);
      for (const e of existing) await deleteHistoryEntry(user.uid, e.id);
      setEntries([]);
    } catch (e: any) {
      console.warn("clear history failed", e?.message ?? e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Feather name="chevron-left" size={26} color={colors.accent} />
        </Pressable>
        <Text style={styles.title}>Completed Intentions</Text>
        <Pressable onPress={onClearAll} hitSlop={12} style={styles.clearBtn}>
          <MaterialCommunityIcons name="broom" size={20} color={colors.accent} />
        </Pressable>
      </View>

      <View style={styles.retentionBox}>
        <Text style={styles.retentionLabel}>AUTO-DELETE AFTER</Text>
        <View style={styles.retentionRow}>
          {OPTIONS.map((opt) => {
            const selected = historyRetentionDays === opt.value;
            return (
              <Pressable
                key={opt.label}
                onPress={() => onRetentionChange(opt.value)}
                style={[styles.chip, selected && styles.chipActive]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>
            {historyRetentionDays === 0
              ? "History is off."
              : "No completed intentions yet."}
          </Text>
          <Text style={styles.emptySub}>
            {historyRetentionDays === 0
              ? "Pick 7 days or 1 month above to start backing up finished intentions."
              : "Finished intentions will appear here."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardDate}>
                {format(fromISO(item.completedDate), "MMM d, yyyy").toUpperCase()}
              </Text>
              <Text style={styles.cardText}>{item.text}</Text>
              <View style={styles.cardFooter}>
                <Feather name="check-circle" size={16} color={colors.accent} />
                <Text style={styles.cardMeta}>
                  Prayed for {item.totalDays} {item.totalDays === 1 ? "day" : "days"}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomColor: colors.background,
    borderBottomWidth: 1,
  },
  backBtn: { padding: spacing.xs, width: 32 },
  clearBtn: { padding: spacing.xs, width: 32, alignItems: "flex-end" },
  title: {
    flex: 1,
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: fontSize.lg,
    fontWeight: "600",
    textAlign: "center",
  },
  retentionBox: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  retentionLabel: { color: colors.accent, fontSize: fontSize.xs, fontWeight: "700", letterSpacing: 1.5 },
  retentionRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.accent, fontWeight: "600", fontSize: fontSize.sm },
  chipTextActive: { color: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm },
  empty: { color: colors.primaryText, fontSize: fontSize.md, fontFamily: fonts.heading, fontWeight: "600" },
  emptySub: { color: colors.mutedText, fontSize: fontSize.sm, textAlign: "center" },
  list: { padding: spacing.lg, gap: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  cardDate: { color: colors.accent, fontSize: fontSize.xs, fontWeight: "700", letterSpacing: 1 },
  cardText: { color: colors.primaryText, fontSize: fontSize.md, lineHeight: 22 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  cardMeta: { color: colors.mutedText, fontSize: fontSize.sm },
});
