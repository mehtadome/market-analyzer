export const PT_TIMEZONE = "America/Los_Angeles";

export function ptHour(): number {
  return parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: PT_TIMEZONE,
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
    10
  );
}
