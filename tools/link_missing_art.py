#!/usr/bin/env python3
"""Vincula las 10 ilustraciones faltantes."""

import os
import re
from PIL import Image

SOURCE_DIR = r"C:\Users\sefir\Desktop\ilustraciones juego"
ART_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "assets", "cards", "art")
TARGET = 640

MAPPING = {
    "congelacion-rapida": ["congelacion-rapida"],
    "destello-runico": ["destello-runico"],
    "draco-magma": ["draco-magma", "draco_magma"],
    "dragon-escarcha": ["dragon-escarcha"],
    "elemental-tormenta": ["elemental-tormenta", "elemental_tormenta"],
    "erupcion-volcanica": ["erupcion-volcanica"],
    "gigante-magma": ["gigante-magma"],
    "guardian-escarchado": ["guardian-escarchado"],
    "infiltrado-volcanico": ["infiltrado-volcanico", "infiltrado_volcanico"],
    "mago-celestial": ["mago-celestial"],
}

def convert_to_webp(source_path, card_id):
    """Convierte PNG a WebP."""
    image = Image.open(source_path).convert("RGB")
    image.thumbnail((TARGET, TARGET), Image.Resampling.LANCZOS)

    final = Image.new("RGB", (TARGET, TARGET), (255, 255, 255))
    offset = ((TARGET - image.width) // 2, (TARGET - image.height) // 2)
    final.paste(image, offset)

    out_path = os.path.join(ART_DIR, f"{card_id}.webp")
    final.save(out_path, "WebP", quality=82)
    return os.path.getsize(out_path)

def find_file(card_id, variants):
    """Busca archivo por variantes de nombre."""
    for f in os.listdir(SOURCE_DIR):
        if not f.endswith(".png"):
            continue
        # Buscar coincidencia con cualquier variante
        for variant in variants:
            if variant.lower() in f.lower():
                return os.path.join(SOURCE_DIR, f)
    return None

total = 0
for card_id, variants in MAPPING.items():
    source_path = find_file(card_id, variants)

    if source_path and os.path.isfile(source_path):
        try:
            size = convert_to_webp(source_path, card_id)
            total += size
            print(f"ART_OK {card_id} {size // 1024}KB")
        except Exception as e:
            print(f"ART_ERROR {card_id}: {e}")
    else:
        print(f"ART_NOTFOUND {card_id} (variantes: {', '.join(variants)})")

print(f"ART_DONE total_kb={total // 1024}")
