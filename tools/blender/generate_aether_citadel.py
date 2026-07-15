"""Genera la arquitectura estática de Aether Citadel y la exporta a GLB.

Uso (Windows):
  "C:\\Program Files\\Blender Foundation\\Blender 5.1\\blender.exe" \
      --background --python tools/blender/generate_aether_citadel.py

Salidas:
  assets-source/blender/aether-citadel.blend
  public/assets/scenarios/aether-citadel.glb
  artifacts/blender/aether-citadel-render.png (render de control 1600x900)

Referencia visual: docs/references/aether-citadel-reference.png
Convención de ejes: Blender Z arriba; el exportador glTF convierte a Y arriba.
El "norte" del juego (lado de la IA, three.js -Z) es Blender +Y.
La plaza central debe alojar un tablero de juego de ~7.4 x 7.4 unidades.
"""

from __future__ import annotations

import math
import os
import random
import sys

import bpy

# ---------------------------------------------------------------------------
# Parámetros de iteración (ajustados en las pasadas de composición/materiales)
# ---------------------------------------------------------------------------
PARAMS = {
    "central_size": 11.6,          # lado de la plaza central
    "deck_thickness": 1.1,
    "camera_location": (5.2, -20.8, 13.4),
    "camera_target": (0.0, 2.4, 0.7),
    "camera_focal_mm": 37.0,
    "sun_energy": 4.2,
    "sun_direction": (-0.45, 0.5, -0.62),   # amanecer cálido desde atrás-izquierda
    "render_size": (1600, 900),
}

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
BLEND_PATH = os.path.join(ROOT, "assets-source", "blender", "aether-citadel.blend")
GLB_PATH = os.path.join(ROOT, "public", "assets", "scenarios", "aether-citadel.glb")
RENDER_PATH = os.path.join(ROOT, "artifacts", "blender", "aether-citadel-render.png")

rng = random.Random(0xAE7CD)  # semilla determinista

# ---------------------------------------------------------------------------
# Utilidades de escena
# ---------------------------------------------------------------------------

def reset_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0


def collection(name: str) -> bpy.types.Collection:
    existing = bpy.data.collections.get(name)
    if existing:
        return existing
    made = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(made)
    return made


def link_to(obj: bpy.types.Object, col: bpy.types.Collection) -> None:
    for other in list(obj.users_collection):
        other.objects.unlink(obj)
    col.objects.link(obj)


# ---------------------------------------------------------------------------
# Materiales (PBR constantes: el glTF no exporta nodos procedurales sin bake)
# ---------------------------------------------------------------------------

def material(name: str, base, *, metallic=0.0, roughness=0.85, emission=None,
             emission_strength=0.0) -> bpy.types.Material:
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*base, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if emission is not None:
        bsdf.inputs["Emission Color"].default_value = (*emission, 1.0)
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat


def build_materials() -> dict:
    return {
        "stone": material("AC_StoneMain", (0.282, 0.302, 0.352), roughness=0.88),
        "stone_light": material("AC_StoneLight", (0.362, 0.382, 0.428), roughness=0.83),
        "stone_dark": material("AC_StoneDark", (0.148, 0.16, 0.196), roughness=0.93),
        "gold": material("AC_GoldInlay", (0.71, 0.49, 0.15), metallic=1.0, roughness=0.3,
                          emission=(0.62, 0.4, 0.1), emission_strength=0.4),
        "crystal": material("AC_CrystalBlue", (0.4, 0.68, 1.0), metallic=0.1, roughness=0.12,
                             emission=(0.16, 0.5, 1.0), emission_strength=8.0),
        "portal": material("AC_PortalCore", (0.08, 0.16, 0.46), roughness=0.4,
                            emission=(0.22, 0.5, 1.0), emission_strength=4.0),
        "rock": material("AC_RockUnder", (0.104, 0.106, 0.132), roughness=0.96),
        "ruin": material("AC_RuinFar", (0.202, 0.226, 0.29), roughness=0.9),
    }


# ---------------------------------------------------------------------------
# Primitivas con nombre, material y colección
# ---------------------------------------------------------------------------

