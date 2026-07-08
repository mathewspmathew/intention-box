import { Platform } from "react-native";
import { registerWidgetTaskHandler } from "react-native-android-widget";
import { widgetTaskHandler } from "../components/widget/TodayWidgetTask";

if (Platform.OS === "android") {
  registerWidgetTaskHandler(widgetTaskHandler);
}
