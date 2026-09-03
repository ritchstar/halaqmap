#!/usr/bin/env python3
"""Scan independent SAIP works for leaked secrets, then emit one portal-sized PDF each."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path

from fpdf import FPDF
from fpdf.enums import XPos, YPos

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "fkrih" / "saip-pack" / "out"
FONTS = Path(r"C:\Windows\Fonts")
AUTHOR_EN = "BINSARRA AHMED ABDULLAH A"
AUTHOR_AR = (
    "\u0627\u062d\u0645\u062f \u0628\u0646 \u0639\u0628\u062f\u0627\u0644\u0644\u0629 "
    "\u0628\u0646 \u0639\u0628\u062f\u0627\u0644\u0644\u0629 \u0628\u0646 \u0633\u0631\u0627\u0621"
)
PORTAL_MAX_MB = 1024
SAFE_TARGET_MB = 80

BIN_EXT = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg",
    ".woff", ".woff2", ".ttf", ".otf", ".eot",
    ".mp4", ".mp3", ".wav", ".webm",
    ".pdf", ".zip", ".wasm", ".bin", ".sqlite", ".db",
}
SKIP_BASENAMES = {
    "bank_details.txt",
    "dashboard_access.txt",
    "start_here.txt",
}
SKIP_NAME_SUFFIX = {".keystore", ".jks", ".pem"}
ALWAYS_SKIP_PREFIX = (
    "node_modules/",
    "dist/",
    "moyasar/",
    "Twilio/",
    "google-ads/",
    "youtube-channel/",
    "halaqmap_partners/",
    "halaqmap7/",
    "nazamsafir/",
    "supabase/.temp/",
    "fkrih/saip-pack/out/",
    "fkrih/saip-pack/__pycache__/",
)

# Shared hall/guest-lock kernel used by live invitation products.
HALL_SHARED = (
    "storeGuestDeviceLock",
    "useGuestDeviceGate",
    "StoreGuestDeviceBlocked",
    "StoreHostGuestInviteIssuance",
    "StoreGuestResentLinkPreview",
    "store-live-invite-share",
    "storeLiveInviteShare",
    "StoreHallAtmosphere",
    "StoreHallYoutubePlayer",
    "StoreHallVideoWell",
    "downloadInviteCardAsPng",
)

SECRET_RULES: list[tuple[str, re.Pattern[str]]] = [
    ("iban", re.compile(r"\bSA[0-9]{22}\b")),
    ("moyasar_secret", re.compile(r"\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b")),
    ("twilio_sid", re.compile(r"\bAC[0-9a-fA-F]{32}\b")),
    ("private_pem", re.compile(r"-----BEGIN (?:RSA )?PRIVATE KEY-----")),
    ("aws_key", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("github_token", re.compile(r"\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b")),
    ("jwt_secret", re.compile(r"\beyJ[A-Za-z0-9_-]{40,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b")),
    ("demo_password", re.compile(r"\b(?:admin123|barber123)\b")),
]


@dataclass
class Product:
    slug: str
    title_ar: str
    title_en: str
    fkrih: str
    mode: str  # include | subtract
    include: tuple[str, ...] = ()
    exclude: tuple[str, ...] = ()
    extra_files: tuple[str, ...] = field(default_factory=tuple)


def P(
    slug: str,
    title_ar: str,
    fkrih: str,
    include: tuple[str, ...] = (),
    exclude: tuple[str, ...] = (),
    extra: tuple[str, ...] = (),
    mode: str = "include",
    title_en: str = "",
) -> Product:
    return Product(
        slug=slug,
        title_ar=title_ar,
        title_en=title_en or slug,
        fkrih=fkrih,
        mode=mode,
        include=include,
        exclude=exclude,
        extra_files=extra,
    )


PRODUCTS: list[Product] = [
    P(
        "halaqmap",
        "منصة حلاق ماب",
        "fkrih/حلاق-ماب.md",
        mode="subtract",
        extra=("package.json", "src/main.tsx", "src/pages/Home.tsx"),
        title_en="HalaqMap platform",
    ),
    P(
        "coiffeur",
        "كوافير ماب",
        "fkrih/كوافير-ماب.md",
        include=("coiffeur", "Coiffeur", "COIFFEUR"),
        exclude=("Ambassador", "ambassador", "Ambassadors"),
        extra=(".cursor/rules/arabic-rtl-bidi.mdc",),
        title_en="Coiffeur Map",
    ),
    P(
        "listing-license",
        "رخصة النفاذ",
        "fkrih/رخصة-النفاذ.md",
        include=(
            "listingLicense",
            "ListingLicense",
            "listing_license",
            "geospatialLicense",
            "onDemandVisibility",
            "softwareLicenseTerminology",
        ),
        title_en="Listing license",
    ),
    P(
        "digital-shift",
        "المناوب الرقمي",
        "fkrih/المناوب-الرقمي.md",
        include=("digitalShift", "DigitalShift", "digital_shift", "digital-shift"),
        exclude=("Wallet", "wallet", "WalletTopup", "wallet_topup"),
        title_en="Digital shift",
    ),
    P(
        "shift-wallet",
        "محفظة المناوب",
        "fkrih/محفظة-المناوب.md",
        include=(
            "walletTopup",
            "WalletTopup",
            "wallet_topup",
            "wallet-topup",
            "wallet-drain",
            "WalletDrain",
            "digitalShiftWallet",
            "shift-wallet",
        ),
        title_en="Shift wallet",
    ),
    P(
        "ambassadors",
        "سفراء حلاق ماب",
        "fkrih/سفراء-حلاق-ماب.md",
        include=("ambassador", "Ambassador", "ambassadors"),
        exclude=("coiffeurAmbassador", "CoiffeurAmbassador", "coiffeur/ambassador"),
        extra=("docs/ambassadors/", "public/docs/ambassadors/"),
        title_en="HalaqMap ambassadors",
    ),
    P(
        "coiffeur-ambassadors",
        "مسوقات كوافير ماب",
        "fkrih/مسوقات-كوافير-ماب.md",
        include=("coiffeurAmbassador", "CoiffeurAmbassador", "coiffeur-ambassador", "coiffeur/ambassador"),
        title_en="Coiffeur ambassadors",
    ),
    P(
        "enterprise-cohort",
        "الشريك المرجعي",
        "fkrih/الشريك-المرجعي.md",
        include=(
            "enterpriseAnchor",
            "enterpriseCohort",
            "EnterpriseAnchor",
            "enterprise_cohort",
            "enterprise-cohort",
            "enterprise_anchor",
        ),
        title_en="Reference partner cohort",
    ),
    P(
        "afrahi1",
        "افراحي1",
        "fkrih/افراحي1.md",
        include=("storeWedding", "StoreWedding", "store_wedding", "wedding-welcome", "lab-wedding", "test-wedding")
        + HALL_SHARED,
        exclude=("storeEvent", "StoreEvent", "store_event"),
        extra=(".cursor/rules/store-wedding-live.mdc",),
        title_en="Afrahi1",
    ),
    P(
        "ajwa1",
        "اجواء1",
        "fkrih/اجواء1.md",
        include=("storeEvent", "StoreEvent", "store_event", "storeWeddingLiveLab") + HALL_SHARED,
        extra=(".cursor/rules/store-event-live.mdc",),
        title_en="Ajwa1",
    ),
    P(
        "loungea1",
        "لاونجا1",
        "fkrih/لاونجا1.md",
        include=("storeLounge", "StoreLounge", "store_lounge", "lab-lounge", "lounge-hero", "/lounge/")
        + HALL_SHARED,
        extra=(".cursor/rules/store-lounge-live.mdc",),
        title_en="Loungea1",
    ),
    P(
        "cardi8",
        "كاردي8",
        "fkrih/كاردي8.md",
        include=(
            "storeIssued",
            "StoreIssued",
            "store_issued",
            "storeOccasion",
            "StoreOccasion",
            "occasionCard",
            "OccasionCard",
            "StoreInviteCard",
            "PaidInvite",
            "paid_invite",
            "paid-invite",
            "store-issued",
            "store-occasion",
            "occasion-card",
        ),
        exclude=("Bereavement", "bereavement", "Greeting", "IntroCard"),
        extra=(".cursor/rules/store-occasion-card.mdc",),
        title_en="Cardi8",
    ),
    P(
        "free-greeting",
        "بطاقة تهنئة مجانية",
        "fkrih/بطاقة-تهنئة-مجانية.md",
        include=("storeGreeting", "StoreGreeting", "StoreCardStudio", "GREETING_OCCASION"),
        title_en="Free greeting card",
    ),
    P(
        "intro-cards",
        "كروت تعريفية",
        "fkrih/كروت-تعريفية.md",
        include=("storeIntroCard", "StoreIntroCard", "intro-card", "id-card"),
        title_en="Intro cards",
    ),
    P(
        "bereavement",
        "بلاغ الوفاة والعزاء",
        "fkrih/بلاغ-الوفاة-والعزاء.md",
        include=("storeBereavement", "StoreBereavement", "bereavement"),
        extra=(
            "api/public-store-issued-cards.ts",
            "api/_lib/storeIssuedCards.ts",
            "api/_lib/storeIssuedWhatsApp.ts",
        ),
        title_en="Bereavement notice",
    ),
    P(
        "tamwinata1",
        "تمويناتا1",
        "fkrih/تمويناتا1.md",
        include=("storeGrocers", "StoreGrocers", "store_grocers", "grocers-hero", "/grocers/"),
        extra=(".cursor/rules/store-grocers-live.mdc",),
        title_en="Tamwinata1",
    ),
    P(
        "matamna1",
        "مطعمنا1",
        "fkrih/مطعمنا1.md",
        include=("storeRestaurant", "StoreRestaurant", "store_restaurant", "restaurant-hero", "/restaurant/"),
        extra=(".cursor/rules/store-restaurant-live.mdc",),
        title_en="Matamna1",
    ),
    P(
        "cafina1",
        "كافينا1",
        "fkrih/كافينا1.md",
        include=("storeCafe", "StoreCafe", "store_cafe", "cafe-hero"),
        extra=(".cursor/rules/store-cafe-live.mdc",),
        title_en="Cafina1",
    ),
    P(
        "tabkhatna1",
        "طبختنا1",
        "fkrih/طبختنا1.md",
        include=("storeKitchen", "StoreKitchen", "store_kitchen", "kitchen-hero", "/kitchen/"),
        exclude=("Gift", "gift"),
        extra=(".cursor/rules/store-kitchen-live.mdc",),
        title_en="Tabkhatna1",
    ),
    P(
        "khodarna1",
        "خضارنا1",
        "fkrih/خضارنا1.md",
        include=("storeProduce", "StoreProduce", "store_produce", "/produce/", "/v/"),
        extra=(".cursor/rules/store-produce-live.mdc",),
        title_en="Khodarna1",
    ),
    P(
        "halana1",
        "حلانا1",
        "fkrih/حلانا1.md",
        include=("storeHalana", "StoreHalana", "store_halana", "/halana/", "/h/"),
        extra=(".cursor/rules/store-halana-live.mdc", "fkrih/saip-pack/تمهيد-حلانا1.md"),
        title_en="Halana1",
    ),
    P(
        "store-front",
        "متجر خريطة الحل",
        "fkrih/متجر-خريطة-الحل.md",
        include=(
            "storeFront",
            "StoreFront",
            "storeShopHours",
            "StoreShopHours",
            "store-reviews",
            "storeReviews",
            "storeGift",
            "StoreGift",
            "store_gift",
            "KitchenGift",
            "kitchen-gift",
            "storeAffiliate",
            "StoreAffiliate",
            "store_affiliate",
            "moyasarPaymentReturn",
            "moyasar-webhook",
            "storeHostRedirect",
            "storeProductTrial",
            "storeSalesLedger",
            "storeMarketingReels",
        ),
        extra=(
            ".cursor/rules/store-gift-campaign.mdc",
            ".cursor/rules/store-kitchen-gift-campaign.mdc",
            ".cursor/rules/store-affiliate-live.mdc",
        ),
        title_en="HalaqMap store",
    ),
]


def posix(rel: str) -> str:
    return rel.replace("\\", "/")


def always_skip(rel: str) -> bool:
    rel = posix(rel)
    lower = rel.lower()
    base = lower.rsplit("/", 1)[-1]
    if base in SKIP_BASENAMES:
        return True
    if any(lower.endswith(s) for s in SKIP_NAME_SUFFIX):
        return True
    if lower.endswith(".env") and not lower.endswith(".example"):
        return True
    if any(rel.startswith(p) or f"/{p}" in f"/{rel}" for p in ALWAYS_SKIP_PREFIX):
        return True
    if "/node_modules/" in f"/{lower}/" or "/dist/" in f"/{lower}/":
        return True
    if rel.startswith("fkrih/saip-") and (lower.endswith(".pdf") or lower.endswith(".zip") or lower.endswith(".py")):
        return True
    return False


def contains_token(rel: str, token: str) -> bool:
    rel = posix(rel)
    if token.endswith("/"):
        return token in rel or rel.startswith(token) or f"/{token}" in f"/{rel}"
    return token in rel


def matches_include(rel: str, product: Product) -> bool:
    rel = posix(rel)
    if any(contains_token(rel, t) for t in product.exclude):
        return False
    if any(contains_token(rel, t) for t in product.include):
        return True
    for extra in product.extra_files:
        extra = posix(extra)
        if extra.endswith("/"):
            if rel.startswith(extra):
                return True
        elif rel == extra:
            return True
    return False


def git_tracked() -> list[str]:
    raw = subprocess.check_output(["git", "ls-files", "-z"], cwd=ROOT).split(b"\0")
    out = []
    for b in raw:
        if not b:
            continue
        rel = posix(b.decode("utf-8"))
        if not (ROOT / rel).is_file():
            continue
        if always_skip(rel):
            continue
        out.append(rel)
    return out


def other_include_tokens(current: Product) -> tuple[str, ...]:
    tokens: list[str] = []
    for p in PRODUCTS:
        if p.slug == current.slug or p.mode != "include":
            continue
        tokens.extend(p.include)
        for extra in p.extra_files:
            extra = posix(extra)
            if extra.startswith("fkrih/"):
                continue
            tokens.append(extra)
    return tuple(tokens)


def select_files(product: Product, tracked: list[str]) -> list[str]:
    selected: set[str] = set()
    if product.mode == "include":
        for rel in tracked:
            if matches_include(rel, product):
                selected.add(rel)
    else:
        foreign = other_include_tokens(product)
        for rel in tracked:
            if rel.startswith("fkrih/") and rel not in {product.fkrih, "fkrih/بيان-المؤلف.md"}:
                continue
            if rel.startswith(".cursor/rules/store-"):
                continue
            if any(contains_token(rel, t) for t in foreign):
                continue
            selected.add(rel)
        for extra in product.extra_files:
            extra = posix(extra)
            if (ROOT / extra).is_file() and not always_skip(extra):
                selected.add(extra)

    for extra in (product.fkrih, "fkrih/بيان-المؤلف.md"):
        if (ROOT / extra).is_file():
            selected.add(posix(extra))
    return sorted(selected)


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


def scan_text(rel: str, body: str) -> list[dict[str, str]]:
    hits = []
    for name, pattern in SECRET_RULES:
        found = pattern.findall(body)
        if found:
            hits.append({"file": rel, "rule": name, "count": str(len(found))})
    return hits


def sanitize(s: str) -> str:
    s = s.replace("\r\n", "\n").replace("\r", "\n").replace("\t", "    ")
    out = []
    for ch in s:
        o = ord(ch)
        if ch == "\n":
            out.append(ch)
        elif o < 32 or o == 127:
            out.append(" ")
        else:
            out.append(ch)
    return "".join(out)


class SourcePdf(FPDF):
    def __init__(self, banner: str, **kwargs):
        super().__init__(**kwargs)
        self._banner = banner

    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Ui", size=8)
        self.set_text_color(80, 80, 80)
        self.cell(0, 6, self._banner, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
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
    parts: list[str] = []
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


def add_paragraph(pdf: FPDF, text: str, lh: float = 3.4) -> None:
    pdf.set_x(pdf.l_margin)
    max_w = pdf.w - pdf.r_margin - pdf.l_margin
    for raw_line in text.split("\n"):
        for piece in wrap_line(pdf, raw_line, max_w):
            pdf.set_x(pdf.l_margin)
            pdf.cell(0, lh, piece, new_x=XPos.LMARGIN, new_y=YPos.NEXT)


def write_pdf(product: Product, rels: list[str], out_path: Path) -> dict[str, object]:
    text_files: list[tuple[str, Path]] = []
    bin_files: list[tuple[str, Path, int, str]] = []
    for rel in rels:
        path = ROOT / rel
        if is_text(path):
            text_files.append((rel, path))
        else:
            data = path.read_bytes()
            bin_files.append((rel, path, len(data), hashlib.sha256(data).hexdigest()))

    banner = f"{product.title_en} source — {AUTHOR_EN}"
    pdf = SourcePdf(banner, format="A4", unit="mm")
    pdf.set_auto_page_break(auto=True, margin=14)
    pdf.set_margins(12, 16, 12)
    pdf.add_font("Ui", fname=str(FONTS / "arial.ttf"))
    pdf.add_font("Code", fname=str(FONTS / "consola.ttf"))
    pdf.set_fallback_fonts(["Ui"])
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.set_xy(12, 20)
    pdf.set_font("Ui", size=16)
    add_paragraph(pdf, f"Complete source of {product.title_en}", 8)
    pdf.set_font("Ui", size=12)
    add_paragraph(pdf, product.title_ar, 6)
    pdf.ln(2)
    pdf.set_font("Ui", size=11)
    cover = (
        f"Work: {product.title_ar}\n"
        f"Author: {AUTHOR_EN}\n"
        f"Arabic legal name: {AUTHOR_AR}\n"
        f"Generated: {date.today().isoformat()}\n"
        f"Text source files: {len(text_files)}\n"
        f"Binary assets (SHA-256 listed, not rasterized): {len(bin_files)}\n"
        "SAIP portal format: one PDF, maximum 1024 MB.\n"
        "Scanned: no IBAN, secret keys, private PEM, or demo passwords.\n"
        "This packet is this work only. Cursor is a writing tool, not a co-author.\n"
        "GitHub handle ritchstar is not the legal author."
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
            print(f"  {product.slug}: wrote {i}/{len(text_files)}", flush=True)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(out_path))
    mb = out_path.stat().st_size / (1024 * 1024)
    if mb >= PORTAL_MAX_MB:
        raise SystemExit(f"{product.slug}: PDF {mb:.2f} MB exceeds {PORTAL_MAX_MB} MB")
    return {
        "slug": product.slug,
        "path": str(out_path.relative_to(ROOT)).replace("\\", "/"),
        "mb": round(mb, 2),
        "pages": pdf.pages_count,
        "text_files": len(text_files),
        "bin_files": len(bin_files),
        "under_safe_target": mb < SAFE_TARGET_MB,
    }


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Scan and pack SAIP product source PDFs")
    p.add_argument("--scan-only", action="store_true")
    p.add_argument("--product", action="append", default=[])
    return p.parse_args()


def main() -> None:
    os.chdir(ROOT)
    args = parse_args()
    wanted = set(args.product)
    products = [p for p in PRODUCTS if not wanted or p.slug in wanted]
    if wanted:
        missing = wanted - {p.slug for p in products}
        if missing:
            raise SystemExit("unknown product slug: " + ", ".join(sorted(missing)))

    tracked = git_tracked()
    report: dict[str, object] = {"generated": date.today().isoformat(), "products": []}
    all_hits: list[dict[str, str]] = []
    file_sets: dict[str, list[str]] = {}

    for product in products:
        rels = select_files(product, tracked)
        file_sets[product.slug] = rels
        hits: list[dict[str, str]] = []
        for rel in rels:
            path = ROOT / rel
            if not is_text(path):
                continue
            body = path.read_text(encoding="utf-8", errors="replace")
            hits.extend(scan_text(rel, body))
        entry = {
            "slug": product.slug,
            "title_ar": product.title_ar,
            "files": len(rels),
            "hits": hits,
        }
        report["products"].append(entry)  # type: ignore[union-attr]
        all_hits.extend(hits)
        print(f"SCAN {product.slug}: {len(rels)} files, {len(hits)} secret hits", flush=True)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    report_path = OUT_DIR / "scan-report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"report {report_path}", flush=True)

    if all_hits:
        print("BLOCKED: secret-like data in selected source", flush=True)
        for hit in all_hits:
            print(f"  {hit['rule']}: {hit['file']} (x{hit['count']})", flush=True)
        raise SystemExit(1)

    if args.scan_only:
        return

    summaries = []
    for product in products:
        out_path = OUT_DIR / product.slug / f"{product.slug}-saip-source.pdf"
        print(f"PDF {product.slug} -> {out_path.name}", flush=True)
        summaries.append(write_pdf(product, file_sets[product.slug], out_path))
        print(
            f"  size_mb {summaries[-1]['mb']} pages {summaries[-1]['pages']}",
            flush=True,
        )

    (OUT_DIR / "manifest.json").write_text(
        json.dumps({"generated": date.today().isoformat(), "pdfs": summaries}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
