from pathlib import Path
from PIL import Image, ImageChops, ImageStat

ROOT = Path(__file__).resolve().parents[1] / "public/assets/xianxia/demo-formation"

STATIC_ASSETS = {
    "rings/outer/outer-formation-ring-source.png": "rings/outer/outer-formation-ring.webp",
    "rings/secondary/secondary-moon-ring-source.png": "rings/secondary/secondary-moon-ring.webp",
    "rings/inner/inner-seal-ring-source.png": "rings/inner/inner-seal-ring.webp",
    "rings/tilted/tilted-orbit-ring-source.png": "rings/tilted/tilted-orbit-ring.webp",
    "rings/upper/upper-formation-source.png": "rings/upper/upper-formation.webp",
    "runes/rune-glyph-band-source.png": "runes/rune-glyph-band.webp",
}

SHEET_ASSETS = {
    "core/central-core-8f-source.png": "core/central-core-8f.webp",
    "flames/spirit-flame-8f-source.png": "flames/spirit-flame-8f.webp",
    "activation/activation-discharge-8f-source.png": "activation/activation-discharge-8f.webp",
    "nodes/orbit-seals-8-source.png": "nodes/orbit-seals-8.webp",
    "runes/vertical-rune-chains-8-source.png": "runes/vertical-rune-chains-8.webp",
    "formation-energy-ribbon-8f.png": "energy/ribbons/energy-ribbon-8f.webp",
    "formation-rune-glow-8f.png": "energy/pulses/rune-glow-8f.webp",
    "formation-seal-mist-pulse-8f.png": "mist/seal-mist-pulse-8f.webp",
}


def clean_alpha(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha <= 3:
                pixels[x, y] = (0, 0, 0, 0)
            elif alpha < 16:
                pixels[x, y] = (red, green, blue, min(alpha, 10))
    return image


def normalize_static(source: Path, output: Path) -> None:
    if output.exists() and output.stat().st_mtime >= source.stat().st_mtime:
        return
    image = clean_alpha(Image.open(source))
    image.thumbnail((960, 960), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    canvas.alpha_composite(image, ((1024 - image.width) // 2, (1024 - image.height) // 2))
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output, "WEBP", lossless=True, method=6)


def normalize_sheet(source: Path, output: Path) -> None:
    if output.exists() and output.stat().st_mtime >= source.stat().st_mtime:
        return
    image = clean_alpha(Image.open(source))
    sheet = Image.new("RGBA", (1024, 512), (0, 0, 0, 0))
    for index in range(8):
        column, row = index % 4, index // 4
        left = round(column * image.width / 4)
        right = round((column + 1) * image.width / 4)
        top = round(row * image.height / 2)
        bottom = round((row + 1) * image.height / 2)
        frame = image.crop((left, top, right, bottom))
        bounds = frame.getchannel("A").point(lambda value: 255 if value > 6 else 0).getbbox()
        if bounds:
            frame = frame.crop(bounds)
        scale = min(224 / max(1, frame.width), 224 / max(1, frame.height))
        frame = frame.resize((max(1, round(frame.width * scale)), max(1, round(frame.height * scale))), Image.Resampling.LANCZOS)
        x = column * 256 + (256 - frame.width) // 2
        y = row * 256 + (256 - frame.height) // 2
        sheet.alpha_composite(frame, (x, y))
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, "WEBP", lossless=True, method=6)


def frame_difference_report(path: Path) -> list[float]:
    atlas = Image.open(path).convert("RGBA")
    frames = []
    for index in range(8):
        x, y = index % 4 * 256, index // 4 * 256
        frames.append(atlas.crop((x, y, x + 256, y + 256)))
    return [round(sum(ImageStat.Stat(ImageChops.difference(frames[i], frames[i + 1])).mean), 2) for i in range(7)]


for source, output in STATIC_ASSETS.items():
    normalize_static(ROOT / source, ROOT / output)

for source, output in SHEET_ASSETS.items():
    target = ROOT / output
    normalize_sheet(ROOT / source, target)
    print(f"{output}: adjacent-frame differences {frame_difference_report(target)}")
