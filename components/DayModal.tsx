import { Modal, View, Text, Pressable, StyleSheet, ScrollView, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { Intention } from "../types";
import { colors, radius, spacing, fontSize } from "../constants/theme";

type Props = {
  visible: boolean;
  dateLabel: string;
  intentions: Intention[];
  onClose: () => void;
  onDelete?: (intention: Intention) => void;
};

export const DayModal = ({ visible, dateLabel, intentions, onClose, onDelete }: Props) => {
  const confirmDelete = (intention: Intention) => {
    Alert.alert(
      "Delete intention?",
      `"${intention.text}" will be removed permanently.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete?.(intention) },
      ],
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>{dateLabel}</Text>
          <ScrollView style={styles.list}>
            {intentions.length === 0 ? (
              <Text style={styles.empty}>No intentions for this day.</Text>
            ) : (
              intentions.map((i) => (
                <View key={i.id} style={styles.row}>
                  <Text style={styles.text}>{i.text}</Text>
                  {onDelete && (
                    <Pressable
                      onPress={() => confirmDelete(i)}
                      hitSlop={10}
                      style={styles.deleteBtn}
                    >
                      <Feather name="x" size={18} color={colors.danger} />
                    </Pressable>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: spacing.xl },
  sheet: { backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.xl },
  title: { color: colors.primaryText, fontSize: fontSize.lg, fontWeight: "600", marginBottom: spacing.md },
  list: { maxHeight: 320 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomColor: colors.background,
    borderBottomWidth: 1,
  },
  text: { color: colors.primaryText, fontSize: fontSize.md, flex: 1 },
  deleteBtn: { padding: spacing.xs },
  empty: { color: colors.mutedText, fontSize: fontSize.md },
});
