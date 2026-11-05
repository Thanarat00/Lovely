import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEY, loadProgress, reduce } from "../lib/progress.js";

export function useProgress() {
  const [state, setState] = useState(loadProgress);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* private mode can block storage; the story still runs */
    }
  }, [state]);

  const dispatch = useCallback((action) => {
    setState((current) => reduce(current, action));
  }, []);

  return [state, dispatch];
}
