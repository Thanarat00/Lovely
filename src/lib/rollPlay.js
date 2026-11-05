import { comfortLines, garden, letter, moods, rainbow, sky, stars, surprise } from "../content/copy.js";

function shuffle(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function rollPlay() {
  const starPool = shuffle([...stars.messages, ...comfortLines, ...sky.lines]);
  return {
    sky: pick(sky.lines),
    bloom: pick(garden.bloomingLines),
    garden: pick(garden.payoffs),
    stars: starPool.slice(0, 5),
    rainbow: rainbow.bands.map((band) => pick(band.lines)),
    moods: Object.fromEntries(moods.options.map((item) => [item.id, pick(item.lines)])),
    letter: {
      mood: Object.fromEntries(Object.entries(letter.parts.mood).map(([id, list]) => [id, pick(list)])),
      garden: pick(letter.parts.garden),
      starsOne: pick(letter.parts.starsOne),
      starsMany: pick(letter.parts.starsMany),
      bands: letter.parts.bands.map((list) => pick(list)),
      bandsMore: letter.parts.bandsMore,
      closing: pick(letter.parts.closing),
    },
    notes: shuffle(surprise.notes),
  };
}
