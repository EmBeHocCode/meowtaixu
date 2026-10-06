"""Prepare optimized runtime assets for the Cong phap section."""

from pathlib import Path

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


def save_sheet(source: str, target: str) -> None:
    image = Image.open(ASSETS / source).convert("RGBA")
    # Runtime UV stepping needs four exactly equal columns and two equal rows.
    image = image.resize((1024, 512), Image.Resampling.LANCZOS)
    image.save(ASSETS / target, "WEBP", quality=84, method=6)


def save_relics() -> None:
    sheet = Image.open(ASSETS / "technique-relics-sheet.png").convert("RGBA")
    crops = {
        "relic-html-foundation.webp": (0, 0, 470, 535),
        "relic-css-scroll.webp": (410, 0, 1035, 515),
        "relic-javascript-plate.webp": (995, 0, 1536, 535),
        "relic-react-seal.webp": (0, 455, 555, 1024),
        "relic-typescript-jade.webp": (535, 430, 1015, 1024),
        "relic-nextjs-scripture.webp": (965, 455, 1536, 1024),
    }
    for name, box in crops.items():
        relic = sheet.crop(box)
        alpha_box = relic.getchannel("A").getbbox()
        if alpha_box:
            relic = relic.crop(alpha_box)
        relic = contain(relic, (640, 640))
        relic.save(ASSETS / name, "WEBP", quality=86, method=4)


def main() -> None:
    save_webp("chamber-mountains-far.png", "chamber-mountains-far.webp", (1600, 900))
    save_webp("chamber-platform-mid.png", "chamber-platform-mid.webp", (1600, 900))
    save_webp("chamber-foreground.png", "chamber-foreground.webp", (1600, 900))
    save_sheet("formation-mist-8f.png", "formation-mist-8f.webp")
    save_sheet("talisman-flutter-8f.png", "talisman-flutter-8f.webp")
    save_relics()


if __name__ == "__main__":
    main()
