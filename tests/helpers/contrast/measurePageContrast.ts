import { Page } from "@playwright/test";
import {
  measureTextContrast,
  requiredContrastRatio,
  toHex,
} from "./contrastMath";

export type ContrastTheme = "light" | "dark";

export type ContrastFinding = {
  text: string;
  element: string;
  ratio: number;
  required: number;
  textColor: string;
  backgroundColor: string;
  fontSize: number;
};

type TextBox = {
  text: string;
  element: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontWeight: number;
  isGraphic: boolean;
};

const HIDE_TEXT_STYLE_ID = "contrast-test-hide-text";

// Sets the stored theme before any app script runs, so the first render
// already uses it (see src/storage/themeStorage.ts).
export async function useStoredTheme(page: Page, theme: ContrastTheme) {
  await page.addInitScript((value) => {
    window.localStorage.setItem("theme", value);
  }, theme);
}

async function waitUntilSettled(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  // Endless decorative animations never settle; the screenshots reset them
  // to their start (animations: "disabled"), so both captures still match.
  await page.waitForFunction(
    () =>
      document
        .getAnimations()
        .every(
          (animation) =>
            animation.playState !== "running" ||
            animation.effect?.getTiming().iterations === Infinity,
        ),
    undefined,
    { timeout: 10000 },
  );
  // Two frames so layout and paint caught up with the last change.
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

// Every visible, unobstructed line of text inside the viewport.
async function collectTextBoxes(page: Page): Promise<TextBox[]> {
  return page.evaluate(() => {
    const describe = (element: Element) => {
      const labelled = element.closest("[aria-label],[id],button,a,h1,h2,h3");
      const anchor = labelled ?? element;
      const tag = anchor.tagName.toLowerCase();
      const id = anchor.id ? `#${anchor.id}` : "";
      const label = anchor.getAttribute("aria-label");
      return `${tag}${id}${label ? `[aria-label="${label}"]` : ""}`;
    };
    const effectiveOpacity = (element: Element | null) => {
      let opacity = 1;
      for (let node = element; node; node = node.parentElement) {
        opacity *= Number(getComputedStyle(node).opacity);
      }
      return opacity;
    };

    const boxes: TextBox[] = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent?.replace(/\s+/g, " ").trim() ?? "";
      const element = node.parentElement;
      if (!text || !element) continue;

      const style = getComputedStyle(element);
      if (style.visibility !== "visible") continue;
      if (style.color.startsWith("rgba") && style.color.endsWith(", 0)"))
        continue;
      if (effectiveOpacity(element) < 0.05) continue;

      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of Array.from(range.getClientRects())) {
        if (rect.width < 2 || rect.height < 2) continue;
        if (
          rect.left < 0 ||
          rect.top < 0 ||
          rect.right > window.innerWidth ||
          rect.bottom > window.innerHeight
        ) {
          continue;
        }
        // Skip text hidden behind the header, a modal or anything else.
        const hit = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        );
        if (
          !hit ||
          !(hit === element || element.contains(hit) || hit.contains(element))
        ) {
          continue;
        }
        boxes.push({
          text: text.slice(0, 60),
          element: describe(element),
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          fontSize: parseFloat(style.fontSize),
          fontWeight: Number(style.fontWeight) || 400,
          isGraphic: element.closest('[aria-hidden="true"]') !== null,
        });
      }
    }
    return boxes;
  });
}

