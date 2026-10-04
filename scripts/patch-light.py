# -*- coding: utf-8 -*-
"""Flip the page to a light theme: paper ground, navy ink, same Pantone trio."""
import io

p = "src/landing-page.js"
s = io.open(p, encoding="utf-8").read()


def swap(old, new, label):
    global s
    assert old in s, "missing: " + label
    s = s.replace(old, new, 1)


# ---- tokens -------------------------------------------------------------
swap(
    """    color-scheme: dark;
    /* Pantone 7546C Mystic Navy, 12-1006 Mother of Pearl, 4975C Red Inferno */
    --navy: #13273f;
    --pearl: #e9d4c3;
    --inferno: #4e0000;
    --bg: #000;
    --bg-muted: var(--navy);
    --bg-emphasis: #1e3a57;
    --text: var(--pearl);
    --text-muted: #91857c;
    --border: #24405c;
    --theme: var(--pearl);
    --ember: #a8392f;
    --card: #090909;""",
    """    color-scheme: light;
    /* Pantone 7546C Mystic Navy, 12-1006 Mother of Pearl, 4975C Red Inferno.
       Same trio as the dark build, with the roles swapped: navy becomes the
       ink and the pearl warms the paper instead of lighting the type. */
    --navy: #13273f;
    --pearl: #e9d4c3;
    --inferno: #4e0000;
    --bg: #fbfaf8;
    --bg-muted: #f1ede7;
    --bg-emphasis: #cfc6b8;
    --text: var(--navy);
    --text-muted: #6d6359;
    --border: #ddd5c8;
    --theme: var(--navy);
    --ember: #9c3328;
    --card: #ffffff;""",
    "tokens",
)

# ---- project glow: a lift off the paper, not a halo in the dark ----------
swap(
    """  .proj-card.match {
    border-color: rgba(233, 212, 195, 0.42);
    box-shadow:
      0 0 0 1px rgba(233, 212, 195, 0.10),
      0 0 20px -6px rgba(233, 212, 195, 0.22),
      0 0 54px -12px rgba(233, 212, 195, 0.16),
      0 0 110px -30px rgba(233, 212, 195, 0.12);
  }
  .proj-card.dim { opacity: 0.32; }""",
    """  .proj-card.match {
    border-color: rgba(19, 39, 63, 0.3);
    box-shadow:
      0 0 0 1px rgba(19, 39, 63, 0.06),
      0 6px 18px -6px rgba(19, 39, 63, 0.16),
      0 18px 48px -16px rgba(19, 39, 63, 0.14),
      0 40px 90px -40px rgba(19, 39, 63, 0.12);
  }
  .proj-card.dim { opacity: 0.38; }""",
    "glow",
)

# ---- status pills --------------------------------------------------------
swap(
    """    color: #7ee0a0; background: rgba(126, 224, 160, 0.12);
  }
  .proj-status.wip { color: var(--pearl); background: rgba(233, 212, 195, 0.14); }""",
    """    color: #2f6b47; background: rgba(47, 107, 71, 0.1);
  }
  .proj-status.wip { color: var(--inferno); background: rgba(78, 0, 0, 0.08); }""",
    "status pills",
)

# ---- background dot field ------------------------------------------------
swap(
    "      const BASE = { r: 30, g: 58, b: 87 };",
    "      const BASE = { r: 19, g: 39, b: 63 };",
    "dot base",
)
# navy on paper carries far more than navy on black, so pull the alpha down
swap("      const ALPHA_OPEN = 0.69;", "      const ALPHA_OPEN = 0.2;", "alpha open")
swap("      const ALPHA_TEXT = 0.2;", "      const ALPHA_TEXT = 0.06;", "alpha text")
# ---- portrait ink --------------------------------------------------------
swap(
    """      // Pantone 12-1006 Mother of Pearl: the portrait is drawn in the same
      // ink as the body copy rather than pure white.
      const INK = { r: 233, g: 212, b: 195 };""",
    """      // The portrait is drawn in the body ink. On paper the blocks have to be
      // composited toward the page colour, not toward black, or the darkest
      // cells would be the most visible ones.
      const INK = { r: 19, g: 39, b: 63 };
      const PAPER = { r: 251, g: 250, b: 248 };""",
    "ink",
)
swap(
    """            const shade = Math.min(1, level * (0.85 + boost * 0.45));
            ctx.fillStyle =
              "rgb(" + Math.round(INK.r * shade) + "," +
              Math.round(INK.g * shade) + "," +
              Math.round(INK.b * shade) + ")";""",
    """            const shade = Math.min(1, level * (0.85 + boost * 0.45));
            // Blend from paper to ink: shade 0 disappears into the page.
            const mix = (a, b) => Math.round(a + (b - a) * shade);
            ctx.fillStyle =
              "rgb(" + mix(PAPER.r, INK.r) + "," +
              mix(PAPER.g, INK.g) + "," +
              mix(PAPER.b, INK.b) + ")";""",
    "ink compositing",
)

io.open(p, "w", encoding="utf-8").write(s)
print("light theme applied")
