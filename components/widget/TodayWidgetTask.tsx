import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { readSnapshot } from "../../services/widgetService";
import { TodayWidget } from "./TodayWidget";

const nameToWidget = {
  TodayWidget,
};

export const widgetTaskHandler = async (props: WidgetTaskHandlerProps): Promise<void> => {
  const widgetInfo = props.widgetInfo;
  const Widget = nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];
  if (!Widget) return;

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED": {
      const snapshot = await readSnapshot();
      props.renderWidget(<Widget snapshot={snapshot} />);
      break;
    }
    case "WIDGET_DELETED":
    case "WIDGET_CLICK":
    default:
      break;
  }
};
