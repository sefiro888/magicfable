#!/usr/bin/env python3
"""Importa arte descargado (Gemini, DALL-E, etc.) al formato que espera el juego.

Uso:
    1. Guarda las imágenes en tools/art-inbox/ con el id de la carta como nombre.
       Ejemplo: tools/art-inbox/verdania-guardiana-raices.png
       Sirve cualquier formato que abra Pillow: png, jpg, jpeg, webp.
    2. Ejecuta:  python tools/import_art.py
    3. El script recorta al centro, escala a 640x640, guarda el WebP definitivo
       y crea el SVG de respaldo que exigen los tests.

Requiere Pillow:  pip install pillow
"""

from __future__ import annotations

import os
import sys

try:
    from PIL import Image
except ImportError:
    print("Falta Pillow. Instálalo con:  pip install pillow")
    sys.exit(1)

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
INBOX = os.path.join(ROOT, "tools", "art-inbox")
ART_DIR = os.path.join(ROOT, "public", "assets", "cards", "art")
TARGET = 640
QUALITY = 82
SOURCE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".webp")

# Color del SVG de respaldo por facción. Los ids que no aparezcan aquí usan el
# gris neutro: el respaldo solo se ve si el WebP no carga.
FACTION_COLORS = {
    "fury": "#b72d20",
    "arcane": "#2356a8",
    "nature": "#39753a",
    "order": "#d8caa4",
    "shadow": "#261d2d",
    "void": "#59327d",
}

# Facción de cada id conocido que aún no vive en una carta del catálogo.
COMMANDER_FACTIONS = {
    "kaela-corazon-caldera": "fury",
    "oriel-custodio-septima-runa": "arcane",
    "verdania-guardiana-raices": "nature",
    "asterin-protector-luz": "order",
    "malachar-reidor-sombra": "shadow",
    "nyxaris-heraldo-vacio": "void",
}


def faction_for(card_id: str) -> str:
    """Deduce la facción a partir del id, para elegir el color del respaldo."""
    if card_id in COMMANDER_FACTIONS:
        return COMMANDER_FACTIONS[card_id]
    for faction, keywords in (
        ("nature", ("naturaleza", "bosque", "ciervo", "lobo", "oso", "elfo", "centauro", "arboleda", "crecimiento")),
        ("order", ("orden", "celestial", "angel", "paladin", "clerigo", "grifo", "pegaso", "aguila", "divino")),
        ("shadow", ("sombra", "espectro", "esqueleto", "nigromante", "vampiro", "pesadilla", "murcielago", "maldicion")),
        ("void", ("vacio", "caos", "abisal", "abismal", "entropico", "paradoja", "aniquilacion", "quimera", "basilisco")),
        ("arcane", ("arcan", "escarcha", "glacial", "cristal", "prisma", "azur", "runic", "cronomante", "astral")),
        ("fury", ("furia", "brasa", "magma", "caldera", "ceniza", "volcanic", "ignivoro", "carmesi", "fenix")),
    ):
        if any(keyword in card_id for keyword in keywords):
            return faction
    return "fury"


def square_crop(image: Image.Image) -> Image.Image:
    """Recorta al cuadrado más grande centrado, sin deformar la imagen."""
    width, height = image.size
    if width == height:
        return image
    side = min(width, height)
    left = (width - side) // 2
    top = (height - side) // 2
    return image.crop((left, top, left + side, top + side))


def write_svg_fallback(card_id: str) -> None:
    color = FACTION_COLORS.get(faction_for(card_id), "#3a3a3a")
    svg = (
        '<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">\n'
        f'  <rect width="400" height="500" fill="{color}"/>\n'
        f'  <circle cx="200" cy="200" r="80" fill="{color}" opacity="0.5"/>\n'
        '  <text x="200" y="450" font-size="20" font-weight="bold" '
        f'text-anchor="middle" fill="white">{card_id}</text>\n'
        "</svg>\n"
    )
    with open(os.path.join(ART_DIR, f"{card_id}.svg"), "w", encoding="utf-8") as handle:
        handle.write(svg)


def import_one(filename: str) -> int:
    card_id, _ = os.path.splitext(filename)
    with Image.open(os.path.join(INBOX, filename)) as source:
        image = square_crop(source.convert("RGB"))
        image = image.resize((TARGET, TARGET), Image.Resampling.LANCZOS)
        webp_path = os.path.join(ART_DIR, f"{card_id}.webp")
        image.save(webp_path, "WebP", quality=QUALITY)
    write_svg_fallback(card_id)
    return os.path.getsize(webp_path)


def main() -> None:
    if not os.path.isdir(INBOX):
        os.makedirs(INBOX, exist_ok=True)
        print(f"Creada la carpeta {INBOX}")
        print("Deja ahí las imágenes con el id de la carta como nombre y vuelve a ejecutar.")
        return

    sources = sorted(
        name for name in os.listdir(INBOX)
        if name.lower().endswith(SOURCE_EXTENSIONS)
    )
    if not sources:
        print(f"No hay imágenes en {INBOX}")
        print("Formatos admitidos: " + ", ".join(SOURCE_EXTENSIONS))
        return

    total = 0
    for filename in sources:
        try:
            size = import_one(filename)
        except Exception as error:  # noqa: BLE001
            print(f"ART_ERROR {filename}: {error}")
            sys.exit(1)
        total += size
        print(f"ART_OK {os.path.splitext(filename)[0]} {size // 1024}KB")

    print(f"ART_DONE files={len(sources)} total_kb={total // 1024}")
    print("Revisa el resultado con:  npm test")


if __name__ == "__main__":
    main()
