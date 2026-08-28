#!/usr/bin/env python3
"""Generate a single SAIP source-code PDF for request 26-12-81959218."""
from __future__ import annotations

import hashlib
import os
import re
import subprocess
from datetime import date
from pathlib import Path

from fpdf import FPDF
from fpdf.enums import XPos, YPos

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "fkrih" / "saip-26-12-81959218-حلاق-ماب"
OUT_PDF = Path(os.environ.get("SAIP_OUT_PDF") or (OUT_DIR / "halaqmap-saip-26-12-81959218-source.pdf"))
FONTS = Path(r"C:\Windows\Fonts")

BIN_EXT = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg",
    ".woff", ".woff2", ".ttf", ".otf", ".eot",
    ".mp4", ".mp3", ".wav", ".webm",
    ".pdf", ".zip", ".wasm", ".bin", ".sqlite", ".db",
}

SKIP_SUFFIX = {".env"}
SKIP_NAMES = {".keystore", ".jks", ".pem"}
# Operational handoff / secrets — not source of this SAIP work.
SKIP_BASENAMES = {
    "bank_details.txt",
    "dashboard_access.txt",
    "start_here.txt",
}
THIS_REQUEST_FKRIH = {
    "fkrih/حلاق-ماب.md",
    "fkrih/بيان-المؤلف.md",
}

AUTHOR_EN = "BINSARRA AHMED ABDULLAH A"
REQUEST_ID = "26-12-81959218"


def skip_rel(rel: str) -> bool:
    rel = rel.replace("\\", "/")
    lower = rel.lower()
    base = lower.rsplit("/", 1)[-1]
    if base in SKIP_BASENAMES:
        return True
    if rel.startswith("fkrih/"):
        if rel.startswith("fkrih/saip-26-12-81959218"):
            return rel.endswith(".py") or rel.endswith(".pdf") or rel.endswith(".zip")
        return rel not in THIS_REQUEST_FKRIH
    return False


def git_files() -> list[str]:
    raw = subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT).split(b"\0")
    out = []
    for b in raw:
        if not b:
            continue
        rel = b.decode("utf-8")
        p = ROOT / rel
        if not p.is_file():
            continue
        lower = rel.replace("\\", "/").lower()
        if lower.endswith(".env") and not lower.endswith(".example"):
            continue
        if any(lower.endswith(s) for s in SKIP_NAMES):
            continue
        if "/node_modules/" in f"/{lower}/" or lower.startswith("node_modules/"):
            continue
        if lower.startswith("dist/") or "/dist/" in lower:
            continue
        if skip_rel(rel.replace("\\", "/")):
            continue
        out.append(rel.replace("\\", "/"))
    extra = [
        "fkrih/saip-26-12-81959218-حلاق-ماب/قائمة-الاستبعاد.md",
        "fkrih/saip-26-12-81959218-حلاق-ماب/اقرأ-أولا.md",
        "fkrih/حلاق-ماب.md",
        "fkrih/بيان-المؤلف.md",
    ]
    for rel in extra:
        if (ROOT / rel).is_file() and rel.replace("\\", "/") not in out:
            out.append(rel.replace("\\", "/"))
    return sorted(set(out))


def is_text(path: Path) -> bool:
    if path.suffix.lower() in BIN_EXT:
        return False
    data = path.read_bytes()[:8000]
    if b"\x00" in data:
        return False
    try:
        data.decode("utf-8")
        return True
    except UnicodeDecodeError:
        return False


def sanitize(s: str) -> str:
    s = s.replace("\r\n", "\n").replace("\r", "\n").replace("\t", "    ")
    out = []
    for ch in s:
        o = ord(ch)
        if ch in "\n":
            out.append(ch)
        elif o < 32 or o == 127:
            out.append(" ")
        else:
            out.append(ch)
    return "".join(out)


