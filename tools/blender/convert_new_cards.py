"""Convierte SVG de nuevas cartas a WebP.

Uso:
  blender --background --python tools/blender/convert_new_cards.py
"""

from __future__ import annotations

import os
import sys

import bpy

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
SVG_DIR = os.path.join(ROOT, "public", "assets", "cards", "art")
OUT_DIR = os.path.join(ROOT, "public", "assets", "cards", "art")
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

    # Cargar SVG
    image = bpy.data.images.load(svg_path, check_existing=False)
    try:
        # Escalar a 640x640
        image.scale(TARGET, TARGET)

        # Guardar como WebP
        scene = bpy.context.scene
        scene.render.image_settings.file_format = "WEBP"
        scene.render.image_settings.quality = 82
        scene.render.image_settings.color_mode = "RGB"
        scene.view_settings.view_transform = "Standard"
        out_path = os.path.join(OUT_DIR, f"{card_id}.webp")
        image.save_render(out_path, scene=scene)
        return os.path.getsize(out_path)
    finally:
        bpy.data.images.remove(image)


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
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
