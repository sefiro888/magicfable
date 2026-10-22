import type { Camera, Object3D } from 'three'

/** Preparado sin conectar. La cámara está fuera del grupo que gira para el
 * invitado: copiar su posición mundial como local desplazaba todo el paisaje. */
export function centerPanoramaAtCamera(panorama: Object3D, camera: Camera) {
  camera.getWorldPosition(panorama.position)
  panorama.parent?.worldToLocal(panorama.position)
}
