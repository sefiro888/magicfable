// Proyectar contra la cámara capturada evita repetir el error de colocar un
// monumento fuera del encuadre. No se reconstruye una cámara aproximada.
import { readFileSync } from 'node:fs'
import { Matrix4, PerspectiveCamera, Vector3 } from 'three'

const file = process.argv[2]
if (!file) throw new Error('Indica el JSON de cámara y, opcionalmente, ternas X Y Z.')
const snapshot = JSON.parse(readFileSync(file, 'utf8'))
if (snapshot.matrixWorld?.length !== 16 || snapshot.projection?.length !== 16) {
  throw new Error('La captura no contiene las matrices de cámara.')
}
const values = process.argv.slice(3).map(Number)
if (values.length % 3 || values.some((value) => !Number.isFinite(value))) {
  throw new Error('Los puntos deben expresarse como ternas numéricas X Y Z.')
}
const points = values.length ? Array.from({ length: values.length / 3 }, (_, index) => values.slice(index * 3, index * 3 + 3))
  : [[0, 0, -8], [0, 2, -8], [0, 4, -8], [-6, 2, -7], [6, 2, -7], [-6, 1, 4], [6, 1, 4]]
const camera = new PerspectiveCamera()
camera.matrixWorld.fromArray(snapshot.matrixWorld)
camera.matrixWorldInverse.copy(camera.matrixWorld).invert()
camera.projectionMatrix.copy(new Matrix4().fromArray(snapshot.projection))
const inside = (rect, x, y) => x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height
console.table(points.map((point) => {
  const ndc = new Vector3(...point).project(camera)
  const x = snapshot.canvas.x + (ndc.x + 1) * snapshot.canvas.width / 2
  const y = snapshot.canvas.y + (1 - ndc.y) * snapshot.canvas.height / 2
  return { punto: point.join(', '), x: Math.round(x), y: Math.round(y),
    en_lienzo: Math.abs(ndc.z) <= 1 && inside(snapshot.canvas, x, y), libre_de_paneles: inside(snapshot.safe, x, y) }
}))
