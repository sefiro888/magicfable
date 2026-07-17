"""Crea WebP placeholders para las nuevas cartas usando PIL."""

from __future__ import annotations

import os
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SVG_DIR = os.path.join(ROOT, "public", "assets", "cards", "art")
TARGET = 640

NEW_CARDS = {
    "erupcion-volcanica": "#ff6b35",
    "gigante-magma": "#e74c3c",
    "draco-magma": "#d32f2f",
    "infiltrado-volcanico": "#d32f2f",
    "elemental-tormenta": "#ff9800",
    "congelacion-rapida": "#4fc3f7",
    "dragon-escarcha": "#0097a7",
    "guardian-escarchado": "#0288d1",
    "destello-runico": "#2196f3",
    "mago-celestial": "#fdd835",
}


def create_webp_placeholder(card_id: str, color: str) -> int:
    # Crear imagen con el color principal
    image = Image.new("RGB", (TARGET, TARGET), color)
    draw = ImageDraw.Draw(image)

    # Agregar borde
    draw.rectangle([(0, 0), (TARGET - 1, TARGET - 1)], outline="#000000", width=3)

    # Agregar nombre de la carta
    try:
        draw.text(
            (TARGET // 2, TARGET - 50),
            card_id,
            fill="#ffffff",
            anchor="mm",
        )
    except Exception:
        pass  # Si falla el texto, ignorar

    # Guardar como WebP
    webp_path = os.path.join(SVG_DIR, f"{card_id}.webp")
    image.save(webp_path, "WebP", quality=82)

    return os.path.getsize(webp_path)


def main() -> None:
    os.makedirs(SVG_DIR, exist_ok=True)
    total = 0
    for card_id, color in NEW_CARDS.items():
        try:
            size = create_webp_placeholder(card_id, color)
            total += size
            print(f"ART_OK {card_id} {size // 1024}KB")
        except Exception as error:
            import traceback

            traceback.print_exc()
            print(f"ART_ERROR {card_id}: {error}")

    print(f"ART_DONE files={len(NEW_CARDS)} total_kb={total // 1024}")


if __name__ == "__main__":
    main()
