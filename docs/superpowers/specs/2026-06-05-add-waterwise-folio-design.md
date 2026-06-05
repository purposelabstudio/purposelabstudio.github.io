# Website Update: Add WaterWise and Folio Apps

**Date:** 2026-06-05  
**Status:** Approved for implementation

## Overview

Add WaterWise and Folio to the PurposeLab Studio website (purposelabstudio.github.io), matching the existing structure of BP Log and Hushly, while optimizing for fast app discovery on the homepage.

## Goals

1. Showcase all 4 apps on homepage without scrolling (fast discovery)
2. Create dedicated landing pages for WaterWise and Folio
3. Update Hushly screenshots with latest Play Store assets
4. Maintain visual consistency across all app pages
5. Update navigation and sitemap for SEO

## Repository Structure

### New Pages
```
purposelabstudio.github.io/
├── folio/
│   ├── index.html (new)
│   └── screenshots/
│       ├── 01-your-private-daily-journal.png
│       ├── 02-write-one-line-or-a-whole-page.png
│       ├── 03-notice-patterns-not-scores.png
│       ├── 04-keep-tiny-habits-beside-your-words.png
│       ├── 05-gentle-reminders-never-pressure.png
│       ├── 06-your-month-softly-reflected.png
│       ├── 07-make-your-notebook-feel-like-yours.png
│       └── 08-locked-and-backed-up.png
│
├── waterwise/
│   ├── index.html (new)
│   └── screenshots/
│       ├── 01-stay-hydrated.png
│       ├── 02-one-tap-tracking.png
│       ├── 03-see-your-rhythm.png
│       ├── 04-quiet-reminders.png
│       ├── 05-set-your-goal.png
│       ├── 06-choose-gentle-alerts.png
│       ├── 07-widget-at-a-glance.png
│       └── 08-pick-your-sound.png
```

### Screenshot Sources
- **Folio:** `/Users/atul/Desktop/PurposeLab/flutter/folio/ss/output/play-phone/` (8 images)
- **WaterWise:** `/Users/atul/Desktop/PurposeLab/waterwise/playstore-ss/output/play-phone/` (8 images)
- **Hushly (update):** `/Users/atul/Desktop/PurposeLab/hushly/store-listing/output/play-phone/` (7 images)

### Updated Files
- `index.html` (add Folio and WaterWise cards, reorder to showcase newest first)
- `sitemap.xml` (add /folio/ and /waterwise/)
- `hushly/index.html` (update screenshot count and file references)
- Navigation on all pages: `index.html`, `about/index.html`, `blog/index.html`, `support/index.html`, `bplog/index.html`, `hushly/index.html`

## Homepage Design

### App Cards Layout

**Desktop:** 2×2 grid  
**Mobile:** Single column stack

**Ordering (newest first):**
1. Folio 📖 (top-left)
2. WaterWise 💧 (top-right)
3. BP Log ❤️‍🩹 (bottom-left)
4. Hushly 🌙 (bottom-right)

### Card Structure (each app)
```html
<div class="app-card">
    <div class="app-icon">[emoji]</div>
    <div class="app-info">
        <div class="app-name">[App Name] — [Tagline]</div>
        <div class="app-desc">[One sentence pitch, 15-20 words]</div>
        <div class="app-badges">
            [3-4 badge spans]
        </div>
        <div class="app-links">
            <a href="/[app]/">Learn More</a>
            <a href="[play-store-url]">Google Play</a>
            <a href="[privacy-policy-url]">Privacy Policy</a>
        </div>
    </div>
</div>
```

### Folio Homepage Card
- **Icon:** 📖
- **Name:** Folio — Daily Journal & Mood
- **Description:** A quiet notebook for closing the day. Write a little or a lot, track moods & habits, reflect monthly.
- **Badges:** Free, No Ads, Private & Offline, App Lock
- **Play Store:** https://play.google.com/store/apps/details?id=com.purposelab.folio (closed testing)
- **Privacy:** https://purposelabstudio.github.io/privacy-policies/folio.html

### WaterWise Homepage Card
- **Icon:** 💧
- **Name:** WaterWise — Drink Water Reminder
- **Description:** Stay hydrated with no ads. Simple water tracker with streaks, smart reminders, and one-tap logging.
- **Badges:** Free, No Ads, Offline, No Paywall
- **Play Store:** https://play.google.com/store/apps/details?id=com.purposelab.waterwise (closed testing)
- **Privacy:** https://purposelabstudio.github.io/privacy-policies/waterwise.html

