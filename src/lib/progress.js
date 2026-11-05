export const STORAGE_KEY = "sunflower-sky-v1";

const MOODS = ["tired", "sad", "stressed", "happy"];

export function freshProgress() {
  return {
    scene: 0,
    unlocked: 0,
    gardenStep: 0,
    stars: [false, false, false, false, false],
    bands: [false, false, false, false, false],
    mood: null,
    letterOpened: false,
    surprisePlayed: false,
  };
}

function boolAt(list, index) {
  return Array.isArray(list) && list[index] === true;
}

export function sanitize(input) {
  const next = freshProgress();
  if (!input || typeof input !== "object") return next;

  const scene = Number(input.scene);
  const unlocked = Number(input.unlocked);
  const step = Number(input.gardenStep);

  next.scene = Number.isInteger(scene) && scene >= 0 && scene <= 6 ? scene : 0;
  next.unlocked = Number.isInteger(unlocked) && unlocked >= 0 && unlocked <= 6 ? unlocked : 0;
  next.gardenStep = Number.isInteger(step) && step >= 0 && step <= 4 ? step : 0;
  next.stars = Array.from({ length: 5 }, (_, index) => boolAt(input.stars, index));
  next.bands = Array.from({ length: 5 }, (_, index) => boolAt(input.bands, index));
  next.mood = MOODS.includes(input.mood) ? input.mood : null;
  next.letterOpened = input.letterOpened === true;
  next.surprisePlayed = input.surprisePlayed === true;

  if (next.gardenStep < 1 && next.unlocked > 1) next.unlocked = 1;
  if (!next.stars.some(Boolean) && next.unlocked > 2) next.unlocked = 2;
  if (!next.bands.some(Boolean) && next.unlocked > 3) next.unlocked = 3;
  if (!next.mood && next.unlocked > 4) next.unlocked = 4;
  if (!next.letterOpened && next.unlocked > 5) next.unlocked = 5;
  if (next.scene > next.unlocked) next.scene = next.unlocked;
  return next;
}

export function canAdvance(state, sceneIndex) {
  switch (sceneIndex) {
    case 0:
      return true;
    case 1:
      return state.gardenStep >= 1;
    case 2:
      return state.stars.some(Boolean);
    case 3:
      return state.bands.some(Boolean);
    case 4:
      return state.mood != null;
    case 5:
      return state.letterOpened === true;
    default:
      return false;
  }
}

function withFlag(state, key, index) {
  if (!Number.isInteger(index) || index < 0 || index > 4) return state;
  if (state[key][index]) return state;
  const copy = state[key].slice();
  copy[index] = true;
  return { ...state, [key]: copy };
}

export function reduce(state, action) {
  switch (action?.type) {
    case "PLANT":
      return state.gardenStep === 0 ? { ...state, gardenStep: 1 } : state;
    case "SUN":
      return state.gardenStep === 1 ? { ...state, gardenStep: 2 } : state;
    case "WATER":
      return state.gardenStep === 2 ? { ...state, gardenStep: 3 } : state;
    case "BLOOM":
      return state.gardenStep === 3 ? { ...state, gardenStep: 4 } : state;
    case "COLLECT_STAR":
      return withFlag(state, "stars", action.index);
    case "SELECT_BAND":
      return withFlag(state, "bands", action.index);
    case "SET_MOOD":
      if (!MOODS.includes(action.mood) || state.mood === action.mood) return state;
      return { ...state, mood: action.mood };
    case "OPEN_LETTER":
      return state.letterOpened ? state : { ...state, letterOpened: true };
    case "PLAY_SURPRISE":
      return state.surprisePlayed ? state : { ...state, surprisePlayed: true };
    case "SEEN": {
      const scene = action.scene;
      if (!Number.isInteger(scene) || scene < 0 || scene > state.unlocked || scene === state.scene) {
        return state;
      }
      return { ...state, scene };
    }
    case "GO": {
      const next = action.scene;
      if (!Number.isInteger(next) || next < 0 || next > 6) return state;
      if (next <= state.unlocked) {
        return next === state.scene ? state : { ...state, scene: next };
      }
      if (next !== state.unlocked + 1 || !canAdvance(state, next - 1)) return state;
      return { ...state, scene: next, unlocked: next };
    }
    case "REPLAY":
      return state.scene === 0 ? state : { ...state, scene: 0 };
    case "RESET":
      return freshProgress();
    default:
      return state;
  }
}

export function loadProgress() {
  if (typeof localStorage === "undefined") return freshProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshProgress();
    return sanitize(JSON.parse(raw));
  } catch {
    return freshProgress();
  }
}
