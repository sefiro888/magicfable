import { expect, it } from 'vitest'
import { Group, Object3D, PerspectiveCamera, Vector3 } from 'three'
import { centerPanoramaAtCamera } from './panoramaPosition'

it('el paisaje permanece centrado en la cámara mundial al girar el grupo del invitado', () => {
  const cameraRig = new Group(), camera = new PerspectiveCamera(), panorama = new Object3D(), board = new Group()
  cameraRig.position.set(2, 0, -1)
  cameraRig.add(camera)
  camera.position.set(3, 6, 8)
  board.position.set(7, 0, 2)
  board.rotation.y = Math.PI
  board.add(panorama)
  centerPanoramaAtCamera(panorama, camera)
  expect(panorama.getWorldPosition(new Vector3()).distanceTo(camera.getWorldPosition(new Vector3()))).toBeLessThan(0.000001)
  camera.position.set(-8, 12, 20)
  centerPanoramaAtCamera(panorama, camera)
  expect(panorama.getWorldPosition(new Vector3()).distanceTo(camera.getWorldPosition(new Vector3()))).toBeLessThan(0.000001)
})
