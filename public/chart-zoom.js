// Zoom changes only the visible axes. Recorded values are never modified.
export const CHART_PLOT = { left: 86, right: 978, top: 24, bottom: 392 };

export function clampViewport(view, bounds) {
  const result = {};
  for (const axis of ["x", "y"]) {
    const min = `${axis}Min`,
      max = `${axis}Max`;
    const full = bounds[max] - bounds[min];
    const span = Math.max(full / 1000, Math.min(full, view[max] - view[min]));
    result[min] = Math.max(
      bounds[min],
      Math.min(bounds[max] - span, view[min]),
    );
    result[max] = result[min] + span;
  }
  return result;
}

export function scaleViewport(view, bounds, factor) {
  const next = {};
  for (const axis of ["x", "y"]) {
    const min = `${axis}Min`,
      max = `${axis}Max`;
    const middle = (view[min] + view[max]) / 2;
    const half = ((view[max] - view[min]) * factor) / 2;
    next[min] = middle - half;
    next[max] = middle + half;
  }
  return clampViewport(next, bounds);
}

export function createChartZoom(svg, controls, redraw) {
  const find = (id) => controls.querySelector(`#${id}`);
  const zoomIn = find("chart-zoom-in"),
    zoomOut = find("chart-zoom-out");
  const reset = find("chart-zoom-reset"),
    mode = find("chart-drag-mode");
  const status = find("chart-zoom-status");
  let bounds, view, context, gesture, frame;
  let plot = CHART_PLOT;

  function updateControls() {
    const xZoom = bounds
      ? (bounds.xMax - bounds.xMin) / (view.xMax - view.xMin)
      : 1;
    const yZoom = bounds
      ? (bounds.yMax - bounds.yMin) / (view.yMax - view.yMin)
      : 1;
    zoomIn.disabled = !bounds || (xZoom >= 999 && yZoom >= 999);
    zoomOut.disabled = reset.disabled =
      !bounds || (xZoom < 1.001 && yZoom < 1.001);
    mode.disabled = !bounds;
    status.textContent = !bounds
      ? ""
      : reset.disabled
        ? "Full view"
        : `Time ${xZoom.toFixed(1)}× · Values ${yZoom.toFixed(1)}×`;
    svg.dataset.dragMode = mode.value;
  }
  function change(next) {
    view = clampViewport(next, bounds);
    updateControls();
    redraw();
  }
  function cancelGesture() {
    if (!gesture) return;
    const previous = gesture;
    gesture = null;
    cancelAnimationFrame(frame);
    previous.box?.remove();
    svg.classList.remove("chart-dragging");
    if (svg.hasPointerCapture(previous.id))
      svg.releasePointerCapture(previous.id);
  }
  function point(event) {
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;
    return new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
  }
  function inside(p) {
    return (
      p &&
      p.x >= plot.left &&
      p.x <= plot.right &&
      p.y >= plot.top &&
      p.y <= plot.bottom
    );
  }
  function limited(p) {
    return {
      x: Math.max(plot.left, Math.min(plot.right, p.x)),
      y: Math.max(plot.top, Math.min(plot.bottom, p.y)),
    };
  }
  function dataPoint(p, current) {
    return {
      x:
        current.xMin +
        ((p.x - plot.left) / (plot.right - plot.left)) *
          (current.xMax - current.xMin),
      y:
        current.yMax -
        ((p.y - plot.top) / (plot.bottom - plot.top)) *
          (current.yMax - current.yMin),
    };
  }
  function resetView() {
    if (!bounds) return;
    cancelGesture();
    change({ ...bounds });
  }
  zoomIn.addEventListener("click", () =>
    change(scaleViewport(view, bounds, 0.5)),
  );
  zoomOut.addEventListener("click", () =>
    change(scaleViewport(view, bounds, 2)),
  );
  reset.addEventListener("click", resetView);
  mode.addEventListener("change", () => {
    cancelGesture();
    updateControls();
  });
  svg.addEventListener("pointerdown", (event) => {
    if (!bounds || !event.isPrimary || event.button !== 0 || gesture) return;
    const start = point(event);
    if (!inside(start)) return;
    gesture = {
      id: event.pointerId,
      start,
      end: start,
      view: { ...view },
      mode: mode.value,
      moved: false,
    };
    svg.setPointerCapture(event.pointerId);
  });
  svg.addEventListener("pointermove", (event) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const p = point(event);
    if (!p) return;
    gesture.end = limited(p);
    if (
      !gesture.moved &&
      Math.hypot(p.x - gesture.start.x, p.y - gesture.start.y) < 6
    )
      return;
    gesture.moved = true;
    svg.classList.add("chart-dragging");
    if (gesture.mode === "zoom") {
      if (!gesture.box) {
        gesture.box = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect",
        );
        gesture.box.setAttribute("class", "chart-selection");
        svg.append(gesture.box);
      }
      const a = gesture.start,
        b = gesture.end;
      for (const [key, value] of Object.entries({
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        width: Math.abs(a.x - b.x),
        height: Math.abs(a.y - b.y),
      }))
        gesture.box.setAttribute(key, value);
    } else {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!gesture) return;
        const a = dataPoint(gesture.start, gesture.view),
          b = dataPoint(gesture.end, gesture.view),
          v = gesture.view;
        change({
          xMin: v.xMin + a.x - b.x,
          xMax: v.xMax + a.x - b.x,
          yMin: v.yMin + a.y - b.y,
          yMax: v.yMax + a.y - b.y,
        });
      });
    }
  });
  svg.addEventListener("pointerup", (event) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const finished = gesture;
    cancelGesture();
    if (!finished.moved) return;
    const a = dataPoint(finished.start, finished.view),
      b = dataPoint(finished.end, finished.view);
    if (finished.mode === "zoom") {
      if (
        Math.abs(finished.start.x - finished.end.x) < 8 ||
        Math.abs(finished.start.y - finished.end.y) < 8
      )
        return;
      change({
        xMin: Math.min(a.x, b.x),
        xMax: Math.max(a.x, b.x),
        yMin: Math.min(a.y, b.y),
        yMax: Math.max(a.y, b.y),
      });
    } else {
      const v = finished.view;
      change({
        xMin: v.xMin + a.x - b.x,
        xMax: v.xMax + a.x - b.x,
        yMin: v.yMin + a.y - b.y,
        yMax: v.yMax + a.y - b.y,
      });
    }
    svg.focus({ preventScroll: true });
  });
  svg.addEventListener("pointercancel", cancelGesture);
  svg.addEventListener("lostpointercapture", cancelGesture);
  svg.addEventListener("keydown", (event) => {
    if (!bounds || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "Escape") {
      if (gesture) {
        cancelGesture();
        redraw();
      } else resetView();
    } else if (event.key === "+" || event.key === "=")
      change(scaleViewport(view, bounds, 0.5));
    else if (event.key === "-") change(scaleViewport(view, bounds, 2));
    else if (event.key === "0") resetView();
    else if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    ) {
      const dx =
        (view.xMax - view.xMin) *
        (event.key === "ArrowRight"
          ? 0.2
          : event.key === "ArrowLeft"
            ? -0.2
            : 0);
      const dy =
        (view.yMax - view.yMin) *
        (event.key === "ArrowUp" ? 0.2 : event.key === "ArrowDown" ? -0.2 : 0);
      change({
        xMin: view.xMin + dx,
        xMax: view.xMax + dx,
        yMin: view.yMin + dy,
        yMax: view.yMax + dy,
      });
    } else return;
    event.preventDefault();
    // Keep focus on the chart when a focused point is removed by a redraw.
    svg.focus({ preventScroll: true });
  });
  updateControls();
  let lastWidth;
  new ResizeObserver(([entry]) => {
    const width = entry.contentRect.width;
    if (width > 0 && width !== lastWidth) {
      lastWidth = width;
      if (bounds) redraw();
    }
  }).observe(svg);
  return {
    setBounds(next, key, currentPlot = CHART_PLOT) {
      plot = currentPlot;
      if (key !== context) {
        cancelGesture();
        context = key;
        view = { ...next };
      }
      bounds = next;
      updateControls();
      return { ...view };
    },
    disable() {
      cancelGesture();
      bounds = view = context = undefined;
      updateControls();
    },
  };
}
