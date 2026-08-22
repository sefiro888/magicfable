#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Convierte un documento Markdown del proyecto en un PDF legible.

Uso:
    python tools/md_to_pdf.py docs/FACCION_MAREA.md "Marea · NEX-03"

Pensado para los dosieres de diseño que el usuario lleva a Gemini o ChatGPT
para generar arte: títulos, tablas, listas, citas y bloques de código.

Requiere reportlab:  pip install reportlab

OJO con los glifos: las fuentes base de reportlab (Helvetica, Courier) NO
traen símbolos como ▸ o ■, y salen como un cuadrado negro sin avisar. Usa
viñetas ASCII o • y comprueba el resultado extrayendo el texto del PDF.
"""

from __future__ import annotations

import re
import sys

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

_styles = getSampleStyleSheet()
BASE = ParagraphStyle('cuerpo', parent=_styles['BodyText'], fontName='Helvetica',
                      fontSize=9.5, leading=13.5, spaceAfter=5,
                      textColor=colors.HexColor('#1d1d1f'))
H1 = ParagraphStyle('h1', parent=_styles['Title'], fontName='Helvetica-Bold', fontSize=22,
                    leading=26, spaceAfter=10, textColor=colors.HexColor('#7a5a1e'))
H2 = ParagraphStyle('h2', parent=BASE, fontName='Helvetica-Bold', fontSize=15, leading=19,
                    spaceBefore=16, spaceAfter=7, textColor=colors.HexColor('#7a5a1e'))
H3 = ParagraphStyle('h3', parent=BASE, fontName='Helvetica-Bold', fontSize=12.5, leading=16,
                    spaceBefore=11, spaceAfter=4, textColor=colors.HexColor('#31435e'))
H4 = ParagraphStyle('h4', parent=BASE, fontName='Helvetica-Bold', fontSize=11, leading=14,
                    spaceBefore=10, spaceAfter=3, textColor=colors.HexColor('#8a3d2a'))
BULLET = ParagraphStyle('bullet', parent=BASE, leftIndent=10, bulletIndent=2, spaceAfter=3)
CODE = ParagraphStyle('code', parent=BASE, fontName='Courier', fontSize=8.5, leading=11.5,
                      backColor=colors.HexColor('#f2f1ee'), borderPadding=6,
                      spaceBefore=5, spaceAfter=7)
QUOTE = ParagraphStyle('quote', parent=BASE, leftIndent=12, fontName='Helvetica-Oblique',
                       textColor=colors.HexColor('#41414a'))


def inline(text: str) -> str:
    """Marcado en línea de Markdown a las etiquetas que entiende reportlab."""
    text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'(?<!\*)\*([^*]+?)\*(?!\*)', r'<i>\1</i>', text)
    text = re.sub(r'`([^`]+?)`', r'<font face="Courier" color="#8a3d2a">\1</font>', text)
    return text


def build(origen: str, destino: str, titulo: str, pie: str) -> None:
    story: list = []
    tabla: list = []
    en_codigo = False
    buffer_codigo: list[str] = []

    def volcar_tabla() -> None:
        if not tabla:
            return
        t = Table(list(tabla), hAlign='LEFT')
        t.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#ccc8c0')),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f0ece2')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.extend([t, Spacer(1, 8)])
        tabla.clear()

    for raw in open(origen, encoding='utf-8').read().split('\n'):
        line = raw.rstrip()

        if line.startswith('```'):
            if en_codigo:
                story.append(Paragraph('<br/>'.join(inline(l) for l in buffer_codigo), CODE))
                buffer_codigo = []
            en_codigo = not en_codigo
            continue
        if en_codigo:
            buffer_codigo.append(line if line else ' ')
            continue

        if line.startswith('|'):
            celdas = [c.strip() for c in line.strip('|').split('|')]
            if not all(set(c) <= set('-: ') for c in celdas):
                tabla.append([Paragraph(inline(c), BASE) for c in celdas])
            continue
        volcar_tabla()

        if not line.strip():
            continue
        if line.startswith('# '):
            story.append(Paragraph(inline(line[2:]), H1))
        elif line.startswith('## '):
            story.append(Paragraph(inline(line[3:]), H2))
        elif line.startswith('### '):
            story.append(Paragraph(inline(line[4:]), H3))
        elif line.startswith('#### '):
            story.append(Paragraph(inline(line[5:]), H4))
        elif line.startswith('---'):
            story.append(HRFlowable(width='100%', thickness=0.6,
                                    color=colors.HexColor('#d8d3c8'), spaceBefore=6, spaceAfter=8))
        elif line.startswith('> '):
            story.append(Paragraph(inline(line[2:]), QUOTE))
        elif line.lstrip().startswith(('- ', '* ')):
            sangria = 10 + (len(line) - len(line.lstrip())) * 2
            estilo = ParagraphStyle('b', parent=BULLET, leftIndent=sangria)
            story.append(Paragraph(inline(line.lstrip()[2:]), estilo, bulletText='•'))
        elif re.match(r'^\d+\. ', line.strip()):
            story.append(Paragraph(inline(re.sub(r'^\d+\. ', '', line.strip())), BULLET, bulletText='-'))
        else:
            story.append(Paragraph(inline(line), BASE))

    volcar_tabla()

    doc = SimpleDocTemplate(destino, pagesize=A4, title=titulo, author='Crónicas del Nexo',
                            leftMargin=18 * mm, rightMargin=18 * mm,
                            topMargin=16 * mm, bottomMargin=16 * mm)

    def pintar_pie(canvas, documento):
        canvas.saveState()
        canvas.setFont('Helvetica', 7.5)
        canvas.setFillColor(colors.HexColor('#8a867e'))
        canvas.drawString(18 * mm, 10 * mm, pie)
        canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, str(documento.page))
        canvas.restoreState()

    doc.build(story, onFirstPage=pintar_pie, onLaterPages=pintar_pie)
    print('PDF generado:', destino)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        raise SystemExit(1)
    fuente = sys.argv[1]
    nombre = sys.argv[2] if len(sys.argv) > 2 else 'Crónicas del Nexo'
    salida = sys.argv[3] if len(sys.argv) > 3 else fuente.rsplit('.', 1)[0] + '.pdf'
    build(fuente, salida, nombre, f'Crónicas del Nexo · {nombre}')