def box(name, col, mat, size, location, rotation=(0, 0, 0), bevel=0.05):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    bpy.ops.object.transform_apply(scale=True)
    if bevel > 0:
        mod = obj.modifiers.new("bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 2
        bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.data.materials.append(mat)
    link_to(obj, col)
    return obj


def cylinder(name, col, mat, radius, depth, location, vertices=24, rotation=(0, 0, 0), radius2=None):
    if radius2 is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth,
                                            location=location, rotation=rotation)
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius, radius2=radius2,
                                        depth=depth, location=location, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    link_to(obj, col)
    return obj


def torus(name, col, mat, major, minor, location, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor,
                                     location=location, rotation=rotation,
                                     major_segments=40, minor_segments=8)
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    link_to(obj, col)
    return obj


def crystal(name, col, mat, radius, height, location, tilt=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=radius, radius2=radius * 0.12,
                                    depth=height, location=location, rotation=tilt)
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    link_to(obj, col)
    return obj


def floating_rock(name, col, mat, radius, location):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=radius, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (1.0, 0.9 + rng.random() * 0.3, 0.62)
    bpy.ops.object.transform_apply(scale=True)
    mod = obj.modifiers.new("noise", "DISPLACE")
    tex = bpy.data.textures.new(f"{name}-noise", type="CLOUDS")
    tex.noise_scale = radius * 0.55
    mod.texture = tex
    mod.strength = radius * 0.45
    bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.data.materials.append(mat)
    link_to(obj, col)
    return obj


# ---------------------------------------------------------------------------
# Módulos de la ciudadela
# ---------------------------------------------------------------------------

def platform_module(prefix, col, mats, center, size_xy, top_z=0.0, understructure=True):
    """Plaza de piedra: cubierta, faja lateral, parapeto continuo y soporte."""
    width, depth = size_xy
    thickness = PARAMS["deck_thickness"]
    cx, cy = center
    box(f"{prefix}Deck", col, mats["stone"], (width, depth, thickness),
        (cx, cy, top_z - thickness / 2), bevel=0.08)
    box(f"{prefix}Trim", col, mats["stone_dark"], (width + 0.4, depth + 0.4, thickness * 0.46),
        (cx, cy, top_z - thickness * 0.76), bevel=0.06)
    # Parapeto perimetral continuo, bajo, con esquinas reforzadas.
    rim_height = 0.22
    rim = 0.34
    box(f"{prefix}RimN", col, mats["stone_light"], (width, rim, rim_height),
        (cx, cy + depth / 2 - rim / 2, top_z + rim_height / 2 - 0.03), bevel=0.03)
    box(f"{prefix}RimS", col, mats["stone_light"], (width, rim, rim_height),
        (cx, cy - depth / 2 + rim / 2, top_z + rim_height / 2 - 0.03), bevel=0.03)
    box(f"{prefix}RimE", col, mats["stone_light"], (rim, depth, rim_height),
        (cx + width / 2 - rim / 2, cy, top_z + rim_height / 2 - 0.03), bevel=0.03)
    box(f"{prefix}RimW", col, mats["stone_light"], (rim, depth, rim_height),
        (cx - width / 2 + rim / 2, cy, top_z + rim_height / 2 - 0.03), bevel=0.03)
    for index, (sx, sy) in enumerate([(1, 1), (1, -1), (-1, 1), (-1, -1)]):
        box(f"{prefix}Corner{index}", col, mats["stone_dark"], (0.62, 0.62, 0.42),
            (cx + sx * (width / 2 - 0.31), cy + sy * (depth / 2 - 0.31), top_z + 0.14),
            bevel=0.04)
    if understructure:
        box(f"{prefix}Under1", col, mats["stone_dark"], (width * 0.8, depth * 0.8, thickness * 1.6),
            (cx, cy, top_z - thickness * 1.9), bevel=0.1)
        box(f"{prefix}Under2", col, mats["rock"], (width * 0.52, depth * 0.52, thickness * 2.2),
            (cx, cy, top_z - thickness * 3.6), bevel=0.12)
        cylinder(f"{prefix}Keel", col, mats["rock"], width * 0.2, thickness * 3.4,
                 (cx, cy, top_z - thickness * 6.2), vertices=8, radius2=width * 0.03)


