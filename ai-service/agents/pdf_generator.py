"""
Génération de rapports PDF (ReportLab) à partir du dict produit
par agents.reporting_agent.generate_report().

Le rendu est générique et récursif : il ne suppose pas de schéma
figé pour le contenu du rapport (segmentation, risque, pricing, ...),
il traverse simplement la structure dict/list/valeur. Cela évite
de devoir maintenir ce module en synchronisme avec chaque agent
dès qu'un champ change.

Structure visuelle :
- Bandeau d'en-tête (titre + méta)
- Chaque section de premier niveau -> bannière colorée pleine largeur
- Chaque sous-groupe scalaire -> tableau clé/valeur zébré (pas de texte empilé)
- Listes de valeurs simples -> puces indentées
- Listes de dicts -> encadrés numérotés
- Certains champs connus (statut, booléens) -> couleur sémantique
- Pied de page avec numérotation
"""

from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
)

# ---------------------------------------------------------------- palette --
NAVY = colors.HexColor("#1B2A4A")
NAVY_SOFT = colors.HexColor("#2E4373")
AMBER = colors.HexColor("#C8922F")
BG_BANNER = colors.HexColor("#1B2A4A")
BG_SUBBANNER = colors.HexColor("#EEF1F7")
ROW_ALT = colors.HexColor("#F6F7FA")
ROW_WHITE = colors.white
TEXT_DARK = colors.HexColor("#22262F")
TEXT_MUTED = colors.HexColor("#6B7280")
GREEN = colors.HexColor("#2E7D4F")
RED = colors.HexColor("#B23A3A")
AMBER_TEXT = colors.HexColor("#9A6B12")

# --------------------------------------------------------------- libellés --
_LABELS = {
    "report_id": "N° de rapport",
    "generated_at": "Généré le",
    "type": "Type de rapport",
    "client_analysis": "Analyse client",
    "global_analysis": "Analyse globale",
    "executive_summary": "Résumé exécutif",
    "segmentation": "Segmentation",
    "risque": "Risque",
    "pricing": "Tarification",
    "recommandations": "Recommandations",
    "fraude": "Fraude",
    "compliance": "Conformité",
    "global_kpis": "Indicateurs clés globaux",
    "segment_distribution": "Répartition par segment",
    "sinistres_par_segment": "Sinistres par segment",
    "last_updated": "Dernière mise à jour",
    "explication": "Contribution des facteurs",
    "explication_textuelle": "Explication",
    "violations": "Violations",
    "alertes": "Alertes",
    "client_id": "Client ID",
    "score_risque": "Score de risque",
    "prime_actuelle": "Prime actuelle",
    "prime_recommandee": "Prime recommandée",
    "variation_pct": "Variation",
    "statut_conformite": "Statut de conformité",
    "fraude_suspecte": "Fraude suspectée",
    "score_suspicion": "Score de suspicion",
}

# Valeurs textuelles qui déclenchent une couleur sémantique
_GREEN_HINTS = ("conforme", "ok", "faible", "false")
_RED_HINTS = ("non conforme", "suspect", "eleve", "élevé", "true")
_AMBER_HINTS = ("necessite validation", "nécessite validation", "modéré", "modere", "a verifier", "à vérifier")

_SEMANTIC_KEYS = {"statut_conformite", "fraude_suspecte", "niveau"}


def _label(key: str) -> str:
    if key is None:
        return ""
    if key in _LABELS:
        return _LABELS[key]
    return str(key).replace("_", " ").capitalize()


def _fmt_scalar(value):
    if value is None:
        return "—"
    if isinstance(value, bool):
        return "Oui" if value else "Non"
    if isinstance(value, float):
        return f"{value:,.2f}".replace(",", " ")
    return str(value)


def _semantic_color(key, value):
    if key not in _SEMANTIC_KEYS:
        return None
    text = str(value).strip().lower()
    if any(h in text for h in _RED_HINTS):
        return RED
    if any(h in text for h in _AMBER_HINTS):
        return AMBER_TEXT
    if any(h in text for h in _GREEN_HINTS):
        return GREEN
    return None


