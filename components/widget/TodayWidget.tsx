import { FlexWidget, ListWidget, TextWidget } from "react-native-android-widget";
import type { WidgetSnapshot } from "../../services/widgetService";

const COLORS = {
  bg: "#1A1A1A",
  surface: "#242424",
  primary: "#FFFDF5",
  muted: "#888880",
  accent: "#C9A84C",
} as const;

type Props = {
  snapshot: WidgetSnapshot;
};

export const TodayWidget = ({ snapshot }: Props) => {
  const { signedIn, date, intentions } = snapshot;

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: "intentionbox://today" }}
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: COLORS.bg,
        borderRadius: 16,
        padding: 12,
        flexDirection: "column",
      }}
    >
      <FlexWidget
        style={{
          width: "match_parent",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <TextWidget
          text={date}
          style={{ fontSize: 14, color: COLORS.muted, fontFamily: "DM Sans" }}
        />
        <TextWidget
          text="Intention Box"
          style={{ fontSize: 12, color: COLORS.accent, fontFamily: "DM Sans" }}
        />
      </FlexWidget>

      {!signedIn ? (
        <FlexWidget
          style={{
            flex: 1,
            width: "match_parent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TextWidget
            text="Open app to sign in"
            style={{ fontSize: 14, color: COLORS.muted }}
          />
        </FlexWidget>
      ) : intentions.length === 0 ? (
        <FlexWidget
          style={{
            flex: 1,
            width: "match_parent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TextWidget
            text="No intentions today"
            style={{ fontSize: 14, color: COLORS.muted }}
          />
        </FlexWidget>
      ) : (
        <ListWidget style={{ height: "match_parent", width: "match_parent" }}>
          {intentions.map((text, idx) => (
            <FlexWidget
              key={`${idx}-${text}`}
              style={{
                width: "match_parent",
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 6,
                paddingHorizontal: 4,
              }}
            >
              <FlexWidget
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: COLORS.accent,
                  marginRight: 10,
                }}
              />
              <TextWidget
                text={text}
                maxLines={1}
                style={{ fontSize: 14, color: COLORS.primary }}
              />
            </FlexWidget>
          ))}
        </ListWidget>
      )}
    </FlexWidget>
  );
};
