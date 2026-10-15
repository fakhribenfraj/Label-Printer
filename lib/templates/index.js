import * as vertical from "./vertical.js";

// Add a layout = add a file exporting { css, render(labelData) } and register it here.
export const templates = {
  vertical: { name: "Vertical 100×150 mm", ...vertical },
};
export const defaultTemplate = "vertical";