def _styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="ReportTitle", parent=styles["Title"],
        textColor=colors.white, alignment=TA_LEFT, fontSize=20, leading=24
    ))
    styles.add(ParagraphStyle(
        name="ReportSubtitle", parent=styles["Normal"],
        textColor=colors.HexColor("#C9D2E6"), fontSize=11
    ))
    styles.add(ParagraphStyle(
        name="SectionBanner", parent=styles["Normal"],
        textColor=colors.white, fontName="Helvetica-Bold", fontSize=13
    ))
    styles.add(ParagraphStyle(
        name="SubHeading", parent=styles["Normal"],
        textColor=NAVY_SOFT, fontName="Helvetica-Bold", fontSize=10.5,
        spaceBefore=8, spaceAfter=4
    ))
    styles.add(ParagraphStyle(
        name="KVLabel", parent=styles["Normal"],
        textColor=TEXT_MUTED, fontName="Helvetica-Bold", fontSize=9
    ))
    styles.add(ParagraphStyle(
        name="KVValue", parent=styles["Normal"],
        textColor=TEXT_DARK, fontSize=9.5
    ))
    styles.add(ParagraphStyle(
        name="BodyText9", parent=styles["Normal"],
        textColor=TEXT_DARK, fontSize=9.5, leading=13
    ))
    styles.add(ParagraphStyle(
        name="BulletText", parent=styles["Normal"],
        textColor=TEXT_DARK, fontSize=9.5, leading=13,
        leftIndent=16, bulletIndent=4, spaceBefore=1, spaceAfter=1
    ))
    styles.add(ParagraphStyle(
        name="BulletTextWarn", parent=styles["Normal"],
        textColor=RED, fontName="Helvetica-Bold", fontSize=9.5, leading=13,
        leftIndent=16, bulletIndent=4, spaceBefore=1, spaceAfter=1
    ))
    styles.add(ParagraphStyle(
        name="BulletTextAlert", parent=styles["Normal"],
        textColor=AMBER_TEXT, fontName="Helvetica-Bold", fontSize=9.5, leading=13,
        leftIndent=16, bulletIndent=4, spaceBefore=1, spaceAfter=1
    ))
    styles.add(ParagraphStyle(
        name="Muted", parent=styles["Normal"],
        textColor=TEXT_MUTED, fontSize=9, fontName="Helvetica-Oblique"
    ))
    return styles


def _section_banner(title, story, styles, level):
    if not title:
        return
    if level == 0:
        t = Table([[Paragraph(title, styles["SectionBanner"])]], colWidths=[17 * cm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), BG_BANNER),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(Spacer(1, 10))
        story.append(t)
        story.append(Spacer(1, 6))
    else:
        story.append(Paragraph(title, styles["SubHeading"]))


def _kv_table(rows, styles, indent_cm=0.0):
    """rows: list of (label_key, value). Rend un tableau 2 colonnes zébré."""
    if not rows:
        return None
    data = []
    for i, (key, value) in enumerate(rows):
        color = _semantic_color(key, value)
        value_style = ParagraphStyle(
            "KVValueColored", parent=styles["KVValue"],
            textColor=color if color else TEXT_DARK,
            fontName="Helvetica-Bold" if color else "Helvetica"
        )
        data.append([
            Paragraph(_label(key), styles["KVLabel"]),
            Paragraph(_fmt_scalar(value), value_style)
        ])
    label_w = 5.5 * cm
    value_w = (17 - indent_cm) * cm - label_w
    table = Table(data, colWidths=[label_w, value_w], hAlign="LEFT")
    style_cmds = [
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, colors.HexColor("#E3E6EC")),
    ]
    for i in range(len(data)):
        style_cmds.append(("BACKGROUND", (0, i), (-1, i), ROW_ALT if i % 2 else ROW_WHITE))
    table.setStyle(TableStyle(style_cmds))
    return table


_WARN_KEYS = {"violations"}
_ALERT_KEYS = {"alertes"}


def _bullet_flowables(items, styles, style_key=None):
    if style_key in _WARN_KEYS:
        style = styles["BulletTextWarn"]
    elif style_key in _ALERT_KEYS:
        style = styles["BulletTextAlert"]
    else:
        style = styles["BulletText"]
    flowables = []
    for item in items:
        text = item if isinstance(item, str) else _fmt_scalar(item)
        flowables.append(Paragraph(text, style, bulletText="•"))
    return flowables


