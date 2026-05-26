import { useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useIntentions } from "../../hooks/useIntentions";
import { useCalendarData } from "../../hooks/useCalendarData";
import { GlobalAddButton } from "../../components/GlobalAddButton";
import { AddIntentionSheet, type AddIntentionSheetRef } from "../../components/AddIntentionSheet";
import { DayModal } from "../../components/DayModal";
import { TopBarSpacer } from "../../components/TopBarSpacer";
import { colors, fonts, fontSize, radius, spacing } from "../../constants/theme";
import { isToday, todayISO } from "../../utils/dateUtils";

export default function CalendarScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { add, remove } = useIntentions(user?.uid);
  const { dayIntentions, markedDates } = useCalendarData();
  const sheetRef = useRef<AddIntentionSheetRef>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const onDayPress = (d: { dateString: string }) => {
    if (isToday(d.dateString)) {
      router.push("/(tabs)/today");
      return;
    }
    setSelectedDay(d.dateString);
  };

  const goToToday = () => setResetKey((k) => k + 1);

  return (
    <View style={styles.container}>
      <TopBarSpacer />
      <View style={styles.topBar}>
        <Pressable onPress={goToToday} style={styles.todayBtn}>
          <Text style={styles.todayBtnLabel}>Today</Text>
        </Pressable>
      </View>

      <Calendar
        key={resetKey}
        current={todayISO()}
        onDayPress={onDayPress}
        markedDates={{
          ...markedDates,
          [todayISO()]: {
            ...(markedDates[todayISO()] ?? {}),
            selected: true,
            selectedColor: "transparent",
            selectedTextColor: colors.accent,
            customStyles: {
              container: {
                borderWidth: 1,
                borderColor: colors.accent,
                borderRadius: radius.tag,
              },
              text: { color: colors.accent, fontWeight: "700" },
            },
          },
        }}
        markingType="custom"
        theme={{
          calendarBackground: colors.background,
          dayTextColor: colors.primaryText,
          monthTextColor: colors.primaryText,
          textMonthFontFamily: fonts.heading,
          textMonthFontSize: 28,
          textMonthFontWeight: "600",
          textDisabledColor: colors.mutedText,
          arrowColor: colors.accent,
          todayTextColor: colors.accent,
          textSectionTitleColor: colors.mutedText,
          dotColor: colors.accent,
          selectedDotColor: colors.accent,
        }}
      />

      <GlobalAddButton onPress={() => sheetRef.current?.open()} />
      <AddIntentionSheet
        ref={sheetRef}
        onSubmit={({ text, durationDays }) => add(text, durationDays)}
        onDelete={(id) => remove(id)}
      />
      <DayModal
        visible={!!selectedDay}
        dateLabel={selectedDay ?? ""}
        intentions={selectedDay ? dayIntentions[selectedDay] ?? [] : []}
        onClose={() => setSelectedDay(null)}
        onDelete={(it) => remove(it.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  todayBtn: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.button,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  todayBtnLabel: { color: colors.accent, fontWeight: "700", letterSpacing: 1, fontSize: fontSize.sm },
});