def bridge_module(prefix, col, mats, start, end, width=2.4):
    """Puente macizo que une los BORDES de dos plazas (los puntos dados)."""
    sx, sy = start
    ex, ey = end
    cx, cy = (sx + ex) / 2, (sy + ey) / 2
    length = math.hypot(ex - sx, ey - sy) + 0.6  # solape con ambas plazas
    angle = math.atan2(ey - sy, ex - sx)
    nx, ny = -math.sin(angle), math.cos(angle)
    box(f"{prefix}Deck", col, mats["stone"], (length, width, 0.62),
        (cx, cy, -0.31), rotation=(0, 0, angle), bevel=0.05)
    for lado in (-1, 1):
        box(f"{prefix}Rail{lado}", col, mats["stone_light"], (length * 0.94, 0.2, 0.26),
            (cx + nx * (width / 2 - 0.12) * lado, cy + ny * (width / 2 - 0.12) * lado, 0.1),
            rotation=(0, 0, angle), bevel=0.02)
    # Silueta de arco: vientre central colgante + dos estribos.
    box(f"{prefix}Belly", col, mats["stone_dark"], (length * 0.5, width * 0.8, 0.6),
        (cx, cy, -0.85), rotation=(0, 0, angle), bevel=0.1)
    box(f"{prefix}Keystone", col, mats["stone_dark"], (length * 0.22, width * 0.62, 0.55),
        (cx, cy, -1.35), rotation=(0, 0, angle), bevel=0.12)
    for lado in (-1, 1):
        px = cx + math.cos(angle) * length * 0.36 * lado
        py = cy + math.sin(angle) * length * 0.36 * lado
        box(f"{prefix}Abutment{lado}", col, mats["stone_dark"], (0.9, width * 0.9, 1.2),
            (px, py, -0.95), rotation=(0, 0, angle), bevel=0.08)


def golden_circle(prefix, col, mats, center, radius, top_z=0.02):
    cx, cy = center
    torus(f"{prefix}Outer", col, mats["gold"], radius, 0.055, (cx, cy, top_z))
    torus(f"{prefix}Inner", col, mats["gold"], radius * 0.62, 0.04, (cx, cy, top_z))
    for index in range(8):
        angle = index / 8 * math.tau
        box(f"{prefix}Ray{index}", col, mats["gold"],
            (radius * 0.38, 0.075, 0.035),
            (cx + math.cos(angle) * radius * 0.81, cy + math.sin(angle) * radius * 0.81, top_z),
            rotation=(0, 0, angle))


def column_ring(prefix, col, mats, center, radius, count, height=1.15):
    cx, cy = center
    for index in range(count):
        angle = index / count * math.tau
        px, py = cx + math.cos(angle) * radius, cy + math.sin(angle) * radius
        cylinder(f"{prefix}Col{index}", col, mats["stone_light"], 0.17, height,
                 (px, py, height / 2), vertices=10)
        box(f"{prefix}Cap{index}", col, mats["gold"], (0.3, 0.3, 0.09),
            (px, py, height + 0.05), bevel=0.02)


def portal_module(col, mats, center):
    """Gran marco del portal: doble arco de piedra con incrustación dorada."""
    cx, cy = center
    base = box("PortalBase", col, mats["stone_dark"], (5.6, 2.4, 1.1), (cx, cy, 0.55), bevel=0.1)
    for step in range(3):
        box(f"PortalStep{step}", col, mats["stone"], (4.6 - step * 0.7, 1.7, 0.3),
            (cx, cy - 1.5 - step * 0.62, 0.15 + step * 0.0), bevel=0.04)
    torus("PortalArchOuter", col, mats["stone"], 2.65, 0.5, (cx, cy, 3.6),
          rotation=(math.pi / 2, 0, 0))
    torus("PortalArchGold", col, mats["gold"], 2.2, 0.14, (cx, cy + 0.28, 3.6),
          rotation=(math.pi / 2, 0, 0))
    disc = cylinder("PortalCore", col, mats["portal"], 1.95, 0.16, (cx, cy, 3.6),
                    vertices=40, rotation=(math.pi / 2, 0, 0))
    for lado in (-1, 1):
        cylinder(f"PortalPylon{lado}", col, mats["stone"], 0.55, 4.6,
                 (cx + 3.05 * lado, cy, 2.3), vertices=12)
        crystal(f"PortalPylonGem{lado}", col, mats["crystal"], 0.28, 0.9,
                (cx + 3.05 * lado, cy, 5.05))
    box("PortalLintel", col, mats["stone_dark"], (7.0, 1.2, 0.8), (cx, cy, 6.35), bevel=0.08)
    crystal("PortalCrown", col, mats["crystal"], 0.34, 1.15, (cx, cy, 7.3))
    return disc


