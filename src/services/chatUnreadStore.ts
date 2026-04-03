type UnreadMap = Record<string, number>;

const KEY = "chat_unread_map";
const PROCESSED_KEY = "chat_processed_messages";

const getProcessedIds = (): Set<string> => {
  const raw = localStorage.getItem(PROCESSED_KEY);
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};

const saveProcessedIds = (ids: Set<string>) => {
  const arr = Array.from(ids).slice(-100); // Keep only last 100 to avoid bloat
  localStorage.setItem(PROCESSED_KEY, JSON.stringify(arr));
};

export const isMessageProcessed = (msgId: string | number): boolean => {
  const ids = getProcessedIds();
  return ids.has(String(msgId));
};

export const markMessageProcessed = (msgId: string | number) => {
  const ids = getProcessedIds();
  ids.add(String(msgId));
  saveProcessedIds(ids);
};

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
