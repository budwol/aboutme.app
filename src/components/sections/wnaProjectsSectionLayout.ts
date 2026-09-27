export type WnaProjectCardSpan = 1 | 2;

/**
 * Column spans for the home page's project cards, in project order.
 *
 * The first card is two columns wide when `featureFirst` is set. Cards then
 * wrap row by row; if the last row ends exactly one column short, its last
 * card is widened too, so the grid closes flush instead of leaving a gap
 * (featured top left, featured bottom right). Without a known column count
 * only the first card is featured.
 */
export function getProjectCardSpans(
  projectCount: number,
  columnCount: number | undefined,
  featureFirst: boolean,
): WnaProjectCardSpan[] {
  const spans = Array.from(
    { length: projectCount },
    (_, index): WnaProjectCardSpan => (index === 0 && featureFirst ? 2 : 1),
  );

  if (!featureFirst || columnCount === undefined || columnCount < 2) {
    return spans;
  }

  let usedColumns = 0;
  let lastRowStart = 0;
  spans.forEach((span, index) => {
    if (usedColumns + span > columnCount) {
      usedColumns = 0;
      lastRowStart = index;
    }
    usedColumns += span;
  });

  if (lastRowStart > 0 && columnCount - usedColumns === 1) {
    spans[projectCount - 1] = 2;
  }

  return spans;
}

export function getProjectColumnCount(
  gridWidth: number,
  cardWidth: number,
  gap: number,
): number {
  return Math.max(1, Math.floor((gridWidth + gap) / (cardWidth + gap)));
}
