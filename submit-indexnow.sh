#!/bin/bash
# IndexNow Submission Script
# Run this after every deploy to instantly notify search engines of updated pages.
# Supported engines: Bing, Yandex, Naver, Seznam, Yep

INDEXNOW_KEY="f1f454b32a9646baba021f7af031df07"
HOST="purposelabstudio.github.io"
KEY_LOCATION="https://${HOST}/${INDEXNOW_KEY}.txt"

# All important URLs to submit
URLS=(
  "https://${HOST}/"
  "https://${HOST}/crumbs/"
  "https://${HOST}/folio/"
  "https://${HOST}/folio/diary/"
  "https://${HOST}/waterwise/"
  "https://${HOST}/bplog/"
  "https://${HOST}/hushly/"
  "https://${HOST}/about/"
  "https://${HOST}/support/"
  "https://${HOST}/blog/"
  "https://${HOST}/tools/"
  "https://${HOST}/tools/water-intake-calculator/"
  "https://${HOST}/tools/blood-pressure-checker/"
  "https://${HOST}/tools/journal-prompt-generator/"
  "https://${HOST}/blog/stop-messaging-yourself-on-whatsapp/"
  "https://${HOST}/blog/build-a-second-brain-on-whatsapp/"
  "https://${HOST}/blog/why-journaling-fails-and-how-to-stick-with-it/"
  "https://${HOST}/blog/daily-journal-vs-mood-tracker-why-you-need-both/"
  "https://${HOST}/blog/why-water-apps-are-full-of-ads/"
  "https://${HOST}/blog/how-much-water-should-i-drink-daily/"
  "https://${HOST}/blog/how-to-track-blood-pressure-at-home/"
  "https://${HOST}/blog/white-noise-baby-sleep-science/"
  "https://${HOST}/blog/normal-blood-pressure-by-age/"
  "https://${HOST}/blog/how-to-lower-blood-pressure-naturally/"
  "https://${HOST}/blog/baby-wont-sleep-through-night/"
)

# Build JSON payload
URL_LIST=""
for url in "${URLS[@]}"; do
  URL_LIST="${URL_LIST}\"${url}\","
done
URL_LIST="${URL_LIST%,}"  # Remove trailing comma

PAYLOAD="{
  \"host\": \"${HOST}\",
  \"key\": \"${INDEXNOW_KEY}\",
  \"keyLocation\": \"${KEY_LOCATION}\",
  \"urlList\": [${URL_LIST}]
}"

echo "🔄 Submitting ${#URLS[@]} URLs to IndexNow..."
echo ""

# Submit to IndexNow (Bing endpoint — shared with Yandex, Naver, Seznam)
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  "https://api.indexnow.org/IndexNow" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}")

if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "202" ]; then
  echo "✅ IndexNow submission successful (HTTP ${RESPONSE})"
  echo "   Bing, Yandex, Naver, Seznam notified."
else
  echo "⚠️  IndexNow returned HTTP ${RESPONSE}"
  echo "   Common codes: 200=OK, 202=Accepted, 422=Invalid URL, 429=Rate limited"
fi

echo ""
echo "📋 Next steps:"
echo "   1. Google: Submit sitemap at https://search.google.com/search-console"
echo "   2. Bing: Verify site at https://www.bing.com/webmasters"
echo "   3. Run this script after every deploy for instant indexing"
