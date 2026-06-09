/** @typedef {import('./runner.js').AnimationSequenceEntry} AnimationSequenceEntry */

import { createScrollingStripesAnimation } from "./animations/scrollingStripes.js";

/** @type {AnimationSequenceEntry[]} */
export const animationSequence = [
  { create: createScrollingStripesAnimation, durationSeconds: 3 },
];
