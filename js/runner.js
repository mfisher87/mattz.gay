/** @typedef {import('./canvas.js').CanvasDimensions} CanvasDimensions */

/**
 * type FrameTiming: Per-frame timing handed to an animation.
 *
 * @typedef {object} FrameTiming
 * @property {number} msSinceStart      Milliseconds since this animation last started.
 * @property {number} msSinceLastFrame  Milliseconds since the previous frame.
 */

/**
 * type Animation: A live animation instance.
 *
 * Produced by an animation factory and driven by the runner.
 *
 * @typedef {object} Animation
 * @property {(dimensions: CanvasDimensions) => void}  resize  Recompute properties dependent on canvas dimensions on resize.
 * @property {(frame: FrameTiming) => void}            draw    Render a single frame.
 */

/**
 * type AnimationFactory: Creates an animation (draw and resize functions).
 *
 * @typedef {(context: CanvasRenderingContext2D) => Animation} AnimationFactory
 */

/**
 * type AnimationSequenceEntry: One animation in the sequence and its playtime.
 *
 * @typedef {object} AnimationSequenceEntry
 * @property {AnimationFactory} create           Factory for the animation.
 * @property {number}           durationSeconds  Seconds to play it before advancing.
 */

/**
 * selectNextIndex: Returns the next index in the animation sequence, wrapping around at the end.
 *
 * @param {{ currentIndex: number, sequenceLength: number }} args
 * @returns {number}
 */
export const selectNextIndex = ({ currentIndex, sequenceLength }) =>
  (currentIndex + 1) % sequenceLength;

/**
 * createRunner: Plays a sequence of animations on a single rAF loop, looping forever.
 *
 * Each animation runs for its entry's durationSeconds, then the runner advances to the
 * next one (wrapping around).
 *
 * @param {{
 *   context: CanvasRenderingContext2D,
 *   getCanvasDimensions: () => CanvasDimensions,
 *   animationSequence: AnimationSequenceEntry[],
 * }} args
 * @returns {{ start: () => void, handleResize: (dimensions: CanvasDimensions) => void }}
 */
export const createRunner = ({ context, getCanvasDimensions, animationSequence }) => {
  if (animationSequence.length === 0) {
    throw new Error("Runner requires a non-empty animation sequence");
  }

  let currentIndex = 0;
  /** @type {Animation} */ let currentAnimation;
  /** @type {number | undefined} */ let animationStartTimestamp;
  /** @type {number | undefined} */ let previousFrameTimestamp;

  const startCurrentAnimation = () => {
    currentAnimation = animationSequence[currentIndex].create(context);
    currentAnimation.resize(getCanvasDimensions());
  };

  /** @param {number} timestamp */
  const drawFrame = (timestamp) => {
    const msSinceLastFrame =
      previousFrameTimestamp === undefined ? 0 : (timestamp - previousFrameTimestamp);
    previousFrameTimestamp = timestamp;

    if (animationStartTimestamp === undefined) {
      animationStartTimestamp = timestamp;
    }
    let msSinceStart = (timestamp - animationStartTimestamp);

    if (msSinceStart >= animationSequence[currentIndex].durationSeconds * 1000) {
      currentIndex = selectNextIndex({ currentIndex, sequenceLength: animationSequence.length });
      startCurrentAnimation();
      animationStartTimestamp = timestamp;
      msSinceStart = 0;
    }

    currentAnimation.draw({ msSinceStart, msSinceLastFrame });
    requestAnimationFrame(drawFrame);
  };

  return {
    start: () => {
      currentIndex = 0;
      startCurrentAnimation();
      animationStartTimestamp = undefined;
      previousFrameTimestamp = undefined;
      requestAnimationFrame(drawFrame);
    },
    /** @param {CanvasDimensions} dimensions */
    handleResize: (dimensions) => {
      currentAnimation?.resize(dimensions);
    },
  };
};
