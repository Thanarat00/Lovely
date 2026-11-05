import assert from "node:assert/strict";
import test from "node:test";
import { letter, sky, stars, surprise } from "../src/content/copy.js";
import { canAdvance, freshProgress, reduce, sanitize } from "../src/lib/progress.js";

test("sky, stars, letter, and closing lines stay intact", () => {
  assert.equal(sky.title, "วันนี้เหนื่อยไหมคนเก่ง 🌻");
  assert.equal(sky.lede, "ถ้ากำลังแบกอะไรอยู่ วางตรงนี้ก่อนได้เลย");
  assert.equal(sky.cta, "เข้ามาพักก่อน");
  assert.deepEqual(stars.messages, [
    "ไม่ต้องเก่งตลอดเวลาก็ได้นะ",
    "วันนี้เหนื่อยก็พักบ้างน้า",
    "ขอให้มีเรื่องดี ๆ เข้ามาเยอะ ๆ",
    "เธอสมควรได้รับวันที่สดใสนะ",
    "อย่าลืมยิ้มให้ตัวเองบ้างนะ",
  ]);
  const body = letter.paragraphs.map((item) => item.text).join("\n");
  assert.match(body, /ถึงเธอคนเก่ง/);
  assert.match(body, /จากคนที่อยากเห็นเธอยิ้ม/);
  assert.equal(surprise.title, "ขอบคุณที่แวะมาพักนะ 🌻");
  assert.equal(surprise.lede, "หวังว่าตอนนี้จะเบาลงอีกนิด");
  assert.match(body, /วางตรงนี้แป๊บหนึ่งได้เลย/);
});

test("sunflower growth only moves one stage at a time", () => {
  let state = freshProgress();
  state = reduce(state, { type: "SUN" });
  assert.equal(state.gardenStep, 0);
  state = reduce(state, { type: "PLANT" });
  state = reduce(state, { type: "PLANT" });
  assert.equal(state.gardenStep, 1);
  state = reduce(state, { type: "SUN" });
  state = reduce(state, { type: "WATER" });
  assert.equal(state.gardenStep, 3);
  state = reduce(state, { type: "BLOOM" });
  assert.equal(state.gardenStep, 4);
  assert.equal(reduce(state, { type: "BLOOM" }).gardenStep, 4);
  assert.equal(canAdvance(state, 1), true);
});

test("scenes unlock in order and replay keeps the garden", () => {
  let state = freshProgress();
  state = reduce(state, { type: "GO", scene: 2 });
  assert.equal(state.unlocked, 0);

  state = reduce(state, { type: "GO", scene: 1 });
  assert.equal(state.unlocked, 1);
  state = reduce(state, { type: "GO", scene: 2 });
  assert.equal(state.unlocked, 1);

  state = reduce(state, { type: "PLANT" });
  state = reduce(state, { type: "GO", scene: 2 });
  assert.equal(state.scene, 2);
  assert.equal(state.unlocked, 2);

  const replayed = reduce(state, { type: "REPLAY" });
  assert.equal(replayed.scene, 0);
  assert.equal(replayed.gardenStep, 1);
  assert.equal(replayed.unlocked, 2);
});

test("stars, rainbow, mood, and letter gate the later scenes", () => {
  let state = sanitize({
    scene: 2,
    unlocked: 2,
    gardenStep: 4,
    stars: [false, false, false, false, false],
  });
  assert.equal(canAdvance(state, 2), false);
  state = reduce(state, { type: "COLLECT_STAR", index: 0 });
  assert.equal(canAdvance(state, 2), true);
  state = reduce(state, { type: "COLLECT_STAR", index: 4 });
  state = reduce(state, { type: "COLLECT_STAR", index: 4 });
  state = reduce(state, { type: "COLLECT_STAR", index: 9 });
  assert.equal(state.stars.filter(Boolean).length, 2);

  state = reduce(state, { type: "GO", scene: 3 });
  for (let index = 0; index < 5; index += 1) {
    state = reduce(state, { type: "SELECT_BAND", index });
  }
  state = reduce(state, { type: "GO", scene: 4 });
  state = reduce(state, { type: "SET_MOOD", mood: "angry" });
  assert.equal(state.mood, null);
  state = reduce(state, { type: "SET_MOOD", mood: "tired" });
  state = reduce(state, { type: "GO", scene: 5 });
  assert.equal(canAdvance(state, 5), false);
  state = reduce(state, { type: "OPEN_LETTER" });
  state = reduce(state, { type: "GO", scene: 6 });
  assert.equal(state.unlocked, 6);
  assert.equal(state.scene, 6);
});

test("corrupt saves cannot skip ahead of finished games", () => {
  const cleaned = sanitize({
    scene: 6,
    unlocked: 6,
    gardenStep: 1,
    stars: [true, false, false, false, false],
    bands: "nope",
    mood: "sad",
    letterOpened: "false",
  });
  assert.equal(cleaned.unlocked, 3);
  assert.equal(cleaned.scene, 3);
  assert.equal(cleaned.letterOpened, false);
  assert.deepEqual(cleaned.bands, [false, false, false, false, false]);
});

test("reset returns a fresh story", () => {
  let state = freshProgress();
  state = reduce(state, { type: "PLANT" });
  state = reduce(state, { type: "RESET" });
  assert.deepEqual(state, freshProgress());
});
