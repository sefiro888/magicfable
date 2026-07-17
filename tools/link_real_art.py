#!/usr/bin/env python3
"""Vincula las ilustraciones reales a las nuevas cartas."""

import os
import shutil
from PIL import Image

SOURCE_DIR = r"C:\Users\sefir\Desktop\ilustraciones juego"
ART_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "assets", "cards", "art")
TARGET = 640

MAPPING = {
    "fuente-naturaleza": "arboleda-sagrada",
    "ciervo-sagrado": "ciervo-sagrado",
    "lobo-salvaje": "lobo-salvaje",
    "oso-forestal": "oso-forestal",
    "arboleda-sagrada": "arboleda-sagrada",
    "crecimiento-salvaje": "crecimiento-salvaje",
    "centauro-cazador": "centauro-cazador",
    "elfo-ancestral": "elfo-ancestral",
    "fuente-orden": "monumento-sagrado",
    "angel-celestial": "angel-celestial",
    "aguila-celestial": "aguila-celestial",
    "pegaso-celestial": "pegaso-celestial",
    "paladin-glorioso": "paladin-glorioso",
    "clerigo-luz": "clerigo-luz",
    "grifo-orden": "grifo-orden",
    "juicio-divino": "juicio-divino",
    "fuente-sombra": "cripta-mortal",
    "murcielago-sombra": "murcielago-sombra",
    "espectro-siniestro": "espectro-siniestro",
    "esqueleto-guerrero": "esqueleto-guerrero",
    "nigromante-oscuro": "nigromante-oscuro",
    "maldicion-sombra": "maldicion-sombra",
    "vampiro-siniestro": "vampiro-siniestro",
    "pesadilla-mortal": "pesadilla-mortal",
    "fuente-vacio": "paradoja-vacio",
    "basilisco-caos": "basilisco-caos",
    "quimera-caos": "quimera-caos",
    "devorador-entropico": "devorador-entropico",
    "leviatan-abismal": "leviatan-abisal",
    "aniquilacion-vacio": "aniquilacion-vacio",
    "paradoja-vacio": "paradoja-vacio",
    "horror-abisal": "horror-abisal",
}

def convert_to_webp(source_path, card_id):
    """Convierte PNG a WebP."""
    image = Image.open(source_path).convert("RGB")
    image.thumbnail((TARGET, TARGET), Image.Resampling.LANCZOS)

    # Crear imagen con fondo si es necesario
    final = Image.new("RGB", (TARGET, TARGET), (255, 255, 255))
    offset = ((TARGET - image.width) // 2, (TARGET - image.height) // 2)
    final.paste(image, offset)

    out_path = os.path.join(ART_DIR, f"{card_id}.webp")
    final.save(out_path, "WebP", quality=82)
    return os.path.getsize(out_path)

total = 0
for card_id, source_name in MAPPING.items():
    # Buscar el archivo PNG en la carpeta
    source_path = None
    for f in os.listdir(SOURCE_DIR):
        if source_name.lower() in f.lower() and f.endswith(".png"):
            source_path = os.path.join(SOURCE_DIR, f)
            break

    if source_path and os.path.isfile(source_path):
        try:
            size = convert_to_webp(source_path, card_id)
            total += size
            print(f"ART_OK {card_id} {size // 1024}KB")
        except Exception as e:
            print(f"ART_ERROR {card_id}: {e}")
    else:
        print(f"ART_NOTFOUND {card_id} (buscado: {source_name})")

print(f"ART_DONE total_kb={total // 1024}")