def _render_dict(raw_key, value: dict, story, styles, level, parent_key=None):
    if not value:
        return
    # Évite un sous-titre redondant type {"recommandations": {"recommandations": [...]}}
    if len(value) == 1:
        only_key, only_value = next(iter(value.items()))
        if only_key == raw_key:
            _render_block(raw_key, only_value, story, styles, level, parent_key=parent_key)
            return

    if raw_key != parent_key:
        _section_banner(_label(raw_key), story, styles, level)

    scalar_rows = []
    for key, sub_value in value.items():
        if isinstance(sub_value, (dict, list)):
            if scalar_rows:
                table = _kv_table(scalar_rows, styles)
                if table:
                    story.append(table)
                    story.append(Spacer(1, 6))
                scalar_rows = []
            _render_block(key, sub_value, story, styles, level + 1, parent_key=raw_key)
        else:
            scalar_rows.append((key, sub_value))

    if scalar_rows:
        table = _kv_table(scalar_rows, styles)
        if table:
            story.append(table)
            story.append(Spacer(1, 6))


def _render_list(raw_key, value: list, story, styles, level, parent_key=None):
    if raw_key and raw_key != parent_key:
        _section_banner(_label(raw_key), story, styles, level)

    if not value:
        story.append(Paragraph("Aucune donnée.", styles["Muted"]))
        story.append(Spacer(1, 4))
        return

    if all(not isinstance(item, (dict, list)) for item in value):
        for flowable in _bullet_flowables(value, styles, style_key=raw_key):
            story.append(flowable)
        story.append(Spacer(1, 6))
        return

    for idx, item in enumerate(value, start=1):
        if isinstance(item, dict):
            block = [Paragraph(f"Élément {idx}", styles["SubHeading"])]
            sub_story = []
            _render_dict(None, item, sub_story, styles, level + 1)
            story.append(KeepTogether(block + sub_story))
        elif isinstance(item, list):
            _render_list(None, item, story, styles, level + 1)
        else:
            for flowable in _bullet_flowables([item], styles, style_key=raw_key):
                story.append(flowable)


def _render_block(raw_key, value, story, styles, level, parent_key=None):
    if isinstance(value, dict):
        _render_dict(raw_key, value, story, styles, level, parent_key=parent_key)
    elif isinstance(value, list):
        _render_list(raw_key, value, story, styles, level, parent_key=parent_key)
    else:
        if raw_key and raw_key != parent_key:
            _section_banner(_label(raw_key), story, styles, level)
        story.append(Paragraph(_fmt_scalar(value), styles["BodyText9"]))
        story.append(Spacer(1, 6))


def _footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(2 * cm, 1.2 * cm, "AI Business Advisor — Rapport généré automatiquement")
    canvas.drawRightString(19 * cm, 1.2 * cm, f"Page {doc.page}")
    canvas.setStrokeColor(colors.HexColor("#E3E6EC"))
    canvas.line(2 * cm, 1.5 * cm, 19 * cm, 1.5 * cm)
    canvas.restoreState()


def build_report_pdf(report: dict) -> bytes:
    """Construit le PDF binaire à partir du dict de rapport et retourne les bytes."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=1.5 * cm, bottomMargin=2 * cm,
        title=report.get("report_id", "Rapport"),
    )
    styles = _styles()
    story = []

    # --- bandeau d'en-tête ---
    header_left = [
        Paragraph("AI Business Advisor", styles["ReportTitle"]),
        Spacer(1, 2),
        Paragraph(report.get("type", "Rapport"), styles["ReportSubtitle"]),
    ]
    header_right = [
        Paragraph(f"N° {report.get('report_id', '—')}", styles["ReportSubtitle"]),
        Paragraph(str(report.get("generated_at", "—"))[:19].replace("T", " "), styles["ReportSubtitle"]),
    ]
    header_table = Table(
        [[header_left, header_right]],
        colWidths=[11 * cm, 6 * cm]
    )
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BG_BANNER),
        ("LEFTPADDING", (0, 0), (0, 0), 14),
        ("RIGHTPADDING", (1, 0), (1, 0), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 16),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 16),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 4))
    accent_bar = Table([[""]], colWidths=[17 * cm], rowHeights=[3])
    accent_bar.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), AMBER)]))
    story.append(accent_bar)
    story.append(Spacer(1, 10))

    skip_keys = {"report_id", "generated_at", "type"}
    for key, value in report.items():
        if key in skip_keys:
            continue
        _render_block(key, value, story, styles, level=0)

    doc.build(story, onFirstPage=_footer, onLaterPages=_footer)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes