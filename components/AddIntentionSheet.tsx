import { forwardRef, useMemo, useState, useImperativeHandle, useRef } from "react";
import { Text, View, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import { colors, fonts, radius, spacing, fontSize } from "../constants/theme";

export type AddIntentionSheetRef = {
  open: (initial?: { text?: string; durationDays?: number; id?: string }) => void;
  close: () => void;
};

type Props = {
  onSubmit: (args: { text: string; durationDays: number; id?: string }) => void;
  onDelete?: (id: string) => void;
};

const PRESETS = [1, 3, 7] as const;

export const AddIntentionSheet = forwardRef<AddIntentionSheetRef, Props>(({ onSubmit, onDelete }, ref) => {
  const sheetRef = useRef<BottomSheet>(null);
  const [text, setText] = useState("");
  const [preset, setPreset] = useState<number | "custom" | null>(null);
  const [customDays, setCustomDays] = useState(7);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const snapPoints = useMemo(() => ["75%"], []);

  useImperativeHandle(ref, () => ({
    open: (initial) => {
      setText(initial?.text ?? "");
      const d = initial?.durationDays;
      if (d && (PRESETS as readonly number[]).includes(d)) {
        setPreset(d);
        setCustomDays(7);
      } else if (d) {
        setPreset("custom");
        setCustomDays(d);
      } else {
        setPreset(null);
        setCustomDays(7);
      }
      setEditingId(initial?.id);
      sheetRef.current?.expand();
    },
    close: () => sheetRef.current?.close(),
  }));

  const resolvedDays = (): number | null => {
    if (preset === "custom") return customDays > 0 ? customDays : null;
    return typeof preset === "number" ? preset : null;
  };

  const submit = () => {
    const n = resolvedDays();
    if (!text.trim() || n === null) return;
    onSubmit({ text: text.trim(), durationDays: n, id: editingId });
    sheetRef.current?.close();
  };

  const requestDelete = () => {
    if (!editingId || !onDelete) return;
    Alert.alert(
      "Delete intention?",
      `"${text}" will be removed permanently.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(editingId);
            sheetRef.current?.close();
          },
        },
      ],
    );
  };

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      index={-1}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.mutedText }}
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{editingId ? "Edit Intention" : "New Intention"}</Text>
          <View style={styles.headerActions}>
            {editingId && onDelete && (
              <Pressable onPress={requestDelete} hitSlop={8} style={styles.deleteBtn}>
                <Feather name="x" size={20} color={colors.danger} />
              </Pressable>
            )}
            <Pressable onPress={() => sheetRef.current?.close()} hitSlop={8}>
              <Feather name="x" size={24} color={colors.primaryText} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.fieldLabel}>THE INTENTION</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Write your focus..."
          placeholderTextColor={colors.mutedText}
          style={styles.textInput}
          multiline
        />
        <View style={styles.underline} />

        <Text style={[styles.fieldLabel, { marginTop: spacing.xl }]}>DURATION (DAYS)</Text>
        <View style={styles.chipRow}>
          {PRESETS.map((d) => (
            <Pressable
              key={d}
              onPress={() => setPreset(d)}
              style={[styles.chip, preset === d && styles.chipActive]}
            >
              <Text style={[styles.chipText, preset === d && styles.chipTextActive]}>
                {d} {d === 1 ? "day" : "days"}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => setPreset("custom")}
            style={[styles.chip, preset === "custom" && styles.chipActive]}
          >
            <Text style={[styles.chipText, preset === "custom" && styles.chipTextActive]}>
              Custom
            </Text>
          </Pressable>
        </View>

        {preset === "custom" && (
          <View style={styles.stepperRow}>
            <Pressable
              onPress={() => setCustomDays(Math.max(1, customDays - 1))}
              style={styles.stepBtn}
            >
              <Feather name="minus" size={20} color={colors.primaryText} />
            </Pressable>
            <Text style={styles.stepValue}>{customDays}</Text>
            <Pressable onPress={() => setCustomDays(customDays + 1)} style={styles.stepBtn}>
              <Feather name="plus" size={20} color={colors.primaryText} />
            </Pressable>
          </View>
        )}

        <View style={{ flex: 1 }} />

        <Pressable onPress={submit} style={styles.button}>
          <Text style={styles.buttonText}>SEAL INTENTION</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
});

AddIntentionSheet.displayName = "AddIntentionSheet";

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, gap: spacing.sm },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: fontSize.lg, fontWeight: "600" },
  fieldLabel: { color: colors.accent, fontSize: fontSize.xs, fontWeight: "700", letterSpacing: 1.5, marginTop: spacing.lg },
  textInput: {
    color: colors.primaryText,
    fontSize: fontSize.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  underline: { height: 1, backgroundColor: colors.mutedText, opacity: 0.3 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.accent, fontWeight: "600" },
  chipTextActive: { color: colors.background },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.tag,
    borderWidth: 1,
    borderColor: colors.mutedText,
    alignItems: "center",
    justifyContent: "center",
  },
  stepValue: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 32,
    fontWeight: "600",
    minWidth: 60,
    textAlign: "center",
    borderBottomColor: colors.mutedText,
    borderBottomWidth: 1,
    paddingBottom: spacing.xs,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  buttonText: { color: colors.background, fontWeight: "700", fontSize: fontSize.md, letterSpacing: 2 },
});
