#!/usr/bin/env python3
"""Audit React source for English UI copy that is not in the Arabic dictionary."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
TRANSLATIONS = SRC / "utils" / "translate.ts"

JSX_TEXT = re.compile(r">\s*([^<>{}\n]*[A-Za-z][^<>{}\n]*)\s*<")
ATTRIBUTE_TEXT = re.compile(
    r"""(?:placeholder|title|aria-label)=["']([^"']*[A-Za-z][^"']*)["']"""
)
QUOTED_UI_FIELD = re.compile(
    r"""(?:title|description|eyebrow|label|heading|copy|placeholder)\s*:\s*["']([^"']*[A-Za-z][^"']*)["']"""
)
DICTIONARY_KEY = re.compile(r"""^\s*,?["']([^"']+)["']\s*:""", re.MULTILINE)

SKIP_PARTS = {
    "components/ui",
    "components/ArabicLocalizer.tsx",
    "pages/Home.tsx",
    # The protected CMS uses the batched runtime translator because much of its
    # copy and saved content is supplied dynamically by the API.
    "pages/AdminDashboard.tsx",
    "pages/AdminLogin.tsx",
}
IGNORE = re.compile(
    r"^(?:T24|EN|AR|AED|USD|Rolex|Patek|Audemars|Richard|Hublot|Cartier|"
    r"Vacheron|Omega|IWC|Breitling|Chopard|TAG|GQ|https?://|/)"
)


def source_files() -> list[Path]:
    return [
        path
        for path in SRC.rglob("*.tsx")
        if not any(part in path.as_posix() for part in SKIP_PARTS)
    ]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="exit non-zero when untranslated copy is found")
    args = parser.parse_args()

    dictionary = set(DICTIONARY_KEY.findall(TRANSLATIONS.read_text(encoding="utf-8")))
    findings: list[tuple[str, int, str]] = []

    for path in source_files():
        content = path.read_text(encoding="utf-8")
        for pattern in (JSX_TEXT, ATTRIBUTE_TEXT, QUOTED_UI_FIELD):
            for match in pattern.finditer(content):
                value = " ".join(match.group(1).split())
                value = (
                    value.replace("&nbsp;", " ")
                    .replace("&rarr;", "→")
                    .replace("&larr;", "←")
                )
                value = " ".join(value.split())
                if "&&" in value or "? (" in value or value in {"→", "←"}:
                    continue
                if not value or value in dictionary or IGNORE.search(value):
                    continue
                line = content.count("\n", 0, match.start()) + 1
                findings.append((str(path.relative_to(ROOT)), line, value))

    unique = sorted(set(findings))
    if unique:
        print("Potential untranslated Arabic UI copy:")
        for filename, line, value in unique:
            print(f"{filename}:{line}: {value}")
    else:
        print("Arabic UI audit passed: no unmatched static interface copy found.")

    return 1 if args.check and unique else 0


if __name__ == "__main__":
    raise SystemExit(main())
