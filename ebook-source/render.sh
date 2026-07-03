#!/usr/bin/env bash
# Render an HTML file to PDF via headless Chromium, then rasterize pages to PNG for inspection.
set -e
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
DIR="$(cd "$(dirname "$0")" && pwd)"
IN="${1:-index.html}"
OUT="${2:-ebook.pdf}"
"$CHROME" --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf-no-header --print-to-pdf="$DIR/$OUT" \
  --run-all-compositor-stages-before-draw --virtual-time-budget=8000 \
  "file://$DIR/$IN" 2>/dev/null
echo "PDF: $DIR/$OUT"
python3 - "$DIR/$OUT" << 'PY'
import sys,fitz
d=fitz.open(sys.argv[1]); print("pages:",d.page_count,"size:",[round(x) for x in d[0].rect[2:]])
PY
