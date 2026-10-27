"""
Compress the app's images to WebP at about 2x their on-screen size.

    python scripts/compress-images.py

Converts any PNG/JPG still sitting in public/assets or public/memories (fresh Codex output or
new real photos) and moves the originals to output/originals/, which git ignores.
Requires Pillow: python -m pip install pillow
"""
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
BACKUP = ROOT / "output" / "originals"

LINE = 90  # engraving line art keeps its fine hatching at this level
PHOTO = 82

# Exact output sizes for art the app scales down a lot (2x of the displayed size).
SIZES = {
    "assets/train/loco-body": (1040, 600),
    "assets/train/tender": (460, 600),
    "assets/train/carriage": (860, 600),
    "assets/train/loco-wheel-big": (256, 256),
    "assets/train/loco-wheel-small": (256, 256),
    "assets/train/carriage-wheel": (256, 256),
}
# Memory photos fill a ~240px stamp; keep the long side at most this.
PHOTO_LONG_SIDE = 1000
# Converting this near-flat texture to WebP visibly loses its grain, and the JPG is tiny.
KEEP = {"assets/ui/paper-texture"}


def target_size(key: str, im: Image.Image) -> tuple[int, int]:
    if key in SIZES:
        return SIZES[key]
    if key.startswith("memories/"):
        scale = min(1.0, PHOTO_LONG_SIDE / max(im.size))
        return round(im.width * scale), round(im.height * scale)
    return im.size


def main() -> None:
    files = [p for d in ("assets", "memories") for p in (PUBLIC / d).rglob("*") if p.suffix.lower() in (".png", ".jpg", ".jpeg")]
    before = after = 0
    for src in sorted(files):
        rel = src.relative_to(PUBLIC)
        key = rel.with_suffix("").as_posix()
        if key in KEEP:
            continue
        im = Image.open(src)
        has_alpha = im.mode in ("RGBA", "LA") or "transparency" in im.info
        im = im.convert("RGBA" if has_alpha else "RGB")
        size = target_size(key, im)
        if size != im.size:
            im = im.resize(size, Image.LANCZOS)
        dst = src.with_suffix(".webp")
        opts = {"quality": PHOTO if key.startswith("memories/") else LINE, "method": 6}
        if has_alpha:
            opts["alpha_quality"] = 100
        im.save(dst, "WEBP", **opts)
        b, a = src.stat().st_size, dst.stat().st_size
        before += b
        after += a
        backup = BACKUP / rel
        backup.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(src), str(backup))
        print(f"{rel.as_posix():42} {b // 1024:6} KB -> {a // 1024:5} KB  {size[0]}x{size[1]}")
    if before:
        print(f"\nTOTAL {before / 1048576:.2f} MB -> {after / 1048576:.2f} MB ({100 - after * 100 / before:.0f}% smaller)")
    else:
        print("Nothing to compress: everything is already WebP.")


if __name__ == "__main__":
    main()
