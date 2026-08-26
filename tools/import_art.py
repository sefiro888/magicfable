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
# Versión SIN recortar de cada ilustración, para ArtViewer/IllustrationsPage:
# el recorte cuadrado de `square_crop` (necesario para el marco de la carta)
# se come sistemáticamente los bordes de las imágenes generadas en formato
# retrato/paisaje — lo confirmó el usuario viendo una imagen recortada por
# arriba y por abajo. La sección de "solo arte" necesita la imagen completa.
ART_FULL_DIR = os.path.join(ROOT, "public", "assets", "cards", "art-full")
TARGET = 640
QUALITY = 82
FULL_MAX_EDGE = 1280
FULL_QUALITY = 85
SOURCE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".webp")
os.makedirs(ART_FULL_DIR, exist_ok=True)

# Color del SVG de respaldo por facción. Los ids que no aparezcan aquí usan el
# gris neutro: el respaldo solo se ve si el WebP no carga.
FACTION_COLORS = {
    "fury": "#b72d20",
    "arcane": "#2356a8",
    "nature": "#39753a",
    "order": "#d8caa4",
    "shadow": "#261d2d",
    "void": "#59327d",
    "duna": "#c9a86a",
    "samsara": "#e08a2c",
    "jade": "#b8322c",
    "sol": "#2fbfae",
    "anunna": "#b5714a",
    "fimbul": "#5a5f66",
    "olimpo": "#cf9b3f",
    "marea": "#2f8fb5",
    "forja": "#b0763a",
    "enjambre": "#7ba33c",
}

# Facción de cada id conocido que aún no vive en una carta del catálogo.
# Sin esta tabla, el SVG de respaldo se decide adivinando por palabras del id, y
# nombres como «mausoleo-hambriento» o «faro-de-la-fractura» no se parecen a
# ninguna de ellas: acababan todos con el rojo de Furia por defecto.
COMMANDER_FACTIONS = {
    "kaela-corazon-caldera": "fury",
    "oriel-custodio-septima-runa": "arcane",
    "verdania-guardiana-raices": "nature",
    "asterin-protector-luz": "order",
    "malachar-reidor-sombra": "shadow",
    "nyxaris-heraldo-vacio": "void",
    # --- Segunda oleada (NEX-02 «Fractura»): comandantes alternativos ---
    "borran-yunque-vivo": "fury",
    "sialu-lengua-de-hielo": "arcane",
    "marnak-raiz-profunda": "nature",
    "veyra-espada-consagrada": "order",
    "oren-el-tercer-luto": "shadow",
    "zeph-sin-orilla": "void",
    # --- Segunda oleada: las 24 cartas ---
    "coloso-de-escoria": "fury",
    "lanza-de-obsidiana": "fury",
    "pira-de-los-caidos": "fury",
    "heraldo-de-la-ruina": "fury",
    "custodio-del-solsticio": "arcane",
    "silencio-prismatico": "arcane",
    "garza-de-escarcha": "arcane",
    "biblioteca-sumergida": "arcane",
    "ancestro-del-bosque": "nature",
    "manada-en-celo": "nature",
    "corazon-del-manantial": "nature",
    "guardabosques-tenaz": "nature",
    "arcangel-del-veredicto": "order",
    "muro-de-plegarias": "order",
    "sentencia-solar": "order",
    "escudera-del-alba": "order",
    "senora-de-la-mortaja": "shadow",
    "diezmo-de-sangre": "shadow",
    # La ñ del documento se acepta tal cual y también sin ella: según la
    # herramienta que genere el archivo, el nombre puede llegar de las dos
    # formas y no vale la pena que eso decida el color del respaldo.
    "carroñero-del-osario": "shadow",
    "carronero-del-osario": "shadow",
    "mausoleo-hambriento": "shadow",
    "arquitecta-del-vacio": "void",
    "salto-de-umbral": "void",
    "faro-de-la-fractura": "void",
    "devorador-de-ecos": "void",
    # --- Facción Duna (NEX-03 «El Tribunal de Arena») ---
    "khaeris-la-balanza": "duna",
    "fuente-duna": "duna",
    "escriba-del-tribunal": "duna",
    "lancero-de-arena": "duna",
    "chacal-guardian": "duna",
    "portadora-de-ofrendas": "duna",
    "embalsamador": "duna",
    "guardiana-de-la-tumba": "duna",
    "sacerdote-solar": "duna",
    "momia-funcionaria": "duna",
    "arquera-del-nilo": "duna",
    "escorpion-de-basalto": "duna",
    "heraldo-con-cabeza-de-ibis": "duna",
    "coloso-de-la-necropolis": "duna",
    "devoradora-del-inframundo": "duna",
    "visir-de-la-arena": "duna",
    "leon-de-la-sequia": "duna",
    "plegaria-al-sol": "duna",
    "tormenta-de-arena": "duna",
    "balanza-de-maat": "duna",
    "vendaje-ritual": "duna",
    "crecida-del-rio": "duna",
    "maldicion-del-sello": "duna",
    "juicio-de-los-cuarenta-y-dos": "duna",
    "oro-de-la-camara": "duna",
    "eclipse": "duna",
    "obelisco": "duna",
    "mesa-de-ofrendas": "duna",
    "pozo-escalonado": "duna",
    "puerta-sellada": "duna",
    "templo-del-veredicto": "duna",
    "necropolis": "duna",
}


