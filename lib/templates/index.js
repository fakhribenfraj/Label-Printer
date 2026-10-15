import * as vertical from "./vertical.js";

// Add a layout = add a file exporting { Component } (+ import its CSS in app/print/page.js) and register it here.
export const templates = {
  vertical: { name: "Vertical 100×150 mm", ...vertical },
};
export const defaultTemplate = "vertical";
