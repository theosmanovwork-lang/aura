#!/usr/bin/env bash
# Generates the 8 placeholder demo videos (own work, no third-party material).
# Needs ffmpeg with libx264 and the DejaVu Sans Bold font. Usage: bash scripts/make-demo-videos.sh
set -euo pipefail

OUT="$(dirname "$0")/../assets/demo"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
mkdir -p "$OUT"

# Pairs of gradient colours, one pair per video.
COLORS=(
  "0x8B5CF6 0x0E0B1A" "0x34D399 0x0E0B1A" "0xF472B6 0x1B1730" "0x60A5FA 0x0E0B1A"
  "0xFBBF24 0x1B1730" "0xA78BFA 0x0E0B1A" "0x2DD4BF 0x1B1730" "0xFB7185 0x0E0B1A"
)

for i in 1 2 3 4 5 6 7 8; do
  read -r c0 c1 <<<"${COLORS[$((i - 1))]}"
  ffmpeg -y -loglevel error \
    -f lavfi -i "gradients=s=540x960:d=4:r=24:c0=${c0}:c1=${c1}:x0=0:y0=0:x1=540:y1=960:speed=0.04" \
    -vf "drawtext=fontfile=${FONT}:text='Демо-ролик ${i}':fontcolor=white:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2" \
    -c:v libx264 -preset slow -crf 34 -pix_fmt yuv420p -movflags +faststart -an \
    "${OUT}/video-${i}.mp4"
done