def crystal_cluster(prefix, col, mats, center, scale=1.0):
    cx, cy = center
    cylinder(f"{prefix}Pedestal", col, mats["stone_dark"], 1.5 * scale, 0.7,
             (cx, cy, 0.35), vertices=8)
    heights = [3.4, 2.2, 1.6, 1.2]
    for index, height in enumerate(heights):
        angle = index * 2.1 + 0.4
        px = cx + math.cos(angle) * 0.62 * scale * (0 if index == 0 else 1)
        py = cy + math.sin(angle) * 0.62 * scale * (0 if index == 0 else 1)
        crystal(f"{prefix}Gem{index}", col, mats["crystal"], (0.42 - index * 0.06) * scale,
                height * scale, (px, py, 0.7 + height * scale / 2),
                tilt=(rng.uniform(-0.12, 0.12), rng.uniform(-0.12, 0.12), rng.random()))


def tower_module(prefix, col, mats, location, height, radius):
    """Torre gótica de dos cuerpos con balcón, aguja y faro de cristal."""
    x, y = location
    cylinder(f"{prefix}Shaft", col, mats["ruin"], radius, height, (x, y, height / 2),
             vertices=10, radius2=radius * 0.74)
    # Balcón intermedio y cuerpo superior más esbelto.
    cylinder(f"{prefix}Balcony", col, mats["stone_dark"], radius * 1.12, height * 0.07,
             (x, y, height * 0.66), vertices=10)
    cylinder(f"{prefix}Upper", col, mats["ruin"], radius * 0.62, height * 0.5,
             (x, y, height * 0.94), vertices=10, radius2=radius * 0.42)
    cylinder(f"{prefix}Crown", col, mats["stone_dark"], radius * 0.7, height * 0.12,
             (x, y, height * 1.24), vertices=10)
    cylinder(f"{prefix}Spire", col, mats["ruin"], radius * 0.42, height * 0.55,
             (x, y, height * 1.55), vertices=8, radius2=0.02)
    # Contrafuertes en la base.
    for corner in range(4):
        angle = corner / 4 * math.tau + 0.4
        box(f"{prefix}Buttress{corner}", col, mats["stone_dark"],
            (radius * 0.34, radius * 0.34, height * 0.32),
            (x + math.cos(angle) * radius * 0.95, y + math.sin(angle) * radius * 0.95,
             height * 0.16), bevel=0.03)
    crystal(f"{prefix}Beacon", col, mats["crystal"], radius * 0.2, radius * 0.8,
            (x, y, height * 1.88))


def arcade_module(prefix, col, mats, center, size, bays=5):
    """Arquería bajo el borde de una plaza: pilastras y arcos colgantes."""
    cx, cy = center
    half = size / 2
    step = size / bays
    # Solo las fachadas que ve la cámara: sur, oeste y este. Hundidas bajo
    # el borde para que únicamente asome la media luna del arco.
    sides = [
        (0, -half, 0),            # frente (sur)
        (-half, 0, math.pi / 2),  # oeste
        (half, 0, -math.pi / 2),  # este
    ]
    for side_index, (ox, oy, yaw) in enumerate(sides):
        # Dintel corrido bajo el borde y pilastras colgantes: columnata.
        box(f"{prefix}S{side_index}Lintel", col, mats["stone_dark"],
            (size * 0.98, 0.5, 0.34), (cx + ox, cy + oy, -0.86),
            rotation=(0, 0, yaw), bevel=0.05)
        for bay in range(bays):
            along = -half + step * (bay + 0.5)
            px = cx + ox + math.cos(yaw) * along
            py = cy + oy + math.sin(yaw) * along
            box(f"{prefix}S{side_index}Pilaster{bay}", col, mats["stone_dark"],
                (0.4, 0.44, 1.5), (px, py, -1.72), rotation=(0, 0, yaw), bevel=0.04)


# ---------------------------------------------------------------------------
# Construcción de la escena
# ---------------------------------------------------------------------------