# Facción de cada subcarpeta de art-inbox. Es la vía preferente y la que se
# usa con las facciones nuevas: mantener a mano una tabla de 250 ids no se
# sostiene, y el nombre de la carpeta ya lo dice sin ambigüedad.
FOLDER_FACTIONS = {
    "faccion-samsara": "samsara",
    "faccion-jade": "jade",
    "faccion-quinto-sol": "sol",
    "faccion-annuan": "anunna",
    "faccion-anunna": "anunna",
    "faccion-fimbul": "fimbul",
    "faccion-olimpo": "olimpo",
    "faccion-marea": "marea",
    "faccion-forja": "forja",
    "faccion-enjambre": "enjambre",
    "faccion-duna": "duna",
    "faccion-bestias": "bestiario",
    "faccion-plaga": "plaga",
}


def faction_for(card_id: str, folder: str = "") -> str:
    """Deduce la facción, para elegir el color del respaldo.

    Manda la subcarpeta si la imagen viene dentro de una; si no, se recurre a
    la tabla de ids conocidos y, en último término, a adivinar por palabras.
    """
    if folder in FOLDER_FACTIONS:
        return FOLDER_FACTIONS[folder]
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


def write_svg_fallback(card_id: str, folder: str = "") -> None:
    color = FACTION_COLORS.get(faction_for(card_id, folder), "#3a3a3a")
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


def full_resize(image: Image.Image) -> Image.Image:
    """Reduce si hace falta, pero SIN recortar: conserva el encuadre original."""
    width, height = image.size
    longest = max(width, height)
    if longest <= FULL_MAX_EDGE:
        return image
    scale = FULL_MAX_EDGE / longest
    return image.resize((round(width * scale), round(height * scale)), Image.Resampling.LANCZOS)


def import_one(relative: str) -> int:
    folder, filename = os.path.split(relative)
    card_id, _ = os.path.splitext(filename)
    with Image.open(os.path.join(INBOX, relative)) as source:
        rgb = source.convert("RGB")
        image = square_crop(rgb)
        image = image.resize((TARGET, TARGET), Image.Resampling.LANCZOS)
        webp_path = os.path.join(ART_DIR, f"{card_id}.webp")
        image.save(webp_path, "WebP", quality=QUALITY)

        full_path = os.path.join(ART_FULL_DIR, f"{card_id}.webp")
        full_resize(rgb).save(full_path, "WebP", quality=FULL_QUALITY)
    write_svg_fallback(card_id, folder)
    return os.path.getsize(webp_path)


def main() -> None:
    if not os.path.isdir(INBOX):
        os.makedirs(INBOX, exist_ok=True)
        print(f"Creada la carpeta {INBOX}")
        print("Deja ahí las imágenes con el id de la carta como nombre y vuelve a ejecutar.")
        return

    # Raíz y subcarpetas: el arte llega organizado por facción, y meter 250
    # imágenes sueltas en un mismo directorio no hay quien lo revise.
    sources = sorted(
        name for name in os.listdir(INBOX)
        if name.lower().endswith(SOURCE_EXTENSIONS)
    )
    for folder in sorted(os.listdir(INBOX)):
        ruta = os.path.join(INBOX, folder)
        if not os.path.isdir(ruta) or folder not in FOLDER_FACTIONS:
            continue
        sources += [
            os.path.join(folder, name)
            for name in sorted(os.listdir(ruta))
            if name.lower().endswith(SOURCE_EXTENSIONS)
        ]
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
        print(f"ART_OK {os.path.splitext(os.path.basename(filename))[0]} {size // 1024}KB")

    print(f"ART_DONE files={len(sources)} total_kb={total // 1024}")
    print("Revisa el resultado con:  npm test")


if __name__ == "__main__":
    main()
