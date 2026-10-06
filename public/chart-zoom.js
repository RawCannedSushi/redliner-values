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

export function scaleViewportAt(
  view,
  bounds,
  factor,
  anchor = { x: 0.5, y: 0.5 },
  spanSource = view,
) {
  const xPoint = view.xMin + anchor.x * (view.xMax - view.xMin);
  const yPoint = view.yMax - anchor.y * (view.yMax - view.yMin);
  const xSpan = (spanSource.xMax - spanSource.xMin) * factor;
  const ySpan = (spanSource.yMax - spanSource.yMin) * factor;
  return clampViewport(
    {
      xMin: xPoint - anchor.x * xSpan,
      xMax: xPoint + (1 - anchor.x) * xSpan,
      yMin: yPoint - (1 - anchor.y) * ySpan,
      yMax: yPoint + anchor.y * ySpan,
    },
    bounds,
  );
}

export function scaleViewport(view, bounds, factor) {
  return scaleViewportAt(view, bounds, factor);
}

export function createChartZoom(svg, controls, redraw) {
  const find = (id) => controls.querySelector(`#${id}`);
  const slider = find("chart-zoom-slider");
  const reset = find("chart-zoom-reset"),
    mode = find("chart-drag-mode");
  const status = find("chart-zoom-status");
  let bounds, view, context, gesture, frame, zoomFrame, zoomTarget, lastAnchor;
  let plot = CHART_PLOT;

  function zoomLevel(current) {
    return Math.min(
      (bounds.xMax - bounds.xMin) / (current.xMax - current.xMin),
      (bounds.yMax - bounds.yMin) / (current.yMax - current.yMin),
    );
  }
  function sliderPosition(zoom) {
    return Math.round((Math.log(zoom) / Math.log(1000)) * 1000);
  }
  function sliderZoom(position) {
    return Math.exp((Math.log(1000) * position) / 1000);
  }

  function updateControls() {
    const current = zoomTarget || view;
    const xZoom = bounds
      ? (bounds.xMax - bounds.xMin) / (current.xMax - current.xMin)
      : 1;
    const yZoom = bounds
      ? (bounds.yMax - bounds.yMin) / (current.yMax - current.yMin)
      : 1;
    slider.disabled = !bounds;
    slider.value = bounds ? sliderPosition(Math.min(xZoom, yZoom)) : 0;
    reset.disabled = !bounds || (xZoom < 1.001 && yZoom < 1.001);
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
  function stopZoom() {
    if (zoomFrame) cancelAnimationFrame(zoomFrame);
    zoomFrame = zoomTarget = undefined;
  }
  function animateZoom(next) {
    zoomTarget = clampViewport(next, bounds);
    updateControls();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const target = zoomTarget;
      stopZoom();
      change(target);
      return;
    }
    if (zoomFrame) return;
    let previous = performance.now();
    const step = (now) => {
      zoomFrame = undefined;
      if (!bounds || !zoomTarget) return;
      const elapsed = Math.min(100, Math.max(0, now - previous));
      previous = now;
      const weight = 1 - Math.exp(-elapsed / 65);
      const nextView = {};
      let settled = true;
      for (const axis of ["x", "y"]) {
        for (const end of ["Min", "Max"]) {
          const key = axis + end;
          nextView[key] = view[key] + (zoomTarget[key] - view[key]) * weight;
          if (
            Math.abs(nextView[key] - zoomTarget[key]) >
            (bounds[axis + "Max"] - bounds[axis + "Min"]) / 100000
          )
            settled = false;
        }
      }
      if (settled) {
        const target = zoomTarget;
        zoomTarget = undefined;
        change(target);
      } else {
        change(nextView);
        zoomFrame = requestAnimationFrame(step);
      }
    };
    zoomFrame = requestAnimationFrame(step);
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
  function anchorFor(p) {
    return {
      x: (p.x - plot.left) / (plot.right - plot.left),
      y: (p.y - plot.top) / (plot.bottom - plot.top),
    };
  }
  function zoomAround(factor, anchor = lastAnchor || { x: 0.5, y: 0.5 }) {
    if (!bounds) return;
    animateZoom(
      scaleViewportAt(view, bounds, factor, anchor, zoomTarget || view),
    );
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
    stopZoom();
    change({ ...bounds });
  }
  slider.addEventListener("input", () => {
    if (!bounds) return;
    const current = zoomTarget || view;
    zoomAround(zoomLevel(current) / sliderZoom(Number(slider.value)));
  });
  reset.addEventListener("click", resetView);
  mode.addEventListener("change", () => {
    cancelGesture();
    updateControls();
  });
  svg.addEventListener("pointermove", (event) => {
    const p = point(event);
    if (inside(p)) lastAnchor = anchorFor(p);
  });
  svg.addEventListener(
    "wheel",
    (event) => {
      if (!bounds || !event.ctrlKey) return;
      const p = point(event);
      if (!inside(p)) return;
      event.preventDefault();
      lastAnchor = anchorFor(p);
      const pixels =
        event.deltaY *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? window.innerHeight
            : 1);
      zoomAround(Math.exp(Math.max(-600, Math.min(600, pixels)) * 0.0015));
    },
    { passive: false },
  );
  svg.addEventListener("pointerdown", (event) => {
    if (!bounds || !event.isPrimary || event.button !== 0 || gesture) return;
    const start = point(event);
    if (!inside(start)) return;
    stopZoom();
    updateControls();
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
    } else if (event.key === "+" || event.key === "=") zoomAround(0.5);
    else if (event.key === "-") zoomAround(2);
    else if (event.key === "0") resetView();
    else if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    ) {
      stopZoom();
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
        stopZoom();
        lastAnchor = undefined;
        context = key;
        view = { ...next };
      }
      bounds = next;
      updateControls();
      return { ...view };
    },
    disable() {
      cancelGesture();
      stopZoom();
      lastAnchor = undefined;
      bounds = view = context = undefined;
      updateControls();
    },
  };
}
