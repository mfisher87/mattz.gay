/**
 * createCanvas: Creates a convenience object for interacting with a canvas.
 *
 * Responsible for providing a canvas 2D context object, canvas size, and
 * registering callbacks to enable animations to subscribe to size updates.
 *
 * @param {string} elementId - The ID of the canvas element
 * @returns {{
 *   context: CanvasRenderingContext2D,
 *   getDimensions: () => CanvasDimensions,
 *   onResize: (callback: (dimensions: CanvasDimensions) => void) => void,
 * }}
 */
export const createCanvas = (elementId) => {
  const element = document.getElementById(elementId);
  if (!(element instanceof HTMLCanvasElement)) {
    throw new Error(`No canvas element with id "${elementId}"`);
  }

  const context = element.getContext("2d");
  if (context === null) {
    throw new Error("Failed to obtain a 2D drawing context");
  }

  const applyDevicePixelSize = () => {
    element.width = element.offsetWidth * window.devicePixelRatio;
    element.height = element.offsetHeight * window.devicePixelRatio;
  };

  /** @returns {CanvasDimensions} */
  const getDimensions = () => ({
    width: element.width,
    height: element.height,
    devicePixelRatio: window.devicePixelRatio,
  });

  /** @type {Array<(dimensions: CanvasDimensions) => void>} */
  const resizeCallbacks = [];

  window.addEventListener("resize", () => {
    applyDevicePixelSize();
    const dimensions = getDimensions();
    for (const callback of resizeCallbacks) {
      callback(dimensions);
    }
  });

  applyDevicePixelSize();

  return {
    context,
    getDimensions,
    onResize: (callback) => {
      resizeCallbacks.push(callback);
    },
  };
};
