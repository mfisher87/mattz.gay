/** @typedef {import('../canvas.js').CanvasDimensions} CanvasDimensions */
/** @typedef {import('../runner.js').FrameTiming} FrameTiming */
/** @typedef {import('../runner.js').Animation} Animation */

import { PRIDE_COLORS } from "../colors.js";

const SCROLL_PIXELS_PER_SECOND = 1200;

/**
 * computeStripeLayout: Computes stripe dimensions for a given canvas height.
 *
 * @param {{ height: number, colorCount: number }} args
 * @returns {{ stripeHeight: number, stripeCount: number, cycleHeight: number }}
 */
export const computeStripeLayout = ({ height, colorCount }) => {
  // display half the colors on screen at once
  const stripeHeight = (height / colorCount) * 2;

  // render +1 extra stripe to account for the stripe scrolling in from offscreen
  const stripeCount = Math.ceil(height / stripeHeight) + 1;

  const cycleHeight = stripeHeight * colorCount;
  return { stripeHeight, stripeCount, cycleHeight };
};

/**
 * createScrollingStripesAnimation: Creates a scrolling pride-stripes animation.
 *
 * Derives stripe layout on canvas resize and scrolls the palette vertically at
 * a fixed pixels-per-second rate on each frame.
 *
 * @param {CanvasRenderingContext2D} context
 * @returns {Animation}
 */
export const createScrollingStripesAnimation = (context) => {
  /** @type {number} */ let canvasWidth;
  /** @type {number} */ let canvasHeight;
  /** @type {number} */ let stripeHeight;
  /** @type {number} */ let stripeCount;
  /** @type {number} */ let cycleHeight;
  let scrollOffset = 0;

  /** @param {CanvasDimensions} dimensions */
  const resize = (dimensions) => {
    canvasWidth = dimensions.width;
    canvasHeight = dimensions.height;
    ({ stripeHeight, stripeCount, cycleHeight } = computeStripeLayout({
      height: dimensions.height,
      colorCount: PRIDE_COLORS.length,
    }));
  };

  /** @param {FrameTiming} arg */
  const draw = ({ msSinceLastFrame }) => {
    scrollOffset += SCROLL_PIXELS_PER_SECOND * (msSinceLastFrame / 1000);
    if (scrollOffset >= cycleHeight) {
      scrollOffset -= cycleHeight;
    }

    context.clearRect(0, 0, canvasWidth, canvasHeight);

    const startY = -(scrollOffset % stripeHeight);
    const firstColorIndex = Math.floor(scrollOffset / stripeHeight);
    for (let stripeIndex = 0; stripeIndex < stripeCount; stripeIndex++) {
      const y = startY + stripeIndex * stripeHeight;
      const colorIndex = (firstColorIndex + stripeIndex) % PRIDE_COLORS.length;

      context.fillStyle = PRIDE_COLORS[colorIndex];
      context.fillRect(0, y, canvasWidth, stripeHeight + 1);
    }
  };

  return { resize, draw };
};
