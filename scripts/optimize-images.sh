#!/bin/bash
# Shrink shipped rasters, and prove we did not wreck them.
#
# The site shipped ~30 MB of PNGs; the eight Folio slides alone were 1.3-2.4 MB
# each on /folio/, which is the landing page for the app with the weakest search
# presence. Mobile LCP was 4.8s against 0.2s on desktop.
#
# Lossy compression is only safe if you check the result, so every file is
# compared against its original with a structural-similarity metric and reverted
# if the difference is visible. Idempotent: re-running on already-optimised
# files is a no-op.
#
# Usage:
#   bash scripts/optimize-images.sh            optimise everything over the size floor
#   bash scripts/optimize-images.sh --dry-run  report what would change, touch nothing

set -euo pipefail

MAX_DSSIM=0.02    # structural dissimilarity; 0 is identical, 0.02 ~ SSIM 0.98
SIZE_FLOOR_KB=300  # anything smaller is not worth the risk
DRY_RUN=0
if [ "${1:-}" = "--dry-run" ]; then DRY_RUN=1; fi

for tool in pngquant oxipng magick compare; do
  command -v "$tool" >/dev/null || { echo "missing required tool: $tool" >&2; exit 1; }
done

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

total_before=0
total_after=0
reverted=0
changed=0

while IFS= read -r f; do
  before=$(wc -c <"$f")
  tmp="$WORK/candidate.${f##*.}"
  cp "$f" "$tmp"

  case "$f" in
    *.png)
      # --skip-if-larger leaves the file alone when quantising would not help,
      # which is what makes a second run a no-op.
      pngquant --quality=82-98 --strip --skip-if-larger --force --output "$tmp" "$f" 2>/dev/null || cp "$f" "$tmp"
      oxipng -o 4 --strip safe --quiet "$tmp" 2>/dev/null || true
      ;;
    *.jpg|*.jpeg)
      magick "$f" -strip -sampling-factor 4:2:0 -quality 82 "$tmp"
      ;;
  esac

  after=$(wc -c <"$tmp")
  # Require a real saving, not a marginal one. Without this, a lossy format can
  # be re-encoded on every run for a 1% gain and quietly lose quality each time.
  worth=$(awk -v b="$before" -v a="$after" 'BEGIN{print (a < b * 0.95) ? 1 : 0}')
  if [ "$worth" -ne 1 ]; then
    printf '  skip    %-52s already optimal\n' "$f"
    total_before=$((total_before + before))
    total_after=$((total_after + before))
    continue
  fi

  # This ImageMagick build reports DSSIM for `-metric SSIM` (verified: identical
  # images give `0 (0)`), and prints `raw (normalised)` to stderr while exiting
  # non-zero for any difference. Under `set -o pipefail` that non-zero exit would
  # kill the script, hence the `|| true`. We read the normalised value in parens.
  metric=$({ compare -metric SSIM "$f" "$tmp" null: 2>&1 >/dev/null || true; })
  dssim=$(printf '%s' "$metric" | sed -n 's/.*(\([0-9.e-]*\)).*/\1/p')
  if [ -z "$dssim" ]; then
    printf '  REVERT  %-52s could not read a fidelity metric\n' "$f"
    reverted=$((reverted + 1))
    total_before=$((total_before + before))
    total_after=$((total_after + before))
    continue
  fi
  ok=$(awk -v d="$dssim" -v m="$MAX_DSSIM" 'BEGIN{print (d+0 <= m+0) ? 1 : 0}')

  if [ "$ok" -ne 1 ]; then
    # Lossy was too aggressive for this image (flat colour bands badly). Fall
    # back to lossless, which cannot change a pixel and so needs no fidelity
    # argument — it is usually still worth 5-15%.
    cp "$f" "$tmp"
    case "$f" in
      *.png) oxipng -o max --strip safe --quiet "$tmp" 2>/dev/null || true ;;
      *) cp "$f" "$tmp" ;;
    esac
    lossless=$(wc -c <"$tmp")
    lossless_worth=$(awk -v b="$before" -v a="$lossless" 'BEGIN{print (a < b * 0.95) ? 1 : 0}')
    if [ "$lossless_worth" -eq 1 ]; then
      pct=$(awk -v b="$before" -v a="$lossless" 'BEGIN{printf "%.0f", (1 - a/b) * 100}')
      printf '  lossless %-51s %6dKB -> %6dKB  (-%s%%)  DSSIM %s too high for lossy\n' \
        "$f" $((before / 1024)) $((lossless / 1024)) "$pct" "$dssim"
      if [ "$DRY_RUN" -eq 0 ]; then cp "$tmp" "$f"; fi
      changed=$((changed + 1))
      total_before=$((total_before + before))
      total_after=$((total_after + lossless))
    else
      printf '  REVERT  %-52s DSSIM %s worse than %s, lossless no help\n' "$f" "$dssim" "$MAX_DSSIM"
      reverted=$((reverted + 1))
      total_before=$((total_before + before))
      total_after=$((total_after + before))
    fi
    continue
  fi

  pct=$(awk -v b="$before" -v a="$after" 'BEGIN{printf "%.0f", (1 - a/b) * 100}')
  printf '  ok      %-52s %6dKB -> %6dKB  (-%s%%)  DSSIM %s\n' \
    "$f" $((before / 1024)) $((after / 1024)) "$pct" "$dssim"

  # `[ cond ] && cmd` would abort the whole script under `set -e` whenever the
  # condition is false, so this stays a full if.
  if [ "$DRY_RUN" -eq 0 ]; then cp "$tmp" "$f"; fi
  changed=$((changed + 1))
  total_before=$((total_before + before))
  total_after=$((total_after + after))
done < <(find . \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' \) \
           -not -path './node_modules/*' -not -path './.git/*' \
           -size +${SIZE_FLOOR_KB}k | sort)

echo
if [ "$DRY_RUN" -eq 1 ]; then echo "DRY RUN — nothing written."; fi
echo "images: ${changed} optimised · ${reverted} reverted for poor fidelity · $((total_before / 1024))KB -> $((total_after / 1024))KB"
