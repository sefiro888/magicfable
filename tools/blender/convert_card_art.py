"""Convierte las ilustraciones finales de cartas a WebP optimizado.

Uso:
  "C:\\Program Files\\Blender Foundation\\Blender 5.1\\blender.exe" \
      --background --python tools/blender/convert_card_art.py

Lee el arte limpio de la carpeta del escritorio «ilustraciones juego»,
recorta las piezas que traen texto o borde incrustado, reescala a 640x640
y guarda WebP (calidad 82) como public/assets/cards/art/<card-id>.webp.
"""

from __future__ import annotations

import os
import sys

import bpy
import numpy as np

SOURCE_DIR = r"C:\Users\sefir\Desktop\ilustraciones juego"
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
OUT_DIR = os.path.join(ROOT, "public", "assets", "cards", "art")
TARGET = 640

# card-id -> (archivo de origen, recorte opcional (izq, arriba, der, abajo) en
# fracciones). Los recortes extraen la ventana de arte de las fuentes que
# llegaron como carta completa (con marco, título o texto incrustado).
MAPPING: dict[str, tuple[str, tuple[float, float, float, float] | None]] = {
    # Furia
    "fuente-furia": ("fuente_furia_1783750552034.png", None),
    "sabueso-brasa": ("sabueso_brasa_1783723703509.png", None),
    "berserker-ignivoro": ("berserker_ignivoro_1783723716497.png", None),
    "dragon-caldera": ("dragon_caldera_1783723728681.png", (0.065, 0.15, 0.065, 0.27)),
    "lluvia-ceniza": ("lluvia_ceniza_1783723750423.png", None),
    "forja-carmesi": ("forja_carmesi_1783723739268.png", None),
    "lancera-magma": ("guerrero_igneo_1783750392852.png", (0.23, 0.165, 0.23, 0.25)),
    "fenix-pavesa": ("fenix_renacido_1783747905727.png", (0.06, 0.05, 0.06, 0.25)),
    "ariete-volcanico": ("golem_fundicion_1783747939219.png", (0.095, 0.095, 0.095, 0.185)),
    "pacto-ascuas": ("impetu_fuego_1783724101026.png", (0.035, 0.035, 0.035, 0.1)),
    "altar-combustion": ("elemental_lava_1783724076248.png", (0.045, 0.045, 0.045, 0.16)),
    "temblor-rojo": ("muro_pomez_1783724088588.png", None),
    # Arcano
    "fuente-arcana": ("fuente_arcana_1783750559766.png", None),
    "centinela-cristal": ("centinela_cristal_1783723774643.png", (0.07, 0.155, 0.07, 0.25)),
    "tejedora-escarcha": ("tejedora_escarcha_1783723787176.png", (0.06, 0.12, 0.06, 0.24)),
    "prision-glacial": ("prision_glacial_1783723796777.png", (0.22, 0.135, 0.2, 0.245)),
    "cometa-arcano": ("cometa_arcano_1783723807608.png", (0.075, 0.075, 0.075, 0.075)),
    "torre-horizonte": ("torre_horizonte_1783723818950.png", (0.19, 0.12, 0.17, 0.14)),
    "duelista-prisma": ("mago_runa_helada_1783750610131.png", None),
    "golem-azur": ("golem_glaciar_1783747949654.png", (0.04, 0.1, 0.04, 0.11)),
    "niebla-espejada": ("barrera_hielo_1783750576575.png", None),
    "eco-cronomante": ("tejedora_tiempo_1783750602279.png", None),
    "archivo-viviente": ("buho_runico_1783747960351.png", (0.05, 0.05, 0.05, 0.05)),
    "convergencia-astral": ("vortice_mana_1783750593880.png", None),
    # Comandantes
    "kaela-corazon-caldera": ("comandante_furia_1783723762618.png", (0.04, 0.11, 0.04, 0.145)),
    "oriel-custodio-septima-runa": ("comandante_arcano_1783723830060.png", (0.05, 0.05, 0.05, 0.05)),
}


def convert(card_id: str, source_name: str, crop) -> int:
    source_path = os.path.join(SOURCE_DIR, source_name)
    if not os.path.isfile(source_path):
        raise FileNotFoundError(source_path)
    image = bpy.data.images.load(source_path, check_existing=False)
    try:
        width, height = image.size
        if crop is not None:
            left, top, right, bottom = crop
            x0 = int(width * left)
            x1 = int(width * (1 - right))
            y_top = int(height * top)
            y_bottom = int(height * bottom)
            pixels = np.array(image.pixels[:], dtype=np.float32).reshape(height, width, 4)
            # El origen de pixels en Blender es la esquina inferior izquierda.
            cropped = pixels[y_bottom:height - y_top, x0:x1, :]
            new_height, new_width = cropped.shape[0], cropped.shape[1]
            cropped_image = bpy.data.images.new(f"crop-{card_id}", width=new_width, height=new_height, alpha=False)
            cropped_image.pixels = cropped.ravel().tolist()
            bpy.data.images.remove(image)
            image = cropped_image
        image.scale(TARGET, TARGET)

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
    for card_id, (source_name, crop) in MAPPING.items():
        try:
            size = convert(card_id, source_name, crop)
        except Exception as error:  # noqa: BLE001
            import traceback
            traceback.print_exc()
            print(f"ART_ERROR {card_id}: {error}")
            sys.exit(1)
        total += size
        print(f"ART_OK {card_id} {size // 1024}KB")
    print(f"ART_DONE files={len(MAPPING)} total_kb={total // 1024}")


if __name__ == "__main__":
    main()
