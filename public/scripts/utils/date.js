export function formatDateTime(timestamp) {
  return new Date(timestamp).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function todayAtMidnight() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function toDateFromInput(dateString) {
  if (!dateString) {
    return null;
  }

  const date = new Date(`${dateString}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function inferDueDateFromText(text) {
  if (!text) {
    return "";
  }

  const lower = text.toLowerCase();
  const output = new Date(todayAtMidnight());

  if (lower.includes("today")) {
    return output.toISOString().slice(0, 10);
  }

  if (lower.includes("tomorrow")) {
    output.setDate(output.getDate() + 1);
    return output.toISOString().slice(0, 10);
  }

  if (lower.includes("next week")) {
    output.setDate(output.getDate() + 7);
    return output.toISOString().slice(0, 10);
  }

  const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const match = weekdays.find((day) => lower.includes(day));
  if (!match) {
    return "";
  }

  const target = weekdays.indexOf(match);
  const delta = (target - output.getDay() + 7) % 7 || 7;
  output.setDate(output.getDate() + delta);
  return output.toISOString().slice(0, 10);
}

export function getTaskDueBucket(task) {
  if (task.completed) {
    return "completed";
  }

  const dueDate = toDateFromInput(task.dueDate);
  if (!dueDate) {
    return "unscheduled";
  }

  const today = todayAtMidnight();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  if (dueDate < today) {
    return "overdue";
  }

  if (dueDate.getTime() === today.getTime()) {
    return "today";
  }

  if (dueDate.getTime() === tomorrow.getTime()) {
    return "tomorrow";
  }

  if (dueDate <= nextWeek) {
    return "next7";
  }

  return "later";
 }
