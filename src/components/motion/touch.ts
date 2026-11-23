// Shared touch primitives for gesture surfaces (drag handles, resize grips).
//
// - `-webkit-touch-callout: none` stops iOS's long-press callout.
// - `user-select: none` stops the long-press selection on every engine, and
//   stops a drag from painting a selection under the cursor.

/**
 * Classes for a surface that *is* the control: a handle, a grip, a thumb.
 * Selection is suppressed on every input, because a drag that highlights the
 * control's own label is wrong on a mouse too.
 */
export const TOUCH_GESTURE_CLASS = "select-none [-webkit-touch-callout:none]";

/**
 * Pointer capture, best effort. WebKit throws `NotFoundError` when the pointer
 * is already gone by the time the handler runs — routine on iOS, where the
 * system can claim the touch first — and an uncaught throw takes the rest of
 * the handler, the gesture included, down with it.
 */
export function capturePointer(element: Element, pointerId: number) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Pointer is no longer active — implicit capture still applies on touch.
  }
}

/** Release a capture taken with `capturePointer`, ignoring a stale pointer. */
export function releasePointer(element: Element, pointerId: number) {
  try {
    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }
  } catch {
    // Capture was already dropped by the browser.
  }
}
