"""Extract reusable transparent bamboo-leaf sprites from the authored source sheet."""

from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/assets/xianxia/vfx/hero-bamboo-leaves.png"
OUTPUT = ROOT / "public/assets/xianxia/vfx/hero-bamboo"


def trim(image: Image.Image, padding: int = 18) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        raise ValueError("Sprite has no visible pixels")
    left, top, right, bottom = bbox
    return image.crop(
        (
            max(0, left - padding),
            max(0, top - padding),
            min(image.width, right + padding),
            min(image.height, bottom + padding),
        )
    )


def save_webp(image: Image.Image, name: str) -> None:
    image.save(OUTPUT / name, "WEBP", quality=88, method=6, exact=True)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE).convert("RGBA")
    alpha = np.asarray(source.getchannel("A"))
    component_count, labels, stats, _ = cv2.connectedComponentsWithStats(
        (alpha > 20).astype(np.uint8), connectivity=8
    )
    components = sorted(
        range(1, component_count), key=lambda index: int(stats[index, cv2.CC_STAT_AREA]), reverse=True
    )

    sprites: list[Image.Image] = []
    for output_index, component_index in enumerate(components[:12], start=1):
        x, y, width, height, _ = stats[component_index]
        component_alpha = np.where(labels == component_index, alpha, 0).astype(np.uint8)
        rgba = np.asarray(source).copy()
        rgba[:, :, 3] = component_alpha
        crop = Image.fromarray(rgba).crop((x, y, x + width, y + height))
        crop = trim(crop)
        sprites.append(crop)
        save_webp(crop, f"leaf-{output_index:02d}.webp")

    # Purpose-built soft variants keep blur inside the alpha silhouette, never in a rectangular layer.
    distant = trim(sprites[4].filter(ImageFilter.GaussianBlur(1.8)), padding=8)
    distant.putalpha(distant.getchannel("A").point(lambda value: round(value * 0.7)))
    save_webp(distant, "leaf-distant.webp")

    sweep = trim(sprites[2].filter(ImageFilter.GaussianBlur((1.1))), padding=10)
    save_webp(sweep, "leaf-sweep.webp")

    print(f"Wrote 14 transparent bamboo sprites to {OUTPUT}")


if __name__ == "__main__":
    main()