## Navigation Design

### Updated Navigation (all pages)
```html
<nav class="nav">
    <a href="/" class="nav-brand">PurposeLab Studio</a>
    <ul class="nav-links">
        <li><a href="/folio/">Folio</a></li>
        <li><a href="/waterwise/">WaterWise</a></li>
        <li><a href="/bplog/">BP Log</a></li>
        <li><a href="/hushly/">Hushly</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/about/">About</a></li>
        <li><a href="/support/">Support</a></li>
    </ul>
</nav>
```

**Ordering rationale:** Newest apps first (Folio, WaterWise), then established apps (BP Log, Hushly), then utility pages.

## Folio App Page

### Hero Section
- **Title:** 📖 Folio — Daily Journal & Mood
- **Subtitle:** A quiet notebook for closing the day. Write a little or a lot, track moods & habits, reflect monthly.
- **Badges:** Free | Zero Ads | Private & Offline | App Lock
- **CTA:** "▶ Get it on Google Play" → https://play.google.com/store/apps/details?id=com.purposelab.folio

### Screenshots Section
8 images displayed in responsive grid:
1. Your Private Daily Journal
2. Write One Line or a Whole Page
3. Notice Patterns, Not Scores
4. Keep Tiny Habits Beside Your Words
5. Gentle Reminders, Never Pressure
6. Your Month, Softly Reflected
7. Make Your Notebook Feel Like Yours
8. Locked and Backed Up

### Features Section (grid layout)

**Feature 1: Your Private Daily Journal**
- Icon: 📖
- Headline: Your Private Daily Journal
- Description: Write about your day in a beautiful paper-notebook design. Quick daily pages for tired nights, Focus mode for when you want to write more.

**Feature 2: Flexible Writing**
- Icon: ✍️
- Headline: Write One Line or a Whole Page
- Description: Some days need just a sentence. Some days need space. Tap Focus to open a calm full-screen writing mode with custom fonts and paper textures.

**Feature 3: Gentle Mood & Habit Tracking**
- Icon: 🪞
- Headline: Notice Patterns, Not Scores
- Description: Track your moods and daily habits without streak pressure. See monthly patterns in a calm grid — how your days flow together, not how you measure up.

**Feature 4: Habit Marks**
- Icon: ✓
- Headline: Keep Tiny Habits Beside Your Words
- Description: Mark the small things that made the day count — workout, reading, meditation, skincare. No guilt, no streaks, just honest marks.

**Feature 5: Daily Reminders**
- Icon: 🌙
- Headline: Gentle Reminders, Never Pressure
- Description: A daily nudge at the time you choose. Not pushy — just a quiet "ready to write?" to help you build the habit.

**Feature 6: Monthly Reflection**
- Icon: 📊
- Headline: Your Month, Softly Reflected
- Description: See your month's journey — pages written, mood patterns, best days, and the moments that stood out. Set a theme for the month as a quiet intention.

**Feature 7: Customization**
- Icon: 🎨
- Headline: Make Your Notebook Feel Like Yours
- Description: 5 color palettes, 6 paper textures, handwriting-style fonts, dark mode. Your journal looks like yours.

**Feature 8: Privacy & Backup**
- Icon: 🔒
- Headline: Locked and Backed Up
- Description: Protected by fingerprint or face unlock. Optional encrypted Google Drive backup. Export to PDF anytime. Your words stay private.

### Footer CTA
- Headline: Start Your Quiet Journaling Habit Tonight
- Subtext: Free to download. No ads. No subscriptions. Just a beautiful notebook for closing the day.
- Button: "▶ Download Folio"

### Footer Links
- Privacy Policy: https://purposelabstudio.github.io/privacy-policies/folio.html
- Support: /support/
- About: /about/

## WaterWise App Page

### Hero Section
- **Title:** 💧 WaterWise — Drink Water Reminder
- **Subtitle:** Stay hydrated with no ads. Simple water tracker with streaks, smart reminders, and one-tap logging.
- **Badges:** Free | Zero Ads | Offline | No Paywall
- **CTA:** "▶ Get it on Google Play" → https://play.google.com/store/apps/details?id=com.purposelab.waterwise

