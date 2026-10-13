import type { CnFunction } from "cn"
import { createCn } from "cn/config"

/**
 * clsx + tailwind-merge, taught WunderUI's own theme utilities so they merge
 * in the right group: `text-label-sm` is a font size (not a text colour, which
 * dropped it next to `text-text-tertiary`), `bg-gradient-*` a background image
 * (not a colour that `bg-card` would remove), and the motion utilities
 * `ease-entrance …` and `duration-fast …` replace each other.
 */
export const cn: CnFunction = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: ["label-sm"] }],
      "bg-image": [
        {
          bg: [
            "gradient-primary",
            "gradient-indigo",
            "gradient-blue",
            "gradient-purple",
            "gradient-pink",
            "gradient-red",
            "gradient-orange",
            "gradient-yellow",
            "gradient-green",
            "gradient-alternative",
            "gradient-slate",
            "gradient-dark",
          ],
        },
      ],
      ease: [{ ease: ["entrance", "exit", "move", "overshoot", "spring"] }],
      duration: [{ duration: ["instant", "fast", "base", "slow", "deliberate", "ambient"] }],
    },
  },
})
