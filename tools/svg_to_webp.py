"""Convierte SVG a WebP usando cairosvg y PIL."""

from __future__ import annotations

import os
import sys
from io import BytesIO

try:
    import cairosvg
    from PIL import Image
except ImportError as e:
    print(f"Error: Instala cairosvg y Pillow primero")
    print("pip install cairosvg pillow")
    sys.exit(1)

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SVG_DIR = os.path.join(ROOT, "public", "assets", "cards", "art")
TARGET = 640

NEW_CARDS = [
    "erupcion-volcanica",
    "gigante-magma",
    "draco-magma",
    "infiltrado-volcanico",
    "elemental-tormenta",
    "congelacion-rapida",
    "dragon-escarcha",
    "guardian-escarchado",
    "destello-runico",
    "mago-celestial",
]


def convert_svg_to_webp(card_id: str) -> int:
    svg_path = os.path.join(SVG_DIR, f"{card_id}.svg")
    if not os.path.isfile(svg_path):
        raise FileNotFoundError(svg_path)

    # Convertir SVG a PNG en memoria
    png_bytes = BytesIO()
    cairosvg.svg2png(url=svg_path, write_to=png_bytes)
    png_bytes.seek(0)

    # Abrir y escalar imagen
    image = Image.open(png_bytes).convert("RGB")
    image = image.resize((TARGET, TARGET), Image.Resampling.LANCZOS)

    # Guardar como WebP
    webp_path = os.path.join(SVG_DIR, f"{card_id}.webp")
    image.save(webp_path, "WebP", quality=82)

    return os.path.getsize(webp_path)


def main() -> None:
    total = 0
    for card_id in NEW_CARDS:
        try:
            size = convert_svg_to_webp(card_id)
        except Exception as error:  # noqa: BLE001
            import traceback

            traceback.print_exc()
            print(f"ART_ERROR {card_id}: {error}")
            sys.exit(1)
        total += size
        print(f"ART_OK {card_id} {size // 1024}KB")
    print(f"ART_DONE files={len(NEW_CARDS)} total_kb={total // 1024}")


if __name__ == "__main__":
    main()