### Screenshots Section
8 images displayed in responsive grid:
1. Stay Hydrated
2. One-Tap Tracking
3. See Your Rhythm
4. Quiet Reminders
5. Set Your Goal
6. Choose Gentle Alerts
7. Widget at a Glance
8. Pick Your Sound

### Features Section (grid layout)

**Feature 1: No Ads, Ever**
- Icon: 🚫
- Headline: Stay Hydrated — No Ads
- Description: Tired of water apps that show ads every time you log a glass? WaterWise has zero ads on the logging screen. No banner at the bottom. No tricks.

**Feature 2: One-Tap Logging**
- Icon: 💧
- Headline: One-Tap Tracking
- Description: Tap a cup size and you're done. 150ml, 250ml, 350ml, 500ml — or set custom sizes. Log water in under 1 second, right from your home screen widget.

**Feature 3: Progress Tracking**
- Icon: 📊
- Headline: See Your Rhythm
- Description: Beautiful progress ring shows how close you are to your daily goal. Clean daily and weekly charts. Watch your streak grow day by day.

**Feature 4: Smart Reminders**
- Icon: ⏰
- Headline: Quiet Reminders
- Description: Gentle reminders throughout the day with rotating motivational messages. Reminders auto-dismiss when you log water. Mute during sleep hours.

**Feature 5: Personalized Goal**
- Icon: 🎯
- Headline: Set Your Goal
- Description: Enter your weight and WaterWise calculates your optimal daily water intake. Or set your own goal manually. Switch between ml and oz anytime.

**Feature 6: Customization**
- Icon: 🎨
- Headline: Choose Gentle Alerts
- Description: Set your reminder schedule, adjust the interval, pick custom notification sounds. Dark mode included — and yes, it's free. Not behind a paywall.

**Feature 7: Home Screen Widget**
- Icon: 📱
- Headline: Widget at a Glance
- Description: See your daily progress without even opening the app. The widget shows how much you've had and how far you are from your goal.

**Feature 8: Battery Optimized**
- Icon: 🔋
- Headline: Pick Your Sound
- Description: Smart handling of battery optimization on Samsung, Xiaomi, OnePlus, and other Android phones. Your reminders always work.

### Footer CTA
- Headline: Stay Hydrated Starting Today
- Subtext: Free to download. No ads. No subscriptions. No paywall. Just hydration.
- Button: "▶ Download WaterWise"

### Footer Links
- Privacy Policy: https://purposelabstudio.github.io/privacy-policies/waterwise.html
- Support: /support/
- About: /about/

## Hushly Screenshot Update

### Changes
- Replace 8 existing screenshot files with 7 new ones
- Update HTML to reference 7 screenshots (not 8)
- Keep all other content unchanged

### New Screenshot Files
1. 01-your-baby-sleeps-you-rest.png
2. 02-27-soothing-sounds.png
3. 03-record-your-voice.png
4. 04-fade-out-softly.png
5. 05-hush-mode-softer-nights.png
6. 06-control-from-lock-screen.png
7. 07-10-calm-themes.png

### HTML Update
Change from:
```html
<img src="screenshots/hushly-screenshot-1.png" ... >
<img src="screenshots/hushly-screenshot-2.png" ... >
... (8 total)
```

To:
```html
<img src="screenshots/01-your-baby-sleeps-you-rest.png" ... >
<img src="screenshots/02-27-soothing-sounds.png" ... >
... (7 total)
```

## Sitemap Update

Add to `sitemap.xml`:
```xml
<url>
    <loc>https://purposelabstudio.github.io/folio/</loc>
    <lastmod>2026-06-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
</url>
<url>
    <loc>https://purposelabstudio.github.io/waterwise/</loc>
    <lastmod>2026-06-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
</url>
```

## CSS Classes (Existing)

All pages use existing CSS from `style.css`. No new CSS needed.

### Existing Classes Used
- `.container` - main page wrapper
- `.nav`, `.nav-brand`, `.nav-links` - navigation
- `.hero` - hero section
- `.subtitle` - hero subtitle
- `.badges` - badge container
- `.badge`, `.badge-free`, `.badge-noad`, `.badge-offline`, `.badge-privacy` - individual badges
- `.btn`, `.btn-primary` - CTA buttons
- `.section`, `.section-title` - content sections
- `.screenshots` - screenshot grid (responsive)
- `.features`, `.feature`, `.feature-icon` - features grid
- `.cta` - footer CTA section
- `.footer`, `.footer-links` - footer
- `.app-card`, `.app-icon`, `.app-info`, `.app-name`, `.app-desc`, `.app-badges`, `.app-links` - homepage app cards

