import { useCallback, useEffect, useSyncExternalStore } from "react";

type SetStateAction<T> = T | ((prev: T) => T);

function dispatchStorageEvent(key: string, newValue: string | null): void {
  window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
}

const setLocalStorageItem = <T>(key: string, value: T): void => {
  const stringifiedValue = JSON.stringify(value);
  window.localStorage.setItem(key, stringifiedValue);
  dispatchStorageEvent(key, stringifiedValue);
};

const removeLocalStorageItem = (key: string): void => {
  window.localStorage.removeItem(key);
  dispatchStorageEvent(key, null);
};

const getLocalStorageItem = (key: string): string | null => {
  return window.localStorage.getItem(key);
};

const useLocalStorageSubscribe = (callback: () => void): (() => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getLocalStorageServerSnapshot = (): never => {
  throw Error("useLocalStorage is a client-only hook");
};

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: SetStateAction<T>) => void, () => void] {
  const getSnapshot = () => getLocalStorageItem(key);

  const store = useSyncExternalStore(
    useLocalStorageSubscribe,
    getSnapshot,
    getLocalStorageServerSnapshot,
  );

  const setState = useCallback(
    (v: SetStateAction<T>) => {
      try {
        const nextState =
          typeof v === "function"
            ? (v as (prev: T) => T)(JSON.parse(store!))
            : v;

        if (nextState === undefined || nextState === null) {
          removeLocalStorageItem(key);
        } else {
          setLocalStorageItem(key, nextState);
        }
      } catch (e) {
        console.warn(e);
      }
    },
    [key, store],
  );

  useEffect(() => {
    if (
      getLocalStorageItem(key) === null &&
      typeof initialValue !== "undefined"
    ) {
      setLocalStorageItem(key, initialValue);
    }
  }, [key, initialValue]);

  const remove = useCallback(() => {
    removeLocalStorageItem(key);
  }, [key]);

  return [store ? (JSON.parse(store) as T) : initialValue, setState, remove];
}
