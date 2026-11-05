import assert from "node:assert/strict";
import test from "node:test";
import { letter, moods, rainbow } from "../src/content/copy.js";
import { buildLetter } from "../src/lib/buildLetter.js";
import { freshProgress } from "../src/lib/progress.js";
import { rollPlay } from "../src/lib/rollPlay.js";

function played(overrides) {
  return { ...freshProgress(), gardenStep: 1, ...overrides };
}

test("every mood has letter copy and every band has letter copy", () => {
  for (const option of moods.options) assert.ok(letter.parts.mood[option.id]?.length, option.id);
  assert.equal(letter.parts.bands.length, rainbow.bands.length);
});

test("letter reflects the mood the player picked", () => {
  for (let run = 0; run < 20; run += 1) {
    const pieces = rollPlay().letter;
    for (const option of moods.options) {
      const body = buildLetter(played({ mood: option.id, stars: [true, false, false, false, false] }), pieces);
      assert.ok(letter.parts.mood[option.id].includes(body[0]), `${option.id} opens with its own line`);
    }
  }
});

test("letter reflects the band and the star count that were really chosen", () => {
  const pieces = rollPlay().letter;
  const body = buildLetter(
    played({ mood: "tired", stars: [true, true, true, false, false], bands: [false, false, true, false, false] }),
    pieces,
  ).join("\n");
  assert.ok(letter.parts.bands[2].some((line) => body.includes(line)));
  assert.match(body, /3 ดวง/);
  assert.doesNotMatch(body, /\{n\}/);
});

test("letter never claims things the player did not do", () => {
  const pieces = rollPlay().letter;
  const body = buildLetter(
    { ...freshProgress(), mood: "happy", stars: [false, false, false, false, false], bands: [false, false, false, false, false] },
    pieces,
  );
  assert.equal(body.length, 2, "only the mood line and the closing line");
  assert.ok(letter.parts.mood.happy.includes(body[0]));
});

test("choosing several bands is acknowledged with the real count", () => {
  const pieces = rollPlay().letter;
  const body = buildLetter(
    played({ mood: "sad", stars: [true, false, false, false, false], bands: [true, true, false, false, true] }),
    pieces,
  ).join("\n");
  assert.match(body, /3 สี/);
});