async function setTextHidden(page: Page, hidden: boolean) {
  await page.evaluate(
    ({ id, hidden }) => {
      document.getElementById(id)?.remove();
      if (!hidden) return;
      const style = document.createElement("style");
      style.id = id;
      // Only glyphs disappear; backgrounds, borders and images stay.
      style.textContent = `* {
        color: transparent !important;
        -webkit-text-fill-color: transparent !important;
        text-shadow: none !important;
        text-decoration-color: transparent !important;
        transition: none !important;
      }`;
      document.head.append(style);
    },
    { id: HIDE_TEXT_STYLE_ID, hidden },
  );
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

// Decodes both screenshots in the browser (no PNG library needed) and
// returns the RGBA pixels of every text box from each.
async function readBoxPixels(
  page: Page,
  withText: Buffer,
  withoutText: Buffer,
  boxes: TextBox[],
) {
  return page.evaluate(
    async ({ withText, withoutText, boxes }) => {
      const decode = async (base64: string) => {
        const blob = await (
          await fetch(`data:image/png;base64,${base64}`)
        ).blob();
        const bitmap = await createImageBitmap(blob);
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const context = canvas.getContext("2d", { willReadFrequently: true })!;
        context.drawImage(bitmap, 0, 0);
        return { context, scale: bitmap.width / window.innerWidth };
      };
      const a = await decode(withText);
      const b = await decode(withoutText);
      return boxes.map((box) => {
        const x = Math.round(box.x * a.scale);
        const y = Math.round(box.y * a.scale);
        const width = Math.max(1, Math.round(box.width * a.scale));
        const height = Math.max(1, Math.round(box.height * a.scale));
        return {
          withText: Array.from(
            a.context.getImageData(x, y, width, height).data,
          ),
          withoutText: Array.from(
            b.context.getImageData(x, y, width, height).data,
          ),
        };
      });
    },
    {
      withText: withText.toString("base64"),
      withoutText: withoutText.toString("base64"),
      boxes,
    },
  );
}

async function measureViewport(page: Page): Promise<ContrastFinding[]> {
  await waitUntilSettled(page);
  const boxes = await collectTextBoxes(page);
  if (boxes.length === 0) return [];

  const withText = await page.screenshot({
    animations: "disabled",
    caret: "hide",
  });
  await setTextHidden(page, true);
  const withoutText = await page.screenshot({
    animations: "disabled",
    caret: "hide",
  });
  await setTextHidden(page, false);

  const pixels = await readBoxPixels(page, withText, withoutText, boxes);
  return boxes.map((box, index) => {
    const measurement = measureTextContrast(
      pixels[index].withText,
      pixels[index].withoutText,
    );
    return {
      text: box.text,
      element: box.element,
      ratio: Math.round(measurement.ratio * 100) / 100,
      required: requiredContrastRatio(
        box.fontSize,
        box.fontWeight,
        box.isGraphic,
      ),
      textColor: toHex(measurement.text),
      backgroundColor: toHex(measurement.background),
      fontSize: box.fontSize,
    };
  });
}

// The app scrolls inside its own container, not the document.
async function scrollContainerTo(page: Page, top: number) {
  return page.evaluate((top) => {
    let scroller: HTMLElement | null = null;
    for (const element of Array.from(
      document.querySelectorAll<HTMLElement>("*"),
    )) {
      const overflow = getComputedStyle(element).overflowY;
      if (
        (overflow === "auto" || overflow === "scroll") &&
        element.scrollHeight > element.clientHeight + 1 &&
        (!scroller || element.scrollHeight > scroller.scrollHeight)
      ) {
        scroller = element;
      }
    }
    if (!scroller) return { scrollTop: 0, maxScrollTop: 0, clientHeight: 0 };
    scroller.scrollTo({ top, behavior: "instant" });
    return {
      scrollTop: scroller.scrollTop,
      maxScrollTop: scroller.scrollHeight - scroller.clientHeight,
      clientHeight: scroller.clientHeight,
    };
  }, top);
}

/**
 * Measures the rendered contrast of every text line on the current page,
 * scrolling through it viewport by viewport. Returns only the lines below
 * the WCAG AA minimum, each once with its worst measurement.
 */
export async function findContrastProblems(
  page: Page,
): Promise<ContrastFinding[]> {
  const worst = new Map<string, ContrastFinding>();
  const record = (findings: ContrastFinding[]) => {
    for (const finding of findings) {
      const key = `${finding.element}|${finding.text}`;
      const known = worst.get(key);
      if (!known || finding.ratio < known.ratio) worst.set(key, finding);
    }
  };

  let position = await scrollContainerTo(page, 0);
  record(await measureViewport(page));
  // Step by most of a screen so nothing is only ever half visible.
  const step = Math.max(200, position.clientHeight - 160);
  while (position.scrollTop < position.maxScrollTop) {
    position = await scrollContainerTo(page, position.scrollTop + step);
    record(await measureViewport(page));
  }

  return [...worst.values()]
    .filter((finding) => finding.ratio < finding.required)
    .sort((a, b) => a.ratio - b.ratio);
}

export function formatFindings(findings: ContrastFinding[]): string {
  return findings
    .map(
      (finding) =>
        `${finding.ratio.toFixed(2)} < ${finding.required} · "${finding.text}" · ` +
        `${finding.textColor} on ${finding.backgroundColor} · ${finding.fontSize}px · ${finding.element}`,
    )
    .join("\n");
}
