import { useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { colors, radius, spacing, fontSize, fonts } from "../constants/theme";
import { parseNotificationTime } from "../utils/notificationUtils";

type Props = {
  visible: boolean;
  initial: string;
  onClose: () => void;
  onSave: (hhmm: string) => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

export const NotificationTimeModal = ({ visible, initial, onClose, onSave }: Props) => {
  const { hour, minute } = parseNotificationTime(initial);
  const [hour24, setHour24] = useState(hour);
  const [min, setMin] = useState(minute);

  const isPM = hour24 >= 12;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  const setHour12 = (h12: number) => {
    const next = isPM ? (h12 === 12 ? 12 : h12 + 12) : h12 === 12 ? 0 : h12;
    setHour24(next);
  };

  const togglePeriod = (toPM: boolean) => {
    if (toPM === isPM) return;
    setHour24((hour24 + 12) % 24);
  };

  const stepHour = (delta: number) => {
    const next = ((hour12 - 1 + delta + 12) % 12) + 1;
    setHour12(next);
  };

  const stepMin = (delta: number) => setMin((min + delta + 60) % 60);

  const save = () => {
    onSave(`${pad(hour24)}:${pad(min)}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.eyebrow}>Evening Reflection</Text>
          <View style={styles.divider} />

          <View style={styles.timeRow}>
            <Stepper onUp={() => stepHour(1)} onDown={() => stepHour(-1)}>
              <Text style={styles.timeText}>{pad(hour12)}</Text>
            </Stepper>
            <Text style={styles.colon}>:</Text>
            <Stepper onUp={() => stepMin(1)} onDown={() => stepMin(-1)}>
              <Text style={styles.timeText}>{pad(min)}</Text>
            </Stepper>
          </View>

          <View style={styles.periodRow}>
            <Pressable
              onPress={() => togglePeriod(false)}
              style={[styles.periodBtn, !isPM && styles.periodActive]}
            >
              <Text style={[styles.periodText, !isPM && styles.periodTextActive]}>AM</Text>
            </Pressable>
            <Pressable
              onPress={() => togglePeriod(true)}
              style={[styles.periodBtn, isPM && styles.periodActive]}
            >
              <Text style={[styles.periodText, isPM && styles.periodTextActive]}>PM</Text>
            </Pressable>
          </View>

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={save} style={styles.saveBtn}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

type StepperProps = { onUp: () => void; onDown: () => void; children: React.ReactNode };

const Stepper = ({ onUp, onDown, children }: StepperProps) => (
  <View style={styles.stepperCol}>
    <Pressable onPress={onUp} hitSlop={12} style={styles.chevronBtn}>
      <Text style={styles.chevron}>⌃</Text>
    </Pressable>
    {children}
    <Pressable onPress={onDown} hitSlop={12} style={styles.chevronBtn}>
      <Text style={[styles.chevron, styles.chevronDown]}>⌃</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: fontSize.lg,
    fontFamily: fonts.heading,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: colors.mutedText,
    opacity: 0.3,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  stepperCol: { alignItems: "center", gap: spacing.sm },
  chevronBtn: { paddingHorizontal: spacing.md },
  chevron: {
    color: colors.accent,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg,
  },
  chevronDown: { transform: [{ rotate: "180deg" }] },
  timeText: {
    color: colors.primaryText,
    fontSize: 56,
    fontFamily: fonts.heading,
    fontWeight: "600",
    minWidth: 80,
    textAlign: "center",
  },
  colon: {
    color: colors.primaryText,
    fontSize: 56,
    fontFamily: fonts.heading,
    fontWeight: "600",
    paddingBottom: spacing.sm,
  },
  periodRow: {
    flexDirection: "row",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.button,
    overflow: "hidden",
  },
  periodBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    minWidth: 72,
    alignItems: "center",
  },
  periodActive: { backgroundColor: colors.accent },
  periodText: { color: colors.accent, fontWeight: "600", letterSpacing: 1 },
  periodTextActive: { color: colors.background },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
  },
  cancelBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  cancelText: { color: colors.mutedText, fontSize: fontSize.md },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  saveText: { color: colors.background, fontWeight: "600", fontSize: fontSize.md },
});
