"""Prepare optimized runtime assets for the Cong phap section."""

from pathlib import Path

import cv2
import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets" / "xianxia" / "techniques"


def contain(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    copy = image.copy()
    copy.thumbnail(size, Image.Resampling.LANCZOS)
    return copy


def save_webp(source: str, target: str, size: tuple[int, int]) -> None:
    image = Image.open(ASSETS / source)
    image = contain(image, size)
    image.save(ASSETS / target, "WEBP", quality=82, method=6)


def save_interpolated_sheet(source: str, master: str, target: str) -> None:
    source_sheet = Image.open(ASSETS / source).convert("RGBA").resize((1024, 512), Image.Resampling.LANCZOS)
    source_frames = [
        source_sheet.crop((column * 256, row * 256, (column + 1) * 256, (row + 1) * 256))
        for row in range(2) for column in range(4)
    ]
    frames: list[Image.Image] = []
    for index, frame in enumerate(source_frames):
        next_frame = source_frames[(index + 1) % len(source_frames)]
        frames.extend((frame, Image.blend(frame, next_frame, 0.5)))
    sheet = Image.new("RGBA", (1024, 1024))
    for index, frame in enumerate(frames):
        sheet.paste(frame, ((index % 4) * 256, (index // 4) * 256))
    sheet.save(ASSETS / master, "PNG", optimize=True)
    sheet.save(ASSETS / target, "WEBP", quality=84, method=6)


def save_relics() -> None:
    sheet = Image.open(ASSETS / "technique-relics-sheet.png").convert("RGBA")
    pixels = np.array(sheet)
    count, labels, stats, centres = cv2.connectedComponentsWithStats((pixels[:, :, 3] > 20).astype("uint8"), 8)
    components = sorted(range(1, count), key=lambda index: stats[index, cv2.CC_STAT_AREA], reverse=True)[:6]
    components.sort(key=lambda index: (centres[index][1] >= sheet.height / 2, centres[index][0]))
    names = [
        "relic-html-foundation.webp", "relic-css-scroll.webp", "relic-javascript-plate.webp",
        "relic-react-seal.webp", "relic-typescript-jade.webp", "relic-nextjs-scripture.webp",
    ]
    for name, component in zip(names, components, strict=True):
        x, y, width, height = stats[component, :4]
        isolated = pixels[y:y + height, x:x + width].copy()
        isolated[:, :, 3] = np.where(labels[y:y + height, x:x + width] == component, isolated[:, :, 3], 0)
        relic = Image.fromarray(isolated, "RGBA")
        relic = contain(relic, (640, 640))
        relic.save(ASSETS / name, "WEBP", quality=86, method=4)


def main() -> None:
    save_webp("chamber-mountains-far.png", "chamber-mountains-far.webp", (1600, 900))
    save_webp("chamber-platform-mid.png", "chamber-platform-mid.webp", (1600, 900))
    save_webp("chamber-foreground.png", "chamber-foreground.webp", (1600, 900))
    save_interpolated_sheet("formation-mist-8f.png", "formation-mist-16f.png", "formation-mist-16f.webp")
    save_interpolated_sheet("talisman-flutter-8f.png", "talisman-flutter-16f.png", "talisman-flutter-16f.webp")
    save_relics()


if __name__ == "__main__":
    main()