class SourcePdf(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Ui", size=8)
        self.set_text_color(80, 80, 80)
        self.cell(0, 6, f"HalaqMap source — SAIP {REQUEST_ID} — {AUTHOR_EN}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_text_color(0, 0, 0)
        self.line(12, 12, 198, 12)
        self.set_y(14)

    def footer(self):
        self.set_y(-10)
        self.set_font("Ui", size=8)
        self.set_text_color(90, 90, 90)
        self.cell(0, 6, f"{self.page_no()} / {{nb}}", align="C")
        self.set_text_color(0, 0, 0)


def wrap_line(pdf: FPDF, text: str, max_w: float) -> list[str]:
    if not text:
        return [""]
    if max_w < 8:
        max_w = 8
    try:
        if pdf.get_string_width(text) <= max_w:
            return [text]
    except Exception:
        text = text.encode("ascii", "replace").decode("ascii")
        if pdf.get_string_width(text) <= max_w:
            return [text]
    parts = []
    buf = ""
    for ch in text:
        trial = buf + ch
        try:
            w = pdf.get_string_width(trial)
        except Exception:
            ch = "?"
            trial = buf + ch
            w = pdf.get_string_width(trial)
        if w <= max_w:
            buf = trial
        else:
            if buf:
                parts.append(buf)
                buf = ch
            else:
                parts.append(ch)
                buf = ""
    if buf:
        parts.append(buf)
    return parts or [""]


def add_paragraph(pdf: FPDF, text: str, lh: float = 3.4):
    pdf.set_x(pdf.l_margin)
    max_w = pdf.w - pdf.r_margin - pdf.l_margin
    for raw_line in text.split("\n"):
        for piece in wrap_line(pdf, raw_line, max_w):
            pdf.set_x(pdf.l_margin)
            pdf.cell(0, lh, piece, new_x=XPos.LMARGIN, new_y=YPos.NEXT)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rels = git_files()
    text_files: list[tuple[str, Path]] = []
    bin_files: list[tuple[str, Path, int, str]] = []
    for rel in rels:
        path = ROOT / rel
        if is_text(path):
            text_files.append((rel, path))
        else:
            data = path.read_bytes()
            digest = hashlib.sha256(data).hexdigest()
            bin_files.append((rel, path, len(data), digest))

    iban_re = re.compile(r"\bSA[0-9]{22}\b")
    iban_hits = []
    for rel, path in text_files:
        body = path.read_text(encoding="utf-8", errors="replace")
        if iban_re.search(body):
            iban_hits.append(rel)
    if iban_hits:
        raise SystemExit("Refuse to emit SAIP PDF: IBAN found in " + ", ".join(iban_hits))

    pdf = SourcePdf(format="A4", unit="mm")
    pdf.set_auto_page_break(auto=True, margin=14)
    pdf.set_margins(12, 16, 12)
    pdf.add_font("Ui", fname=str(FONTS / "arial.ttf"))
    pdf.add_font("Code", fname=str(FONTS / "consola.ttf"))
    pdf.set_fallback_fonts(["Ui"])
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.set_xy(12, 20)
    pdf.set_font("Ui", size=16)
    add_paragraph(pdf, "Complete source code of HalaqMap", 8)
    pdf.set_font("Ui", size=12)
    add_paragraph(pdf, "HalaqMap platform — full source listing (PDF)", 6)
    pdf.ln(2)
    pdf.set_font("Ui", size=11)
    ar_name = (
        "\u0627\u062d\u0645\u062f \u0628\u0646 \u0639\u0628\u062f\u0627\u0644\u0644\u0629 "
        "\u0628\u0646 \u0639\u0628\u062f\u0627\u0644\u0644\u0629 \u0628\u0646 \u0633\u0631\u0627\u0621"
    )
    cover = (
        f"SAIP request: {REQUEST_ID}\n"
        f"Author: {AUTHOR_EN}\n"
        f"Arabic legal name: {ar_name}\n"
        f"Generated: {date.today().isoformat()}\n"
        f"Text source files: {len(text_files)}\n"
        f"Binary assets (listed with SHA-256, not rasterized): {len(bin_files)}\n"
        "Format required by SAIP portal: one PDF.\n"
        "Excluded: node_modules, .env secrets, dist/build outputs, bank-account handoff files, dashboard credential notes, other-work fkrih dossiers.\n"
        "GitHub handle ritchstar is not the legal author. Cursor is a writing tool, not a co-author."
    )
    add_paragraph(pdf, cover, 6)
    pdf.ln(4)

    pdf.set_font("Ui", size=14)
    pdf.cell(0, 8, "1. File index", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("Ui", size=7)
    for i, (rel, _) in enumerate(text_files, 1):
        add_paragraph(pdf, f"T{i:04d}  {rel}", 3.2)
    pdf.ln(2)
    pdf.set_font("Ui", size=12)
    pdf.cell(0, 7, "Binary assets", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("Ui", size=7)
    for i, (rel, _, size, digest) in enumerate(bin_files, 1):
        add_paragraph(pdf, f"B{i:04d}  {rel}  ({size} bytes)  sha256:{digest}", 3.2)

    for i, (rel, path) in enumerate(text_files, 1):
        pdf.add_page()
        pdf.set_font("Ui", size=10)
        add_paragraph(pdf, f"T{i:04d}  {rel}", 5)
        pdf.ln(1)
        pdf.set_font("Code", size=6.5)
        try:
            body = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            body = path.read_text(encoding="utf-8", errors="replace")
        add_paragraph(pdf, sanitize(body), 3.15)
        if i % 50 == 0:
            print(f"wrote {i}/{len(text_files)}", flush=True)

    pdf.output(str(OUT_PDF))
    mb = OUT_PDF.stat().st_size / (1024 * 1024)
    print(f"PDF {OUT_PDF}")
    print(f"size_mb {mb:.2f}")
    print(f"pages {pdf.pages_count}")
    if mb >= 1024:
        raise SystemExit("PDF exceeds 1024 MB")


if __name__ == "__main__":
    os.chdir(ROOT)
    main()
