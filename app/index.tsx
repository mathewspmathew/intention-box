import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { colors } from "../constants/theme";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return user ? <Redirect href="/(tabs)/today" /> : <Redirect href="/(auth)/sign-in" />;
}
