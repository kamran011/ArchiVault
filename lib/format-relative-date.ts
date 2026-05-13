export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) {
    return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (diffHours < 48) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}
