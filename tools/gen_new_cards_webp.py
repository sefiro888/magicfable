#!/usr/bin/env python3
"""Genera WebP para todas las cartas nuevas."""

import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SVG_DIR = os.path.join(ROOT, "public", "assets", "cards", "art")
TARGET = 640

NEW_CARDS = {
    "fuente-naturaleza": "#39753a", "ciervo-sagrado": "#6ba85a",
    "lobo-salvaje": "#5a8a4a", "oso-forestal": "#4a7a3a",
    "arboleda-sagrada": "#7aba6a", "crecimiento-salvaje": "#8aca7a",
    "centauro-cazador": "#6ab85a", "elfo-ancestral": "#7aac5a",
    "fuente-orden": "#d8caa4", "angel-celestial": "#e8dab4",
    "aguila-celestial": "#f0e0b8", "pegaso-celestial": "#e8d0ac",
    "paladin-glorioso": "#f2cf68", "clerigo-luz": "#e0d8b0",
    "grifo-orden": "#dccaa8", "juicio-divino": "#f4d080",
    "fuente-sombra": "#261d2d", "murcielago-sombra": "#3a2d45",
    "espectro-siniestro": "#4a3d55", "esqueleto-guerrero": "#2a1d35",
    "nigromante-oscuro": "#5a4d65", "maldicion-sombra": "#6a5d75",
    "vampiro-siniestro": "#5a3d55", "pesadilla-mortal": "#7a6d85",
    "fuente-vacio": "#59327d", "basilisco-caos": "#6a4a8d",
    "quimera-caos": "#7a5a9d", "devorador-entropico": "#6a5a9d",
    "leviatan-abismal": "#7a4a9d", "aniquilacion-vacio": "#8a6aad",
    "paradoja-vacio": "#9a7abd", "horror-abisal": "#5a3a8d",
}

os.makedirs(SVG_DIR, exist_ok=True)
total = 0
for card_id, color in NEW_CARDS.items():
    image = Image.new("RGB", (TARGET, TARGET), color)
    draw = ImageDraw.Draw(image)
    draw.rectangle([(0, 0), (TARGET - 1, TARGET - 1)], outline="#000000", width=3)
    webp_path = os.path.join(SVG_DIR, f"{card_id}.webp")
    image.save(webp_path, "WebP", quality=82)
    size = os.path.getsize(webp_path)
    total += size
    print(f"ART_OK {card_id} {size // 1024}KB")

print(f"ART_DONE files={len(NEW_CARDS)} total_kb={total // 1024}")
