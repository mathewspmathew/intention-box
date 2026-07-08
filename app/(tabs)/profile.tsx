import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { useAuth } from "../../hooks/useAuth";
import { useSettingsStore } from "../../stores/settingsStore";
import { useSettings } from "../../hooks/useSettings";
import { useGoogleCalendar } from "../../hooks/useGoogleCalendar";
import { NotificationTimeModal } from "../../components/NotificationTimeModal";
import { TopBarSpacer } from "../../components/TopBarSpacer";
import {
  NOTIFICATION_CATEGORY,
  NOTIFICATION_CHANNEL,
  setupNotificationCategory,
} from "../../services/notificationService";
import { colors, fonts, fontSize, radius, spacing } from "../../constants/theme";

const formatTime12 = (hhmm: string) => {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${period}`;
};

const accountYear = (user: { metadata?: { creationTime?: string } } | null | undefined): number => {
  const t = user?.metadata?.creationTime;
  if (t) {
    const d = new Date(t);
    if (!isNaN(d.getTime())) return d.getFullYear();
  }
  return new Date().getFullYear();
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { notificationTime, googleCalendarConnected } = useSettingsStore();
  const { setSettings } = useSettings(user?.uid);
  const { connect, syncBirthdays } = useGoogleCalendar();
  const [timeModal, setTimeModal] = useState(false);

  const onConnect = async () => {
    const ok = await connect();
    if (ok) await setSettings({ googleCalendarConnected: true });
  };

  const testNotification = async () => {
    try {
      await setupNotificationCategory();
      const perms = await Notifications.getPermissionsAsync();
      let status = perms.status;
      if (status !== "granted") {
        const req = await Notifications.requestPermissionsAsync();
        status = req.status;
      }
      if (status !== "granted") {
        Alert.alert("Permission required", "Notification permission is denied. Enable it in Settings → Apps → Expo Go → Notifications.");
        return;
      }
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Evening Reflection (test)",
          body: "If you see this, notifications are working.",
          categoryIdentifier: NOTIFICATION_CATEGORY,
          color: colors.accent,
          data: { test: true },
        },
        trigger: { seconds: 5, channelId: NOTIFICATION_CHANNEL } as any,
      });
      const pending = await Notifications.getAllScheduledNotificationsAsync();
      Alert.alert(
        "Scheduled",
        `id: ${id}\nstatus: ${status}\npending count: ${pending.length}\nFires in ~5s. Background the app with Home if you want to see it as a system notification.`,
      );
    } catch (e: any) {
      Alert.alert("Schedule failed", e?.message ?? String(e));
    }
  };

  return (
    <View style={styles.container}>
      <TopBarSpacer />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarBox}>
          <Ionicons name="person-circle-outline" size={48} color={colors.accent} />
        </View>
        {user?.email ? <Text style={styles.email}>{user.email}</Text> : null}
        <Text style={styles.tagline}>Nurturing stillness since {accountYear(user)}</Text>

        <SectionTitle title="Rituals & Preferences" />
        <View style={styles.card}>
          <Pressable onPress={() => setTimeModal(true)} style={styles.rowItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Evening Reflection</Text>
              <Text style={styles.itemSub}>Daily gentle reminder to close the day.</Text>
            </View>
            <View style={styles.timeBox}>
              <Text style={styles.timeText}>{formatTime12(notificationTime)}</Text>
              <Feather name="clock" size={14} color={colors.mutedText} />
            </View>
          </Pressable>

        </View>

        <SectionTitle title="Journal" />
        <Pressable onPress={() => router.push("/completed")} style={styles.navRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>Completed Intentions</Text>
            <Text style={styles.itemSub}>View intentions you've prayed through.</Text>
          </View>
          <Feather name="chevron-right" size={22} color={colors.accent} />
        </Pressable>

        <SectionTitle title="Connections" />
        {!googleCalendarConnected ? (
          <Pressable onPress={onConnect} style={styles.connectBtn}>
            <Feather name="calendar" size={18} color={colors.background} />
            <Text style={styles.connectText}>Connect Google Calendar</Text>
          </Pressable>
        ) : (
          <Pressable onPress={syncBirthdays} style={styles.connectBtn}>
            <Feather name="refresh-cw" size={18} color={colors.background} />
            <Text style={styles.connectText}>Sync Birthdays</Text>
          </Pressable>
        )}

        <SectionTitle title="Debug" />
        <Pressable onPress={testNotification} style={styles.debugBtn}>
          <Feather name="bell" size={18} color={colors.accent} />
          <Text style={styles.debugText}>Test Notification (5s)</Text>
        </Pressable>

        <Pressable onPress={signOut} style={styles.signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>

      <NotificationTimeModal
        visible={timeModal}
        initial={notificationTime}
        onClose={() => setTimeModal(false)}
        onSave={(t) => setSettings({ notificationTime: t })}
      />
    </View>
  );
}

const SectionTitle = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionLine} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  avatarBox: {
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  email: { color: colors.primaryText, textAlign: "center", marginTop: spacing.md, fontSize: fontSize.sm, fontWeight: "600" },
  tagline: { color: colors.mutedText, textAlign: "center", marginTop: spacing.xs, fontSize: fontSize.md },
  sectionHeader: { marginTop: spacing.xxl, marginBottom: spacing.md, gap: spacing.xs },
  sectionTitle: { color: colors.accent, fontFamily: fonts.heading, fontSize: fontSize.lg, fontWeight: "600" },
  sectionLine: { height: 1, backgroundColor: colors.mutedText, opacity: 0.3 },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.lg },
  rowItem: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  itemTitle: { color: colors.primaryText, fontSize: fontSize.md, fontWeight: "600", marginBottom: spacing.xs },
  itemSub: { color: colors.mutedText, fontSize: fontSize.sm, lineHeight: 18 },
  timeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderBottomColor: colors.mutedText,
    borderBottomWidth: 1,
    paddingBottom: spacing.xs,
  },
  timeText: { color: colors.primaryText, fontSize: fontSize.md, fontWeight: "600" },
  divider: { height: 1, backgroundColor: colors.background, marginVertical: spacing.md },
  connectBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  connectText: { color: colors.background, fontWeight: "700", fontSize: fontSize.md, letterSpacing: 0.5 },
  debugBtn: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  debugText: { color: colors.accent, fontWeight: "700", fontSize: fontSize.md, letterSpacing: 0.5 },
  signOut: { alignSelf: "center", marginTop: spacing.xxxl, paddingVertical: spacing.sm },
  signOutText: { color: colors.mutedText, fontSize: fontSize.sm, textDecorationLine: "underline" },
});
