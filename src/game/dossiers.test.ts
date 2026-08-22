import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CARD_BY_ID } from './cards';
import { COMMANDER_BY_ID } from './decks';

/**
 * Los dosieres de facción (`docs/FACCION_*.md`) terminan con una lista de
 * nombres de archivo exactos: es lo que el usuario usa para bautizar las 32
 * imágenes que genera y lo que después lee `tools/import_art.py`.
 *
 * Un id con tilde, con ñ o con un guion de más no se descubre al escribirlo,
 * sino tres horas después, cuando ya hay 32 ilustraciones hechas y la
 * importación las deja fuera. Estas pruebas lo pillan al momento.
 *
 * Ya pasó de verdad: `vorágine` y `cronista-de-latón` hubo que renombrarlos, y
 * `carroñero-del-osario` acabó aceptándose en las dos formas dentro del
 * importador porque el dosier lo escribía con ñ.
 */

const DOCS = join(process.cwd(), 'docs');

/** El patrón que exige el esquema de cartas: minúsculas ASCII y guiones. */
const ID_VALIDO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface Dossier {
  readonly archivo: string;
  readonly ids: readonly string[];
  readonly fichas: readonly string[];
}

/**
 * Lee un dosier y saca dos listas: los ids del checklist final y los de las
 * fichas de carta (los encabezados `#### \`id\``).
 */
const leerDossier = (archivo: string): Dossier => {
  // Los saltos se normalizan: en Windows estos ficheros acaban en CRLF en
  // cuanto git los toca, y los patrones de abajo esperan solo el salto.
  const texto = readFileSync(join(DOCS, archivo), 'utf8').split('\r\n').join('\n');
  // El checklist es el bloque de código que sigue al epígrafe de entrega.
  const entrega = texto.indexOf('Nombres de archivo exactos');
  const bloque = entrega >= 0 ? /```\n([\s\S]*?)```/.exec(texto.slice(entrega)) : null;
  const ids = bloque ? bloque[1]!.split(/\s+/).filter(Boolean) : [];
  const fichas = [...texto.matchAll(/^#### `([^`]+)`/gm)].map((match) => match[1]!);
  return { archivo, ids, fichas };
};

const DOSIERES = readdirSync(DOCS)
  .filter((archivo) => archivo.startsWith('FACCION_') && archivo.endsWith('.md'))
  .map(leerDossier);

describe('dosieres de facción', () => {
  it('hay dosieres que revisar', () => {
    expect(DOSIERES.length).toBeGreaterThan(0);
  });

  for (const dossier of DOSIERES) {
    describe(dossier.archivo, () => {
      it('el checklist trae un nombre de archivo por carta más el comandante', () => {
        // Cada ficha `#### \`id\`` es una carta; el comandante va aparte.
        expect(dossier.ids.length).toBe(dossier.fichas.length + 1);
      });

      it('todos los nombres son válidos como id: ASCII, minúsculas y guiones', () => {
        const malos = dossier.ids.filter((id) => !ID_VALIDO.test(id));
        expect(malos, `ids que import_art.py no sabría leer en ${dossier.archivo}`).toEqual([]);
      });

      it('cada ficha del documento aparece en el checklist', () => {
        const enChecklist = new Set(dossier.ids);
        const olvidadas = dossier.fichas.filter((id) => !enChecklist.has(id));
        expect(olvidadas, 'fichas descritas que nadie va a ilustrar').toEqual([]);
      });

      it('no repite ningún nombre de archivo', () => {
        expect(new Set(dossier.ids).size).toBe(dossier.ids.length);
      });
    });
  }

  it('ningún dosier pisa una carta o un comandante que ya existen', () => {
    // Salvo los que YA están implementados: sus ids tienen que coincidir,
    // justamente, con lo que el dosier prometía.
    const implementadas = new Set([...Object.keys(CARD_BY_ID), ...Object.keys(COMMANDER_BY_ID)]);
    const facciónImplementada = (dossier: Dossier) =>
      dossier.ids.some((id) => implementadas.has(id));

    for (const dossier of DOSIERES.filter((candidato) => !facciónImplementada(candidato))) {
      const choques = dossier.ids.filter((id) => implementadas.has(id));
      expect(choques, `${dossier.archivo} reutiliza ids del catálogo`).toEqual([]);
    }
  });

  it('dos dosieres no reclaman el mismo nombre de archivo', () => {
    // `tools/art-inbox/` es una sola carpeta: si dos facciones piden
    // `zigurat.png`, la segunda machaca a la primera sin avisar de nada.
    const dueño = new Map<string, string>();
    const choques: string[] = [];
    for (const dossier of DOSIERES) {
      for (const id of dossier.ids) {
        const previo = dueño.get(id);
        if (previo) choques.push(`${id}: ${previo} y ${dossier.archivo}`);
        else dueño.set(id, dossier.archivo);
      }
    }
    expect(choques).toEqual([]);
  });

  it('los dosieres ya implementados coinciden por completo con el catálogo', () => {
    const implementadas = new Set([...Object.keys(CARD_BY_ID), ...Object.keys(COMMANDER_BY_ID)]);
    for (const dossier of DOSIERES) {
      const dentro = dossier.ids.filter((id) => implementadas.has(id));
      // O no está implementada en absoluto, o lo está entera: media facción
      // implementada significa que alguien se dejó cartas por el camino.
      if (dentro.length === 0) continue;
      expect(dentro.length, `${dossier.archivo} está implementado a medias`).toBe(dossier.ids.length);
    }
  });
});
