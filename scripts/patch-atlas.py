# -*- coding: utf-8 -*-
"""Swap the scrubbed video for a frame atlas driven by a measured table."""
import io
import re

# ---------------------------------------------------------------- server
p = "src/http-server.js"
s = io.open(p, encoding="utf-8").read()
old = 'req.url.startsWith("/portrait.")'
assert old in s
s = s.replace(old, 'req.url.startsWith("/portrait")', 1)
io.open(p, "w", encoding="utf-8").write(s)

# ---------------------------------------------------------------- page
p = "src/landing-page.js"
s = io.open(p, encoding="utf-8").read()


def swap(old, new, label):
    global s
    assert old in s, "missing: " + label
    s = s.replace(old, new, 1)


swap(
    'import { UI, SKILL_LABELS, SKILL_COPY, en } from "./i18n.js";',
    'import { UI, SKILL_LABELS, SKILL_COPY, en } from "./i18n.js";\n'
    'import { GAZE_BY_DEGREE, GAZE_NEUTRAL } from "./gaze-table.js";',
    "import",
)

swap(
    '        <video id="portrait-video" src="/portrait.mp4" muted playsinline preload="auto" style="display:none"></video>\n',
    "",
    "video element",
)

# --- replace the whole video + gaze machinery -------------------------------
start = s.index("      const video = document.getElementById(\"portrait-video\");")
end = s.index("      function draw() {")
head = s[:start]
tail = s[end:]

block = '''      // Frames come from a sprite atlas rather than a scrubbed video.
      // Seeking a video element is asynchronous: requests queue, get dropped,
      // and the frame on screen is never guaranteed to be the one just asked
      // for. An atlas makes frame selection a synchronous array lookup.
      const ATLAS_COLS = 16;
      const ATLAS_TILE_W = 128;
      const ATLAS_TILE_H = 96;
      const atlas = new Image();
      let atlasReady = false;
      atlas.onload = () => {
        atlasReady = true;
        setupGrid();
        requestAnimationFrame(draw);
      };
      atlas.src = "/portrait-atlas.webp";

      window.addEventListener("resize", setupGrid);
      // The hero column settles after fonts load, so recompute the grid
      // whenever the container itself changes size.
      if (window.ResizeObserver) {
        new ResizeObserver(setupGrid).observe(canvas.parentElement);
      }

      const host = canvas.parentElement;
      const ptr = { x: -9999, y: -9999, seen: false, away: false };

      window.addEventListener("pointermove", (e) => {
        ptr.x = e.clientX;
        ptr.y = e.clientY;
        ptr.seen = true;
        ptr.away = false;

        // Canvas-space copy drives the per-cell highlight, which should still
        // only react when the cursor is actually over the portrait.
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const inside =
          e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom;
        if (inside) {
          mouse.x = (e.clientX - rect.left) * dpr;
          mouse.y = (e.clientY - rect.top) * dpr;
        } else {
          mouse.x = -9999;
          mouse.y = -9999;
        }
      }, { passive: true });

      // When the cursor leaves the page the gaze holds its last heading: the
      // position is kept, only the vacuum is released. Clearing the heading
      // here would snap the head back to centre, which reads as a flick.
      function pointerAway() {
        ptr.away = true;
        mouse.x = -9999;
        mouse.y = -9999;
      }
      document.addEventListener("pointerleave", pointerAway);
      window.addEventListener("blur", pointerAway);
      // A fast exit can outrun pointermove, leaving the pull latched on.
      host.addEventListener("pointerleave", () => {
        mouse.x = -9999;
        mouse.y = -9999;
      });

      // Built offline by scripts/build-gaze-table.py, which measures where
      // each frame actually looks. Nothing here assumes the clip sweeps a
      // clean circle, because it does not.
      const GAZE = ${JSON.stringify(GAZE_BY_DEGREE)};
      const NEUTRAL = ${GAZE_NEUTRAL};
      const REST_RADIUS = 0.08; // share of the viewport treated as centre
      const EASE = 0.18;

      let gazeDeg = 0;   // eased heading, in degrees
      let frame = NEUTRAL;

      function trackGaze() {
        if (ptr.away) return; // cursor off the page: hold the last heading

        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = ptr.x - cx;
        const dy = ptr.y - cy;
        const rest = Math.min(window.innerWidth, window.innerHeight) * REST_RADIUS;

        if (!ptr.seen || Math.hypot(dx, dy) <= rest) {
          frame = NEUTRAL;
          return;
        }

        const want = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
        // Ease the HEADING, not the frame index. Frame numbers are unordered
        // with respect to direction, so interpolating them would walk through
        // unrelated poses; angles interpolate meaningfully.
        let delta = want - gazeDeg;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        gazeDeg = (gazeDeg + delta * EASE + 360) % 360;

        frame = GAZE[Math.round(gazeDeg) % 360];
      }

'''

s = head + block + tail

# --- the sampling step now reads a tile out of the atlas ---------------------
swap(
    """      function draw() {
        requestAnimationFrame(draw);
        if (video.readyState < 2 || !canvas.width) return;
        trackGaze();

        const vw = video.videoWidth;
        const vh = video.videoHeight;""",
    """      function draw() {
        requestAnimationFrame(draw);
        if (!atlasReady || !canvas.width) return;
        trackGaze();

        const vw = ATLAS_TILE_W;
        const vh = ATLAS_TILE_H;
        const tileX = (frame % ATLAS_COLS) * ATLAS_TILE_W;
        const tileY = Math.floor(frame / ATLAS_COLS) * ATLAS_TILE_H;""",
    "draw head",
)

swap(
    """        sctx.fillStyle = "#fff";
        sctx.fillRect(0, 0, cols, rows);
        sctx.drawImage(video, dx, dy, dw, dh);""",
    """        sctx.fillStyle = "#fff";
        sctx.fillRect(0, 0, cols, rows);
        sctx.drawImage(atlas, tileX, tileY, vw, vh, dx, dy, dw, dh);""",
    "draw sample",
)

io.open(p, "w", encoding="utf-8").write(s)
print("atlas wired")
