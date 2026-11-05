import { createContext, useContext } from "react";

const PlayContext = createContext(null);

export function PlayProvider({ play, children }) {
  return <PlayContext.Provider value={play}>{children}</PlayContext.Provider>;
}

export function usePlay() {
  return useContext(PlayContext);
}
