export const buildNotificationTitle = (): string => "Evening Reflection";

export const buildNotificationBody = (count: number): string =>
  `You have ${count} prayer request${count === 1 ? "" : "s"} left for praying.`;

export const parseNotificationTime = (hhmm: string): { hour: number; minute: number } => {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  return { hour: h ?? 22, minute: m ?? 0 };
};
