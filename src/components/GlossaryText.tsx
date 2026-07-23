import { useId, useMemo } from 'react';

import styles from './GlossaryText.module.css';

export interface GlossaryEntry {
  readonly id: string;
  readonly terms: readonly string[];
  readonly label: string;
  readonly definition: string;
}

export const CARD_GLOSSARY: readonly GlossaryEntry[] = [
  {
    id: 'esencia',
    terms: ['Esencia Carmesí', 'Esencia Celeste', 'Esencia'],
    label: 'Esencia',
    definition: 'La energía de las runas quebradas. Cada fuente produce 1 de Esencia de su variante por turno; los costes de color solo se pagan con su variante.',
  },
  {
    id: 'agotar',
    terms: ['Agota', 'Agotar', 'Agotada', 'Agotado', 'Agotadas', 'Agotados'],
    label: 'Agotar',
    definition: 'Gira o marca una fuente como usada. No volverá a generar Esencia hasta que se restaure.',
  },
  {
    id: 'impulso',
    terms: ['Impulso'],
    label: 'Impulso',
    definition: 'Esta unidad puede moverse durante el mismo turno en que entra en juego.',
  },
  {
    id: 'congelar',
    terms: ['Congela', 'Congelada', 'Congelado', 'Congeladas', 'Congelados'],
    label: 'Congelar',
    definition: 'Una carta congelada no puede moverse ni atacar mientras dure el efecto.',
  },
  {
    id: 'abrasar',
    terms: ['Abrasa', 'Abrasada', 'Abrasado', 'Abrasadas', 'Abrasados'],
    label: 'Abrasada',
    definition: 'La casilla conserva un efecto de fuego temporal que puede dañar o alterar lo que la ocupa.',
  },
  {
    id: 'adyacencia',
    terms: ['Adyacente', 'Adyacentes'],
    label: 'Adyacente',
    definition: 'Una casilla situada inmediatamente arriba, abajo, a la izquierda o a la derecha.',
  },
  {
    id: 'alcance',
    terms: ['Alcance'],
    label: 'Alcance',
    definition: 'Distancia máxima, medida en casillas, desde la que una unidad puede atacar.',
  },
  {
    id: 'guardia',
    terms: ['Guardia'],
    label: 'Guardia',
    definition: 'Protege la zona cercana y obliga al rival a atender esta unidad antes de avanzar.',
  },
  {
    id: 'volador',
    terms: ['Volador', 'Voladora'],
    label: 'Volador',
    definition: 'Puede ignorar ciertas restricciones de ocupación o terreno indicadas por las reglas del efecto.',
  },
  {
    id: 'escudo',
    terms: ['Escudo', 'Escudos'],
    label: 'Escudo',
    definition: 'Protección temporal que absorbe daño antes de afectar a la vida o resistencia.',
  },
  {
    id: 'unica',
    terms: ['Única', 'Único'],
    label: 'Única',
    definition: 'Solo puede incluirse una copia de esta carta en un mazo.',
  },
  {
    id: 'robar',
    terms: ['Roba', 'Robar', 'Robes'],
    label: 'Robar',
    definition: 'Mueve la primera carta del mazo a la mano de su propietario.',
  },
  {
    id: 'descartar',
    terms: ['Descarta', 'Descartar', 'Descartes'],
    label: 'Descartar',
    definition: 'Mueve una carta de la mano al descarte sin jugarla.',
  },
  {
    id: 'nexo',
    terms: ['Nexo'],
    label: 'Nexo',
    definition: 'Fuente vital protegida por el comandante. Si su vida llega a cero, su propietario pierde la partida.',
  },
];

export interface GlossaryTextProps {
  readonly text: string;
  readonly entries?: readonly GlossaryEntry[];
  readonly interactive?: boolean;
  readonly className?: string;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalize = (value: string) => value.toLocaleLowerCase('es-ES');

function buildGlossary(entries: readonly GlossaryEntry[]) {
  const termMap = new Map<string, GlossaryEntry>();
  const terms: string[] = [];
  for (const entry of entries) {
    for (const term of entry.terms) {
      termMap.set(normalize(term), entry);
      terms.push(term);
    }
  }
  terms.sort((left, right) => right.length - left.length);
  const alternatives = terms.map(escapeRegExp).join('|');
  const pattern = alternatives.length > 0
    ? new RegExp(`(?<![\\p{L}\\p{N}])(${alternatives})(?![\\p{L}\\p{N}])`, 'giu')
    : null;
  return { termMap, pattern };
}

export function GlossaryText({
  text,
  entries = CARD_GLOSSARY,
  interactive = true,
  className,
}: GlossaryTextProps) {
  const idPrefix = useId().replace(/:/g, '');
  const glossary = useMemo(() => buildGlossary(entries), [entries]);
  const chunks = glossary.pattern ? text.split(glossary.pattern) : [text];

  if (!interactive) return <span className={className}>{text}</span>;

  return (
    <span className={[styles.glossaryText, className].filter(Boolean).join(' ')}>
      {chunks.map((chunk, index) => {
        const entry = glossary.termMap.get(normalize(chunk));
        if (!entry) return <span key={`${index}-${chunk}`}>{chunk}</span>;
        const tooltipId = `${idPrefix}-${entry.id}-${index}`;
        return (
          <span
            className={styles.term}
            role="term"
            tabIndex={0}
            aria-label={`${chunk}: ${entry.definition}`}
            aria-describedby={tooltipId}
            title={`${entry.label}: ${entry.definition}`}
            key={`${index}-${chunk}`}
          >
            {chunk}
            <span className={styles.tooltip} id={tooltipId} role="tooltip">
              <strong>{entry.label}</strong>
              <span>{entry.definition}</span>
            </span>
          </span>
        );
      })}
    </span>
  );
}
