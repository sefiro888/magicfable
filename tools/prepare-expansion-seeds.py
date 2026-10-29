"""Prepara datos de carta sin publicar reglas todavía pendientes."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = json.loads((root / 'tools/art-inbox/datos-facciones-borrador.json').read_text(encoding='utf-8'))
words = {'polvora': 'pólvora', 'jabali': 'jabalí', 'mecanico': 'mecánico', 'griton': 'gritón',
         'maquina': 'máquina', 'rapido': 'rápido', 'montana': 'montaña', 'tobogan': 'tobogán',
         'bisono': 'bisoño', 'escuadra': 'escuadra', 'alferez': 'alférez', 'capitan': 'capitán',
         'infanteria': 'infantería', 'espanol': 'español', 'espana': 'España', 'motin': 'motín',
         'pagaduria': 'pagaduría', 'artilleria': 'artillería', 'cuartel': 'cuartel',
         'ilmarinen': 'Ilmarinen', 'lemminkainen': 'Lemminkäinen', 'arcoiris': 'arcoíris',
         'tuonela': 'Tuonela', 'pohjola': 'Pohjola', 'otso': 'Otso', 'louhi': 'Louhi',
         'senora': 'señora', 'kullervo': 'Kullervo', 'antero': 'Antero', 'vipunen': 'Vipunen',
         'aguila': 'águila', 'cienaga': 'ciénaga', 'rio': 'río', 'sampo': 'Sampo',
         'flandes': 'Flandes', 'santiago': 'Santiago', 'escalda': 'Escalda', 'rocroi': 'Rocroi'}
rarities = {'Común': 'common', 'Infrecuente': 'uncommon', 'Rara': 'rare', 'Mítica': 'mythic'}
keyword_names = {'Impulso': 'impulse', 'Golpe veloz': 'swift-strike', 'Guardia': 'guard', 'Volador': 'flying', 'Perforar': 'pierce'}
seeds = []
for faction, entries in source.items():
    for entry in entries:
        fields = entry['fields']
        card_type = fields['Tipo'].split(' — ')[0]
        kind = {'Esencia': 'mana', 'Unidad': 'unit', 'Hechizo inmediato': 'instant', 'Estructura': 'structure'}[card_type]
        rules = re.sub(r'\*\*', '', fields.get('Reglas', 'Sin habilidades adicionales.'))
        rules = {'Volador.': 'Volador: puede atravesar fichas al moverse.', 'Guardia.': 'Guardia: protege a las fichas aliadas frente a enemigos adyacentes.', 'Impulso.': 'Impulso: puede moverse el turno en que entra en juego.'}.get(rules, rules)
        rules = {'Petardazo.': 'Petardazo: al ser destruida, inflige 2 de daño a todas las unidades adyacentes, incluidas las aliadas.', 'Formación.': 'Formación: gana +1 de Ataque y +2 de Vida mientras tenga dos unidades aliadas adyacentes.', 'Descarga.': 'Descarga: inflige 2 de daño adicional cuando hay una unidad aliada entre ella y su objetivo.'}.get(rules, rules)
        name = fields.get('Nombre') or ' '.join(words.get(w, w) for w in entry['id'].split('-'))
        name = name[0].upper() + name[1:]
        cost = [int(x) for x in re.findall(r'\d+', fields['Coste'])]
        seed = dict(id=entry['id'], name=name, faction=faction, type=kind,
                    subtype=fields['Tipo'].split(' — ')[-1], rarity=rarities[fields['Rareza']],
                    cost=dict(generic=cost[0], colored={} if len(cost) == 1 else {faction: cost[1]}),
                    rules=rules, flavor=fields['Sabor'].strip('«»'),
                    keywords=[keyword for text, keyword in keyword_names.items() if re.search(r'(?:^|\. )' + text + r'(?:\.|$)', rules)],
                    unique=fields['Rareza'] == 'Mítica')
        if kind == 'unit':
            seed['attack'], seed['health'] = map(int, fields['ATQ/VID'].split('/'))
            seed['range'], seed['movement'] = int(fields['Alcance']), int(fields['Movimiento'])
        if kind == 'structure':
            seed['resistance'] = int(fields['Resistencia'])
        seeds.append(seed)
assert len(seeds) == 93 and len({seed['id'] for seed in seeds}) == 93
(root / 'src/game/expansionSeeds.json').write_text(json.dumps(seeds, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
