"""Regenerate the public one-page native import examples, not private manuscripts."""
from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT
from xml.sax.saxutils import escape
import re

root = Path(__file__).resolve().parents[1] / 'learn' / 'documents'
source = (root / 'sample.md').read_text()
paragraphs = source.strip().split('\n\n')
doc = Document()
section = doc.sections[0]
section.top_margin = section.bottom_margin = Inches(.8)
section.left_margin = section.right_margin = Inches(.8)
normal = doc.styles['Normal']
normal.font.name = 'Calibri'
normal.font.size = Pt(12)
normal.paragraph_format.space_after = Pt(12)
title = doc.styles['Title']
title.font.color.rgb = RGBColor(0, 0, 0)
title.font.size = Pt(24)
title.font.underline = False
doc.styles['Heading 1'].font.color.rgb = RGBColor(0, 0, 0)
for text in paragraphs:
    if text.startswith('# '):
        doc.add_paragraph(text[2:], style='Title')
    elif text.startswith('## '):
        doc.add_heading(text[3:], level=1)
    else:
        doc.add_paragraph(text)
doc.core_properties.title = 'Citation import sample'
doc.core_properties.author = 'Randal Cox'
for element in [doc.element, doc.styles.element]:
    for border in element.xpath('.//w:pBdr'):
        border.getparent().remove(border)
doc.save(root / 'sample.docx')

styles = getSampleStyleSheet()
styles['Title'].alignment = TA_LEFT
styles['Title'].fontSize = 24
styles['Title'].leading = 29
styles['BodyText'].fontName = 'Times-Roman'
styles['BodyText'].fontSize = 12
styles['BodyText'].leading = 18
story = []
for text in paragraphs:
    style = 'Title' if text.startswith('# ') else 'Heading2' if text.startswith('## ') else 'BodyText'
    content = text[2:] if text.startswith('# ') else text[3:] if text.startswith('## ') else text
    story.extend([Paragraph(escape(content), styles[style]), Spacer(1, 12)])
SimpleDocTemplate(str(root / 'sample.pdf'), title='Citation import sample', author='Randal Cox').build(story)
(root / 'sample.txt').write_text(re.sub(r'^#{1,2} ', '', source, flags=re.M))