def build_citadel() -> None:
    mats = build_materials()

    # Plaza central de batalla (el tablero 8x8 del juego vive encima).
    central = collection("CentralBattlePlatform")
    size = PARAMS["central_size"]
    platform_module("Central", central, mats, (0, 0), (size, size))
    golden_circle("CentralRunic", collection("GoldenInlays"), mats, (0, 0), size * 0.34, 0.015)

    # Plataforma del portal (noroeste, como en la referencia).
    portal_platform = collection("LeftPortalPlatform")
    platform_module("PortalPlaza", portal_platform, mats, (-8.2, 10.4), (7.4, 6.4))
    portal_module(collection("PortalFrame"), mats, (-8.2, 11.9))

    # Plataforma noreste con torre y círculo rúnico.
    rear = collection("RearPlatform")
    platform_module("RearPlaza", rear, mats, (7.8, 9.6), (6.6, 5.6))
    golden_circle("RearRunic", collection("GoldenInlays"), mats, (7.8, 9.6), 2.0, 0.02)
    tower_module("RearTower", collection("DistantTowers"), mats, (10.6, 12.2), 7.4, 0.95)

    # Plataforma este con el gran cristal.
    right = collection("RightCrystalPlatform")
    platform_module("RightPlaza", right, mats, (10.6, -0.6), (6.4, 6.4))
    crystal_cluster("RightCrystal", collection("CrystalPedestals"), mats, (10.8, -0.6), 1.35)
    column_ring("RightCols", collection("Columns"), mats, (10.6, -0.6), 2.7, 6)

    # Plataforma oeste con grupo de cristales.
    left = collection("LeftPortalPlatform")
    platform_module("WestPlaza", left, mats, (-10.2, -1.0), (5.8, 5.8))
    crystal_cluster("WestCrystal", collection("CrystalPedestals"), mats, (-10.2, -1.0), 1.0)

    # Plataforma frontal (sureste pequeña, como la de la esquina inferior).
    front = collection("FrontPlatform")
    platform_module("FrontPlaza", front, mats, (7.0, -9.4), (5.2, 4.4))
    golden_circle("FrontRunic", collection("GoldenInlays"), mats, (7.0, -9.4), 1.55, 0.02)
    tower_module("FrontTower", collection("DistantTowers"), mats, (9.2, -11.2), 4.6, 0.7)

    # Puentes: unen bordes reales de las plazas (con solape).
    main_bridges = collection("MainBridges")
    bridge_module("BridgeNW", main_bridges, mats, (-4.0, 5.8), (-5.5, 7.2), 2.6)
    bridge_module("BridgeNE", main_bridges, mats, (3.8, 5.8), (5.6, 6.8), 2.6)
    bridge_module("BridgeE", main_bridges, mats, (5.8, -0.6), (7.4, -0.6), 2.8)
    secondary = collection("SecondaryBridges")
    bridge_module("BridgeW", secondary, mats, (-5.8, -1.0), (-7.3, -1.0), 2.3)
    bridge_module("BridgeSE", secondary, mats, (4.6, -5.8), (5.9, -7.2), 2.0)

    # Columnas perimetrales y arquería colgante de la plaza central.
    column_ring("CentralCols", collection("Columns"), mats, (0, 0), size * 0.56, 8, height=1.0)
    arcade_module("CentralArcade", collection("DecorativeRuins"), mats, (0, 0), size * 0.98, bays=5)

    # Ruinas decorativas cercanas.
    ruins = collection("DecorativeRuins")
    for index, (rx, ry) in enumerate([(-5.4, -5.6), (5.6, 5.9), (-6.0, 5.4)]):
        box(f"RuinBlock{index}", ruins, mats["stone_dark"],
            (1.1 + rng.random(), 0.8, 0.9 + rng.random() * 0.8),
            (rx, ry, 0.4), rotation=(0, 0, rng.random()), bevel=0.05)
        cylinder(f"RuinStump{index}", ruins, mats["stone_light"], 0.24, 0.7 + rng.random() * 0.7,
                 (rx + 0.9, ry - 0.4, 0.4), vertices=9)

    # Torres lejanas (silueta de la ciudad flotante).
    towers = collection("DistantTowers")
    tower_specs = [
        ((-24, 26), 16, 1.6), ((-14, 30), 12, 1.2), ((6, 32), 18, 1.9),
        ((20, 27), 13, 1.4), ((30, 8), 11, 1.2), ((-30, 6), 10, 1.1),
        ((26, -14), 9, 1.0), ((-26, -16), 8.5, 1.0),
    ]
    for index, ((tx, ty), th, tr) in enumerate(tower_specs):
        tower_module(f"FarTower{index}", towers, mats, (tx, ty), th, tr)

    # Acantilados flotantes.
    cliffs = collection("FloatingCliffs")
    cliff_specs = [
        ((-22, 17, -10), 2.9), ((21, 19, -11), 3.4), ((26, -8, -9), 2.4),
        ((-24, -10, -12), 3.0), ((3, -22, -10), 2.6), ((-6, 26, -13), 3.8),
    ]
    for index, ((fx, fy, fz), fr) in enumerate(cliff_specs):
        floating_rock(f"Cliff{index}", cliffs, mats["rock"], fr, (fx, fy, fz))


