type UnreadMap = Record<string, number>;

const KEY = "chat_unread_map";

const safeParse = (raw: string | null): UnreadMap => {
  if (!raw) return {};
  try {
    const v = JSON.parse(raw);
    if (!v || typeof v !== "object") return {};
    return v as UnreadMap;
  } catch {
    return {};
  }
};

export const getUnreadMap = (): UnreadMap => safeParse(localStorage.getItem(KEY));

export const getUnreadTotal = (): number => {
  const map = getUnreadMap();
  return Object.values(map).reduce((sum, n) => sum + (Number(n) || 0), 0);
};

export const getUnreadForUser = (otherUserId: number): number => {
  const map = getUnreadMap();
  return Number(map[String(otherUserId)] || 0) || 0;
};

const save = (map: UnreadMap) => {
  localStorage.setItem(KEY, JSON.stringify(map));
  window.dispatchEvent(new CustomEvent("chat:unread", { detail: { map } }));
};

export const incrementUnread = (otherUserId: number, by = 1) => {
  const map = getUnreadMap();
  const k = String(otherUserId);
  map[k] = (Number(map[k]) || 0) + by;
  save(map);
};

export const clearUnread = (otherUserId: number) => {
  const map = getUnreadMap();
  const k = String(otherUserId);
  if (!map[k]) return;
  delete map[k];
  save(map);
};

export const clearAllUnread = () => {
  save({});
};
