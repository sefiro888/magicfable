"""Hoja de contactos de las fuentes de arte mapeadas (para revisar marcos).

Uso:
  blender --background --python tools/blender/contact_sheet.py
Genera artifacts/blender/art-contact-sheet.png con la rejilla 6x5 en el
orden del MAPPING de convert_card_art.py.
"""

from __future__ import annotations

import importlib.util
import os

import bpy
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "artifacts", "blender", "art-contact-sheet.png")

spec = importlib.util.spec_from_file_location("convert_card_art", os.path.join(HERE, "convert_card_art.py"))
module = importlib.util.module_from_spec(spec)
# Solo necesitamos MAPPING y SOURCE_DIR; evitamos ejecutar main().
module.__name__ = "convert_card_art_data"
spec.loader.exec_module(module)

CELL = 256
COLS = 6
rows = (len(module.MAPPING) + COLS - 1) // COLS
sheet = np.zeros((rows * CELL, COLS * CELL, 4), dtype=np.float32)
sheet[:, :, 3] = 1.0

for index, (card_id, (source_name, _crop)) in enumerate(module.MAPPING.items()):
    path = os.path.join(module.SOURCE_DIR, source_name)
    image = bpy.data.images.load(path)
    image.scale(CELL, CELL)
    width, height = image.size
    pixels = np.array(image.pixels[:], dtype=np.float32).reshape(height, width, 4)
    row = index // COLS
    col = index % COLS
    # El origen de Blender es abajo-izquierda; la hoja se rellena de arriba a abajo.
    y0 = (rows - 1 - row) * CELL
    sheet[y0:y0 + CELL, col * CELL:(col + 1) * CELL, :] = pixels
    bpy.data.images.remove(image)
    print(f"SHEET {index:02d} {card_id} <- {source_name}")

os.makedirs(os.path.dirname(OUT), exist_ok=True)
out_image = bpy.data.images.new("contact-sheet", width=COLS * CELL, height=rows * CELL, alpha=False)
out_image.pixels = sheet.ravel().tolist()
scene = bpy.context.scene
scene.render.image_settings.file_format = "PNG"
scene.view_settings.view_transform = "Standard"
out_image.save_render(OUT, scene=scene)
print(f"SHEET_OK {OUT}")