def build_camera_and_light() -> None:
    scene = bpy.context.scene
    bpy.ops.object.camera_add(location=PARAMS["camera_location"])
    camera = bpy.context.active_object
    camera.name = "ReferenceCamera"
    camera.data.lens = PARAMS["camera_focal_mm"]
    target = PARAMS["camera_target"]
    direction = (target[0] - camera.location.x,
                 target[1] - camera.location.y,
                 target[2] - camera.location.z)
    import mathutils
    camera.rotation_euler = mathutils.Vector(direction).to_track_quat("-Z", "Y").to_euler()
    scene.camera = camera

    bpy.ops.object.light_add(type="SUN", location=(0, 0, 20))
    sun = bpy.context.active_object
    sun.name = "DawnSun"
    sun.data.energy = PARAMS["sun_energy"]
    sun.data.color = (1.0, 0.82, 0.62)
    sun.rotation_euler = mathutils.Vector(PARAMS["sun_direction"]).to_track_quat("-Z", "Y").to_euler()

    bpy.ops.object.light_add(type="SUN", location=(0, 0, 18))
    fill = bpy.context.active_object
    fill.name = "SkyFill"
    fill.data.energy = 1.1
    fill.data.color = (0.6, 0.72, 1.0)
    fill.rotation_euler = mathutils.Vector((0.4, -0.3, -0.8)).to_track_quat("-Z", "Y").to_euler()

    world = bpy.data.worlds.new("AetherSky")
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    bg.inputs[0].default_value = (0.34, 0.42, 0.62, 1.0)
    bg.inputs[1].default_value = 0.9
    scene.world = world


def export_all() -> None:
    os.makedirs(os.path.dirname(BLEND_PATH), exist_ok=True)
    os.makedirs(os.path.dirname(GLB_PATH), exist_ok=True)
    os.makedirs(os.path.dirname(RENDER_PATH), exist_ok=True)

    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)

    # La cámara y las luces del render de control no viajan al juego.
    bpy.ops.export_scene.gltf(
        filepath=GLB_PATH,
        export_format="GLB",
        use_selection=False,
        export_cameras=False,
        export_lights=False,
        export_apply=True,
    )

    scene = bpy.context.scene
    scene.render.resolution_x, scene.render.resolution_y = PARAMS["render_size"]
    scene.render.filepath = RENDER_PATH
    try:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    except Exception:
        scene.render.engine = "BLENDER_EEVEE"
    bpy.ops.render.render(write_still=True)

    glb_size = os.path.getsize(GLB_PATH)
    blend_size = os.path.getsize(BLEND_PATH)
    print(f"AETHER_OK glb={GLB_PATH} bytes={glb_size} blend_bytes={blend_size}")
    print(f"AETHER_OBJECTS {len(bpy.data.objects)} meshes={len(bpy.data.meshes)} "
          f"materials={len(bpy.data.materials)}")


def main() -> None:
    try:
        reset_scene()
        build_citadel()
        build_camera_and_light()
        export_all()
    except Exception as error:  # noqa: BLE001 - queremos el error completo en consola
        import traceback
        traceback.print_exc()
        print(f"AETHER_ERROR {error}")
        sys.exit(1)


if __name__ == "__main__":
    main()
