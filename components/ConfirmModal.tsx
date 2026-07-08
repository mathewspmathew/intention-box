import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { colors, radius, spacing, fontSize, fonts } from "../constants/theme";

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmModal = ({
  visible,
  title,
  message,
  confirmLabel = "Yes",
  cancelLabel = "No",
  destructive = true,
  onConfirm,
  onCancel,
}: Props) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <Pressable style={styles.backdrop} onPress={onCancel}>
      <Pressable style={styles.sheet} onPress={() => {}}>
        <Text style={styles.title}>{title}</Text>
        {message && <Text style={styles.message}>{message}</Text>}
        <View style={styles.actions}>
          <Pressable onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            style={[styles.confirmBtn, destructive && styles.confirmBtnDestructive]}
          >
            <Text style={[styles.confirmText, destructive && styles.confirmTextDestructive]}>
              {confirmLabel}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
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
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  title: {
    color: colors.primaryText,
    fontSize: fontSize.lg,
    fontFamily: fonts.heading,
    fontWeight: "600",
  },
  message: {
    color: colors.mutedText,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.mutedText,
  },
  cancelText: { color: colors.mutedText, fontWeight: "600", fontSize: fontSize.sm },
  confirmBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
    backgroundColor: colors.accent,
  },
  confirmBtnDestructive: { backgroundColor: colors.danger },
  confirmText: { color: colors.background, fontWeight: "700", fontSize: fontSize.sm },
  confirmTextDestructive: { color: colors.primaryText },
});
