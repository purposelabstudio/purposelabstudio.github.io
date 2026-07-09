#!/usr/bin/env bash
# scripts/migrate-domain.sh <new-domain>   e.g. purposelab.studio
# Rewrites every absolute https://purposelabstudio.github.io URL in the SITE files
# (HTML/XML/TXT) to the new custom domain, and writes the GitHub Pages CNAME.
# Never touches docs/. Review `git diff` before committing.
set -euo pipefail
NEW="${1:?usage: migrate-domain.sh <new-domain>}"
OLD="purposelabstudio.github.io"

# macOS/BSD sed needs an explicit empty backup arg for -i.
if sed --version >/dev/null 2>&1; then SED_INPLACE=(-i); else SED_INPLACE=(-i ''); fi

grep -rl "$OLD" --include='*.html' --include='*.xml' --include='*.txt' . \
  | grep -v '/docs/' \
  | while IFS= read -r f; do
      sed "${SED_INPLACE[@]}" "s#https://$OLD#https://$NEW#g" "$f"
    done

printf '%s\n' "$NEW" > CNAME
echo "Rewrote https://$OLD -> https://$NEW and wrote CNAME ($NEW)."
echo "Next: review 'git diff', then update Search Console (Change of Address) + Bing + Play Store URLs."
