"""Builds docs/sifferkontroll.xlsx from the two checklist CSV files.

Ticks and comments already written in the "Kontrollerad" and "Kommentar" columns are kept
for rows whose place, description and value are unchanged.
Run with: npm run sifferkontroll   (needs: pip install openpyxl)
"""
import csv
import os
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.worksheet.datavalidation import DataValidation

OUT = "docs/sifferkontroll.xlsx"
HEAD_FILL = PatternFill("solid", fgColor="1D4E89")
HEAD_FONT = Font(bold=True, color="FFFFFF")
CHOICES = '"OK,Fel,Oklart"'


def read(path):
    with open(path, encoding="utf-8", newline="") as f:
        return list(csv.reader(f))


def old_marks():
    """(sheet, row content) -> (Kontrollerad, Kommentar) from the existing workbook."""
    marks = {}
    if not os.path.exists(OUT):
        return marks
    for ws in load_workbook(OUT):
        for row in ws.iter_rows(min_row=2, values_only=True):
            checked, comment = row[0], row[-1]
            if checked or comment:
                marks[(ws.title, tuple(str(c or "") for c in row[1:5]))] = (checked, comment)
    return marks


def sheet(wb, title, rows, widths, marks, first):
    ws = wb.active if first else wb.create_sheet()
    ws.title = title
    ws.append(["Kontrollerad"] + rows[0] + ["Kommentar"])
    for r in rows[1:]:
        checked, comment = marks.get((title, tuple(r[:4])), (None, None))
        ws.append([checked] + r + [comment])
    for cell in ws[1]:
        cell.fill = HEAD_FILL
        cell.font = HEAD_FONT
    for row in ws.iter_rows(min_row=2):
        for cell in row:
            cell.alignment = Alignment(wrap_text=True, vertical="top")
            if isinstance(cell.value, str) and cell.value.startswith("http"):
                cell.hyperlink = cell.value
    for i, w in enumerate(widths):
        ws.column_dimensions[chr(ord("A") + i)].width = w
    if ws.max_row > 1:
        pick = DataValidation(type="list", formula1=CHOICES, allow_blank=True)
        ws.add_data_validation(pick)
        pick.add(f"A2:A{ws.max_row}")
    ws.freeze_panes = "B2"
    ws.auto_filter.ref = ws.dimensions


marks = old_marks()
wb = Workbook()
sheet(wb, "Sifferkontroll", read("docs/sifferkontroll.csv"), [13, 18, 26, 60, 22, 60, 14, 40, 40], marks, True)
sheet(wb, "Alla menyvärden", read("docs/sifferkontroll_menyer.csv"), [13, 18, 22, 44, 50, 12, 12, 16, 12, 44, 40], marks, False)
wb.save(OUT)
print(f"{OUT} written, {len(marks)} earlier tick(s) or comment(s) found")
