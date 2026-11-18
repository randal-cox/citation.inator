import { DEFAULT_ACCESS_STORAGE_KEY, normalizeAccessProfile, accessProfileState } from "./access.mjs";

const stores = new WeakMap();
function storeFor({ accessStorageKey = DEFAULT_ACCESS_STORAGE_KEY, window: view = globalThis.window } = {}) {
  if (!view) throw new TypeError("Access profiles need a browser window.");
  if (typeof accessStorageKey !== "string" || !accessStorageKey.trim()) throw new TypeError("Supply a nonempty access storage key.");
  let storesForWindow = stores.get(view);
  if (!storesForWindow) {
    storesForWindow = new Map();
    stores.set(view, storesForWindow);
    view.addEventListener("storage", event => {
      for (const [key, store] of storesForWindow) {
        if (event.key === key || event.key === null) {
          store.profile = readProfile(view, key);
          for (const notify of store.listeners) notify();
        }
      }
    });
  }
  if (!storesForWindow.has(accessStorageKey)) storesForWindow.set(accessStorageKey, {
    profile: readProfile(view, accessStorageKey), listeners: new Set(), view, key: accessStorageKey
  });
  return storesForWindow.get(accessStorageKey);
}

function readProfile(view, key) {
  try {
    const value = JSON.parse(view.localStorage.getItem(key));
    return value === null ? null : normalizeAccessProfile(value);
  } catch { return null; }
}

export function getAccessProfile(options) {
  return structuredClone(storeFor(options).profile);
}

export function setAccessProfile(profile, options) {
  const store = storeFor(options);
  store.profile = normalizeAccessProfile(profile === null ? null : { ...profile, updatedAt: new Date().toISOString() });
  try {
    if (store.profile === null) store.view.localStorage.removeItem(store.key);
    else store.view.localStorage.setItem(store.key, JSON.stringify(store.profile));
  } catch { /* Retain the in-memory profile when browser storage is unavailable. */ }
  for (const notify of store.listeners) notify();
  return structuredClone(store.profile);
}

export function subscribeAccessProfile(callback, options) {
  const store = storeFor(options);
  const notify = () => callback({ profile: structuredClone(store.profile), state: accessProfileState(store.profile) });
  store.listeners.add(notify);
  return () => store.listeners.delete(notify);
}
