/**
 * Builds the letter body from what the player actually did, so every line
 * refers to something that really happened in this play.
 * `pieces` is the per-play random pick from rollPlay().letter.
 */
export function buildLetter(progress, pieces) {
  const lines = [];

  if (progress.mood && pieces.mood[progress.mood]) lines.push(pieces.mood[progress.mood]);

  if (progress.gardenStep >= 1) lines.push(pieces.garden);

  const starCount = progress.stars.filter(Boolean).length;
  if (starCount === 1) lines.push(pieces.starsOne);
  if (starCount > 1) lines.push(pieces.starsMany.replace("{n}", String(starCount)));

  const bandIndexes = progress.bands.flatMap((on, index) => (on ? [index] : []));
  if (bandIndexes.length) {
    let text = pieces.bands[bandIndexes[0]];
    if (bandIndexes.length > 1) {
      text = `${text}\n${pieces.bandsMore.replace("{n}", String(bandIndexes.length))}`;
    }
    lines.push(text);
  }

  lines.push(pieces.closing);
  return lines;
}
