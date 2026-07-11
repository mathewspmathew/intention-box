import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Image } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useSettingsStore } from "../../stores/settingsStore";
import { useSettings } from "../../hooks/useSettings";
// Google Calendar / birthday sync — disabled for now, see notes near "Connections" section below.
// import { useGoogleCalendar } from "../../hooks/useGoogleCalendar";
import { NotificationTimeModal } from "../../components/NotificationTimeModal";
import { TopBarSpacer } from "../../components/TopBarSpacer";
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
  const { notificationTime, notificationsEnabled } = useSettingsStore();
  const { setSettings } = useSettings(user?.uid);
  // const { googleCalendarConnected } = useSettingsStore();
  // const { connect, syncBirthdays, googleCalendarRequestReady } = useGoogleCalendar();
  const [timeModal, setTimeModal] = useState(false);

  // const onConnect = async () => {
  //   const ok = await connect();
  //   if (ok) await setSettings({ googleCalendarConnected: true });
  // };

  return (
    <View style={styles.container}>
      <TopBarSpacer />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarBox}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person-circle-outline" size={48} color={colors.accent} />
          )}
        </View>
        {user?.email ? <Text style={styles.email}>{user.email}</Text> : null}
        <Text style={styles.tagline}>Nurturing stillness since {accountYear(user)}</Text>

        <SectionTitle title="Rituals & Preferences" />
        <View style={styles.card}>
          <View style={styles.rowItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Evening Reflection Notifications</Text>
              <Text style={styles.itemSub}>Nightly reminder of prayer requests left for today.</Text>
            </View>
            <Pressable
              onPress={() => setSettings({ notificationsEnabled: !notificationsEnabled })}
              style={[styles.toggleTrack, notificationsEnabled && styles.toggleTrackOn]}
            >
              <View style={[styles.toggleThumb, notificationsEnabled && styles.toggleThumbOn]} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => setTimeModal(true)}
            disabled={!notificationsEnabled}
            style={[styles.rowItem, !notificationsEnabled && { opacity: 0.4 }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Evening Reflection Time</Text>
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

        {/* Google Calendar connect / birthday sync — disabled for now.
            To restore: uncomment the useGoogleCalendar import/hook above and this block.
        <SectionTitle title="Connections" />
        {!googleCalendarConnected ? (
          <Pressable
            onPress={onConnect}
            disabled={!googleCalendarRequestReady}
            style={[styles.connectBtn, !googleCalendarRequestReady && { opacity: 0.6 }]}
          >
            <Feather name="calendar" size={18} color={colors.background} />
            <Text style={styles.connectText}>Connect Google Calendar</Text>
          </Pressable>
        ) : (
          <Pressable onPress={syncBirthdays} style={styles.connectBtn}>
            <Feather name="refresh-cw" size={18} color={colors.background} />
            <Text style={styles.connectText}>Sync Birthdays</Text>
          </Pressable>
        )}
        */}

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
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  email: { color: colors.primaryText, textAlign: "center", marginTop: spacing.md, fontSize: fontSize.sm, fontWeight: "600" },
  tagline: { color: colors.mutedText, textAlign: "center", marginTop: spacing.xs, fontSize: fontSize.md },
  sectionHeader: { marginTop: spacing.xxl, marginBottom: spacing.md, gap: spacing.xs },
  sectionTitle: { color: colors.accent, fontFamily: fonts.heading, fontSize: fontSize.lg, fontWeight: "600" },
  sectionLine: { height: 1, backgroundColor: colors.mutedText, opacity: 0.3 },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.lg },
  rowItem: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: radius.tag,
    borderWidth: 1,
    borderColor: colors.mutedText,
    backgroundColor: colors.background,
    padding: 2,
    justifyContent: "center",
  },
  toggleTrackOn: { borderColor: colors.accent, backgroundColor: colors.accent },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: radius.tag,
    backgroundColor: colors.mutedText,
  },
  toggleThumbOn: {
    backgroundColor: colors.primaryText,
    transform: [{ translateX: 20 }],
  },
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
  signOut: { alignSelf: "center", marginTop: spacing.xxxl, paddingVertical: spacing.sm },
  signOutText: { color: colors.mutedText, fontSize: fontSize.sm, textDecorationLine: "underline" },
});