## Implementation Checklist

### Phase 1: Copy Screenshots (file operations)
- [ ] Copy 8 Folio screenshots from `/Users/atul/Desktop/PurposeLab/flutter/folio/ss/output/play-phone/` to `/tmp/website-repo/folio/screenshots/`
- [ ] Copy 8 WaterWise screenshots from `/Users/atul/Desktop/PurposeLab/waterwise/playstore-ss/output/play-phone/` to `/tmp/website-repo/waterwise/screenshots/`
- [ ] Copy 7 Hushly screenshots from `/Users/atul/Desktop/PurposeLab/hushly/store-listing/output/play-phone/` to `/tmp/website-repo/hushly/screenshots/` (overwrite existing)

### Phase 2: Create New App Pages (HTML)
- [ ] Create `/tmp/website-repo/folio/index.html` (based on bplog structure, Folio content)
- [ ] Create `/tmp/website-repo/waterwise/index.html` (based on bplog structure, WaterWise content)

### Phase 3: Update Homepage
- [ ] Update `/tmp/website-repo/index.html`:
  - Add Folio app card
  - Add WaterWise app card
  - Reorder cards (Folio, WaterWise, BP Log, Hushly)

### Phase 4: Update Navigation (all pages)
- [ ] Update nav in `/tmp/website-repo/index.html`
- [ ] Update nav in `/tmp/website-repo/bplog/index.html`
- [ ] Update nav in `/tmp/website-repo/hushly/index.html`
- [ ] Update nav in `/tmp/website-repo/about/index.html`
- [ ] Update nav in `/tmp/website-repo/blog/index.html`
- [ ] Update nav in `/tmp/website-repo/support/index.html`

### Phase 5: Update Hushly Screenshots
- [ ] Update `/tmp/website-repo/hushly/index.html` screenshot references (8 → 7)

### Phase 6: Update Sitemap
- [ ] Update `/tmp/website-repo/sitemap.xml` (add Folio and WaterWise URLs)

### Phase 7: Commit and Push
- [ ] Commit all changes to git
- [ ] Push to GitHub (auto-deploys via GitHub Pages)

## Testing Checklist

### Visual Testing
- [ ] Homepage: All 4 apps visible on desktop without scrolling
- [ ] Homepage: App cards stack properly on mobile
- [ ] Navigation: All links work on all pages
- [ ] Folio page: All 8 screenshots load correctly
- [ ] WaterWise page: All 8 screenshots load correctly
- [ ] Hushly page: All 7 new screenshots load correctly

### Responsive Testing
- [ ] Desktop (1440px): 2×2 app grid on homepage
- [ ] Tablet (768px): Single column stack
- [ ] Mobile (375px): Single column stack, readable text

### Link Testing
- [ ] All Play Store links work (closed testing)
- [ ] All privacy policy links work
- [ ] All inter-page navigation works
- [ ] Sitemap validates

### SEO Validation
- [ ] Folio page has proper title, description meta tags
- [ ] WaterWise page has proper title, description meta tags
- [ ] Sitemap includes new URLs
- [ ] robots.txt allows indexing

## Success Criteria

1. ✅ All 4 apps visible on homepage without scrolling (desktop)
2. ✅ Folio and WaterWise have full dedicated pages matching BP Log/Hushly quality
3. ✅ Hushly screenshots updated to latest Play Store assets
4. ✅ Navigation consistent across all pages
5. ✅ All screenshots load correctly
6. ✅ Mobile responsive on all pages
7. ✅ Sitemap updated for SEO
8. ✅ Changes committed and pushed to GitHub

## Notes

- All apps are currently in closed testing on Google Play
- Privacy policy URLs assume they already exist or will be created separately
- Screenshot alt text should be descriptive for accessibility
- All Play Store links should include `id=com.purposelab.[appname]` package format
- Maintain consistent tone: Folio is "warm/calm," WaterWise is "direct/anti-bloat"
