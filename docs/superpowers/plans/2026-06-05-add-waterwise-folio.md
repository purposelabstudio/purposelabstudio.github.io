# Add WaterWise and Folio to Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add WaterWise and Folio app pages to purposelabstudio.github.io with updated homepage and navigation

**Architecture:** Create two new app page directories matching existing BP Log/Hushly structure, update homepage to show all 4 apps in 2×2 grid, update navigation across all pages, refresh Hushly screenshots with latest assets

**Tech Stack:** HTML5, CSS (existing style.css), static GitHub Pages

---

## File Structure Overview

### New Files
```
/tmp/website-repo/
├── folio/
│   ├── index.html (new - 350 lines)
│   └── screenshots/ (new directory)
│       └── [8 PNG files copied from source]
├── waterwise/
│   ├── index.html (new - 330 lines)
│   └── screenshots/ (new directory)
│       └── [8 PNG files copied from source]
```

### Modified Files
```
/tmp/website-repo/
├── index.html (modify - add 2 app cards, update nav)
├── bplog/index.html (modify - update nav only)
├── hushly/
│   ├── index.html (modify - update nav, update screenshot references)
│   └── screenshots/ (7 files overwritten)
├── about/index.html (modify - update nav only)
├── blog/index.html (modify - update nav only)
├── support/index.html (modify - update nav only)
└── sitemap.xml (modify - add 2 URLs)
```

### Source Directories (read-only)
- Folio screenshots: `/Users/atul/Desktop/PurposeLab/flutter/folio/ss/output/play-phone/`
- WaterWise screenshots: `/Users/atul/Desktop/PurposeLab/waterwise/playstore-ss/output/play-phone/`
- Hushly screenshots: `/Users/atul/Desktop/PurposeLab/hushly/store-listing/output/play-phone/`

---

## Task 1: Copy Folio Screenshots

**Files:**
- Create directory: `/tmp/website-repo/folio/screenshots/`
- Copy 8 files from source to destination

- [ ] **Step 1: Create folio screenshots directory**

```bash
mkdir -p /tmp/website-repo/folio/screenshots
```

Expected: Directory created, no output

- [ ] **Step 2: Copy Folio screenshot files**

```bash
cp /Users/atul/Desktop/PurposeLab/flutter/folio/ss/output/play-phone/01-your-private-daily-journal.png /tmp/website-repo/folio/screenshots/
cp /Users/atul/Desktop/PurposeLab/flutter/folio/ss/output/play-phone/02-write-one-line-or-a-whole-page.png /tmp/website-repo/folio/screenshots/
cp /Users/atul/Desktop/PurposeLab/flutter/folio/ss/output/play-phone/03-notice-patterns-not-scores.png /tmp/website-repo/folio/screenshots/
cp /Users/atul/Desktop/PurposeLab/flutter/folio/ss/output/play-phone/04-keep-tiny-habits-beside-your-words.png /tmp/website-repo/folio/screenshots/
cp /Users/atul/Desktop/PurposeLab/flutter/folio/ss/output/play-phone/05-gentle-reminders-never-pressure.png /tmp/website-repo/folio/screenshots/
cp /Users/atul/Desktop/PurposeLab/flutter/folio/ss/output/play-phone/06-your-month-softly-reflected.png /tmp/website-repo/folio/screenshots/
cp /Users/atul/Desktop/PurposeLab/flutter/folio/ss/output/play-phone/07-make-your-notebook-feel-like-yours.png /tmp/website-repo/folio/screenshots/
cp /Users/atul/Desktop/PurposeLab/flutter/folio/ss/output/play-phone/08-locked-and-backed-up.png /tmp/website-repo/folio/screenshots/
```

Expected: 8 files copied, no output

- [ ] **Step 3: Verify files copied**

```bash
ls -la /tmp/website-repo/folio/screenshots/
```

Expected: 8 PNG files listed (01-your-private-daily-journal.png through 08-locked-and-backed-up.png)

- [ ] **Step 4: Commit Folio screenshots**

```bash
cd /tmp/website-repo
git add folio/screenshots/
git commit -m "Add Folio app screenshots"
```

Expected: "8 files changed" in commit output

---

## Task 2: Copy WaterWise Screenshots

**Files:**
- Create directory: `/tmp/website-repo/waterwise/screenshots/`
- Copy 8 files from source to destination

- [ ] **Step 1: Create waterwise screenshots directory**

```bash
mkdir -p /tmp/website-repo/waterwise/screenshots
```

Expected: Directory created, no output

- [ ] **Step 2: Copy WaterWise screenshot files**

```bash
cp /Users/atul/Desktop/PurposeLab/waterwise/playstore-ss/output/play-phone/01-stay-hydrated.png /tmp/website-repo/waterwise/screenshots/
cp /Users/atul/Desktop/PurposeLab/waterwise/playstore-ss/output/play-phone/02-one-tap-tracking.png /tmp/website-repo/waterwise/screenshots/
cp /Users/atul/Desktop/PurposeLab/waterwise/playstore-ss/output/play-phone/03-see-your-rhythm.png /tmp/website-repo/waterwise/screenshots/
cp /Users/atul/Desktop/PurposeLab/waterwise/playstore-ss/output/play-phone/04-quiet-reminders.png /tmp/website-repo/waterwise/screenshots/
cp /Users/atul/Desktop/PurposeLab/waterwise/playstore-ss/output/play-phone/05-set-your-goal.png /tmp/website-repo/waterwise/screenshots/
cp /Users/atul/Desktop/PurposeLab/waterwise/playstore-ss/output/play-phone/06-choose-gentle-alerts.png /tmp/website-repo/waterwise/screenshots/
cp /Users/atul/Desktop/PurposeLab/waterwise/playstore-ss/output/play-phone/07-widget-at-a-glance.png /tmp/website-repo/waterwise/screenshots/
cp /Users/atul/Desktop/PurposeLab/waterwise/playstore-ss/output/play-phone/08-pick-your-sound.png /tmp/website-repo/waterwise/screenshots/
```

Expected: 8 files copied, no output

- [ ] **Step 3: Verify files copied**

```bash
ls -la /tmp/website-repo/waterwise/screenshots/
```

Expected: 8 PNG files listed (01-stay-hydrated.png through 08-pick-your-sound.png)

- [ ] **Step 4: Commit WaterWise screenshots**

```bash
cd /tmp/website-repo
git add waterwise/screenshots/
git commit -m "Add WaterWise app screenshots"
```

Expected: "8 files changed" in commit output

---

## Task 3: Update Hushly Screenshots

**Files:**
- Overwrite 7 files in: `/tmp/website-repo/hushly/screenshots/`
- Delete 1 old file: `hushly-screenshot-8.png`

- [ ] **Step 1: Remove old Hushly screenshots**

```bash
rm /tmp/website-repo/hushly/screenshots/*.png
```

Expected: 8 old files deleted, no output

- [ ] **Step 2: Copy new Hushly screenshot files**

```bash
cp /Users/atul/Desktop/PurposeLab/hushly/store-listing/output/play-phone/01-your-baby-sleeps-you-rest.png /tmp/website-repo/hushly/screenshots/
cp /Users/atul/Desktop/PurposeLab/hushly/store-listing/output/play-phone/02-27-soothing-sounds.png /tmp/website-repo/hushly/screenshots/
cp /Users/atul/Desktop/PurposeLab/hushly/store-listing/output/play-phone/03-record-your-voice.png /tmp/website-repo/hushly/screenshots/
cp /Users/atul/Desktop/PurposeLab/hushly/store-listing/output/play-phone/04-fade-out-softly.png /tmp/website-repo/hushly/screenshots/
cp /Users/atul/Desktop/PurposeLab/hushly/store-listing/output/play-phone/05-hush-mode-softer-nights.png /tmp/website-repo/hushly/screenshots/
cp /Users/atul/Desktop/PurposeLab/hushly/store-listing/output/play-phone/06-control-from-lock-screen.png /tmp/website-repo/hushly/screenshots/
cp /Users/atul/Desktop/PurposeLab/hushly/store-listing/output/play-phone/07-10-calm-themes.png /tmp/website-repo/hushly/screenshots/
```

Expected: 7 files copied, no output

- [ ] **Step 3: Verify new files**

```bash
ls -la /tmp/website-repo/hushly/screenshots/
```

Expected: 7 PNG files listed (01-your-baby-sleeps-you-rest.png through 07-10-calm-themes.png)

- [ ] **Step 4: Commit Hushly screenshot update**

```bash
cd /tmp/website-repo
git add hushly/screenshots/
git commit -m "Update Hushly screenshots to latest Play Store assets"
```

Expected: "7 files changed" in commit output

---

## Task 4: Create Folio App Page

**Files:**
- Create: `/tmp/website-repo/folio/index.html`

- [ ] **Step 1: Create Folio index.html**

Create file at `/tmp/website-repo/folio/index.html` with this complete content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Folio — Daily Journal & Mood Tracker for Android</title>
    <meta name="description" content="A quiet notebook for closing the day. Write a little or a lot, track moods & habits, reflect monthly. Beautiful daily journal app. Free, no ads, private & offline.">
    <meta name="keywords" content="daily journal, journal app, mood tracker, habit tracker, diary app, private journal, gratitude journal, focus writing, aesthetic journal, app lock">
    <link rel="stylesheet" href="../style.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📖</text></svg>">
</head>
<body>
    <div class="container">

        <nav class="nav">
            <a href="/" class="nav-brand">PurposeLab Studio</a>
            <ul class="nav-links">
                <li><a href="/folio/" class="active">Folio</a></li>
                <li><a href="/waterwise/">WaterWise</a></li>
                <li><a href="/bplog/">BP Log</a></li>
                <li><a href="/hushly/">Hushly</a></li>
                <li><a href="/blog/">Blog</a></li>
                <li><a href="/about/">About</a></li>
                <li><a href="/support/">Support</a></li>
            </ul>
        </nav>

        <section class="hero">
            <h1>📖 Folio — Daily Journal & Mood</h1>
            <p class="subtitle">
                A quiet notebook for closing the day. Write a little or a lot, track moods & habits, reflect monthly.
            </p>
            <div class="badges">
                <span class="badge badge-free">Free</span>
                <span class="badge badge-noad">Zero Ads</span>
                <span class="badge badge-offline">Private & Offline</span>
                <span class="badge badge-privacy">App Lock</span>
            </div>
            <div style="margin-top: 28px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <a href="https://play.google.com/store/apps/details?id=com.purposelab.folio" class="btn btn-primary">
                    ▶ Get it on Google Play
                </a>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Screenshots</h2>
            <div class="screenshots">
                <img src="screenshots/01-your-private-daily-journal.png" alt="Folio daily journal page with mood and habit tracking" loading="lazy">
                <img src="screenshots/02-write-one-line-or-a-whole-page.png" alt="Focus writing mode for longer journal entries" loading="lazy">
                <img src="screenshots/03-notice-patterns-not-scores.png" alt="Monthly mood patterns and habit tracking" loading="lazy">
                <img src="screenshots/04-keep-tiny-habits-beside-your-words.png" alt="Daily habit marks without streak pressure" loading="lazy">
                <img src="screenshots/05-gentle-reminders-never-pressure.png" alt="Daily reminder notifications" loading="lazy">
                <img src="screenshots/06-your-month-softly-reflected.png" alt="Monthly reflection and theme setting" loading="lazy">
                <img src="screenshots/07-make-your-notebook-feel-like-yours.png" alt="Customization with themes and fonts" loading="lazy">
                <img src="screenshots/08-locked-and-backed-up.png" alt="App lock and Google Drive backup" loading="lazy">
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Why People Love Folio</h2>
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">📖</div>
                    <h3>Your Private Daily Journal</h3>
                    <p>Write about your day in a beautiful paper-notebook design. Quick daily pages for tired nights, Focus mode for when you want to write more.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">✍️</div>
                    <h3>Write One Line or a Whole Page</h3>
                    <p>Some days need just a sentence. Some days need space. Tap Focus to open a calm full-screen writing mode with custom fonts and paper textures.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🪞</div>
                    <h3>Notice Patterns, Not Scores</h3>
                    <p>Track your moods and daily habits without streak pressure. See monthly patterns in a calm grid — how your days flow together, not how you measure up.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">✓</div>
                    <h3>Keep Tiny Habits Beside Your Words</h3>
                    <p>Mark the small things that made the day count — workout, reading, meditation, skincare. No guilt, no streaks, just honest marks.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🌙</div>
                    <h3>Gentle Reminders, Never Pressure</h3>
                    <p>A daily nudge at the time you choose. Not pushy — just a quiet "ready to write?" to help you build the habit.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">📊</div>
                    <h3>Your Month, Softly Reflected</h3>
                    <p>See your month's journey — pages written, mood patterns, best days, and the moments that stood out. Set a theme for the month as a quiet intention.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🎨</div>
                    <h3>Make Your Notebook Feel Like Yours</h3>
                    <p>5 color palettes, 6 paper textures, handwriting-style fonts, dark mode. Your journal looks like yours.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🔒</div>
                    <h3>Locked and Backed Up</h3>
                    <p>Protected by fingerprint or face unlock. Optional encrypted Google Drive backup. Export to PDF anytime. Your words stay private.</p>
                </div>
            </div>
        </section>

        <section class="cta">
            <h2>Start Your Quiet Journaling Habit Tonight</h2>
            <p>Free to download. No ads. No subscriptions. Just a beautiful notebook for closing the day.</p>
            <a href="https://play.google.com/store/apps/details?id=com.purposelab.folio" class="btn btn-primary">
                ▶ Download Folio
            </a>
        </section>

        <footer class="footer">
            <p>&copy; 2025 PurposeLab Studio. All rights reserved.</p>
            <div class="footer-links">
                <a href="https://purposelabstudio.github.io/privacy-policies/folio.html">Privacy Policy</a>
                <a href="/support/">Support</a>
                <a href="/about/">About</a>
            </div>
        </footer>

    </div>
</body>
</html>
```

- [ ] **Step 2: Verify file created**

```bash
ls -la /tmp/website-repo/folio/index.html
wc -l /tmp/website-repo/folio/index.html
```

Expected: File exists, ~155 lines

- [ ] **Step 3: Commit Folio page**

```bash
cd /tmp/website-repo
git add folio/index.html
git commit -m "Add Folio app page"
```

Expected: "1 file changed, 155 insertions(+)" in commit output

---

## Task 5: Create WaterWise App Page

**Files:**
- Create: `/tmp/website-repo/waterwise/index.html`

- [ ] **Step 1: Create WaterWise index.html**

Create file at `/tmp/website-repo/waterwise/index.html` with this complete content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WaterWise — Drink Water Reminder & Tracker for Android</title>
    <meta name="description" content="Stay hydrated with no ads. Simple water tracker with streaks, smart reminders, and one-tap logging. Free water drinking reminder app. No paywall.">
    <meta name="keywords" content="water reminder, water tracker, drink water, hydration tracker, stay hydrated, no ads, free water app, streak tracker, widget">
    <link rel="stylesheet" href="../style.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💧</text></svg>">
</head>
<body>
    <div class="container">

        <nav class="nav">
            <a href="/" class="nav-brand">PurposeLab Studio</a>
            <ul class="nav-links">
                <li><a href="/folio/">Folio</a></li>
                <li><a href="/waterwise/" class="active">WaterWise</a></li>
                <li><a href="/bplog/">BP Log</a></li>
                <li><a href="/hushly/">Hushly</a></li>
                <li><a href="/blog/">Blog</a></li>
                <li><a href="/about/">About</a></li>
                <li><a href="/support/">Support</a></li>
            </ul>
        </nav>

        <section class="hero">
            <h1>💧 WaterWise — Drink Water Reminder</h1>
            <p class="subtitle">
                Stay hydrated with no ads. Simple water tracker with streaks, smart reminders, and one-tap logging.
            </p>
            <div class="badges">
                <span class="badge badge-free">Free</span>
                <span class="badge badge-noad">Zero Ads</span>
                <span class="badge badge-offline">Offline</span>
                <span class="badge badge-privacy">No Paywall</span>
            </div>
            <div style="margin-top: 28px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <a href="https://play.google.com/store/apps/details?id=com.purposelab.waterwise" class="btn btn-primary">
                    ▶ Get it on Google Play
                </a>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Screenshots</h2>
            <div class="screenshots">
                <img src="screenshots/01-stay-hydrated.png" alt="WaterWise home screen with progress ring" loading="lazy">
                <img src="screenshots/02-one-tap-tracking.png" alt="One-tap water logging with cup sizes" loading="lazy">
                <img src="screenshots/03-see-your-rhythm.png" alt="Weekly hydration stats and charts" loading="lazy">
                <img src="screenshots/04-quiet-reminders.png" alt="Smart reminder notifications" loading="lazy">
                <img src="screenshots/05-set-your-goal.png" alt="Daily water goal calculator" loading="lazy">
                <img src="screenshots/06-choose-gentle-alerts.png" alt="Reminder customization settings" loading="lazy">
                <img src="screenshots/07-widget-at-a-glance.png" alt="Home screen widget with progress" loading="lazy">
                <img src="screenshots/08-pick-your-sound.png" alt="Notification sound picker" loading="lazy">
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Why People Love WaterWise</h2>
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🚫</div>
                    <h3>Stay Hydrated — No Ads</h3>
                    <p>Tired of water apps that show ads every time you log a glass? WaterWise has zero ads on the logging screen. No banner at the bottom. No tricks.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">💧</div>
                    <h3>One-Tap Tracking</h3>
                    <p>Tap a cup size and you're done. 150ml, 250ml, 350ml, 500ml — or set custom sizes. Log water in under 1 second, right from your home screen widget.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">📊</div>
                    <h3>See Your Rhythm</h3>
                    <p>Beautiful progress ring shows how close you are to your daily goal. Clean daily and weekly charts. Watch your streak grow day by day.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">⏰</div>
                    <h3>Quiet Reminders</h3>
                    <p>Gentle reminders throughout the day with rotating motivational messages. Reminders auto-dismiss when you log water. Mute during sleep hours.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🎯</div>
                    <h3>Set Your Goal</h3>
                    <p>Enter your weight and WaterWise calculates your optimal daily water intake. Or set your own goal manually. Switch between ml and oz anytime.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🎨</div>
                    <h3>Choose Gentle Alerts</h3>
                    <p>Set your reminder schedule, adjust the interval, pick custom notification sounds. Dark mode included — and yes, it's free. Not behind a paywall.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">📱</div>
                    <h3>Widget at a Glance</h3>
                    <p>See your daily progress without even opening the app. The widget shows how much you've had and how far you are from your goal.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🔋</div>
                    <h3>Battery Optimized</h3>
                    <p>Smart handling of battery optimization on Samsung, Xiaomi, OnePlus, and other Android phones. Your reminders always work.</p>
                </div>
            </div>
        </section>

        <section class="cta">
            <h2>Stay Hydrated Starting Today</h2>
            <p>Free to download. No ads. No subscriptions. No paywall. Just hydration.</p>
            <a href="https://play.google.com/store/apps/details?id=com.purposelab.waterwise" class="btn btn-primary">
                ▶ Download WaterWise
            </a>
        </section>

        <footer class="footer">
            <p>&copy; 2025 PurposeLab Studio. All rights reserved.</p>
            <div class="footer-links">
                <a href="https://purposelabstudio.github.io/privacy-policies/waterwise.html">Privacy Policy</a>
                <a href="/support/">Support</a>
                <a href="/about/">About</a>
            </div>
        </footer>

    </div>
</body>
</html>
```

- [ ] **Step 2: Verify file created**

```bash
ls -la /tmp/website-repo/waterwise/index.html
wc -l /tmp/website-repo/waterwise/index.html
```

Expected: File exists, ~155 lines

- [ ] **Step 3: Commit WaterWise page**

```bash
cd /tmp/website-repo
git add waterwise/index.html
git commit -m "Add WaterWise app page"
```

Expected: "1 file changed, 155 insertions(+)" in commit output

---

## Task 6: Update Homepage with New Apps

**Files:**
- Modify: `/tmp/website-repo/index.html` (lines 14-50 nav, lines 70-125 app cards)

- [ ] **Step 1: Update homepage navigation**

In `/tmp/website-repo/index.html`, replace the nav section (lines ~14-23):

OLD:
```html
        <nav class="nav">
            <a href="/" class="nav-brand">PurposeLab Studio</a>
            <ul class="nav-links">
                <li><a href="/bplog/">BP Log</a></li>
                <li><a href="/hushly/">Hushly</a></li>
                <li><a href="/blog/">Blog</a></li>
                <li><a href="/about/">About</a></li>
                <li><a href="/support/">Support</a></li>
            </ul>
        </nav>
```

NEW:
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

- [ ] **Step 2: Add Folio app card to homepage**

In `/tmp/website-repo/index.html`, insert Folio card BEFORE the BP Log card (around line 70):

```html
            <div class="app-card">
                <div class="app-icon">📖</div>
                <div class="app-info">
                    <div class="app-name">Folio — Daily Journal & Mood</div>
                    <div class="app-desc">
                        A quiet notebook for closing the day. Write a little or a lot, track moods & habits, reflect monthly.
                    </div>
                    <div class="app-badges">
                        <span class="badge badge-free">Free</span>
                        <span class="badge badge-noad">No Ads</span>
                        <span class="badge badge-offline">Private & Offline</span>
                        <span class="badge badge-privacy">App Lock</span>
                    </div>
                    <div class="app-links">
                        <a href="/folio/">Learn More</a>
                        <a href="https://play.google.com/store/apps/details?id=com.purposelab.folio">Google Play</a>
                        <a href="https://purposelabstudio.github.io/privacy-policies/folio.html">Privacy Policy</a>
                    </div>
                </div>
            </div>
```

- [ ] **Step 3: Add WaterWise app card to homepage**

In `/tmp/website-repo/index.html`, insert WaterWise card AFTER Folio, BEFORE BP Log:

```html
            <div class="app-card">
                <div class="app-icon">💧</div>
                <div class="app-info">
                    <div class="app-name">WaterWise — Drink Water Reminder</div>
                    <div class="app-desc">
                        Stay hydrated with no ads. Simple water tracker with streaks, smart reminders, and one-tap logging.
                    </div>
                    <div class="app-badges">
                        <span class="badge badge-free">Free</span>
                        <span class="badge badge-noad">No Ads</span>
                        <span class="badge badge-offline">Offline</span>
                        <span class="badge badge-privacy">No Paywall</span>
                    </div>
                    <div class="app-links">
                        <a href="/waterwise/">Learn More</a>
                        <a href="https://play.google.com/store/apps/details?id=com.purposelab.waterwise">Google Play</a>
                        <a href="https://purposelabstudio.github.io/privacy-policies/waterwise.html">Privacy Policy</a>
                    </div>
                </div>
            </div>
```

- [ ] **Step 4: Verify homepage changes**

```bash
grep -n "Folio\|WaterWise" /tmp/website-repo/index.html
```

Expected: Lines showing Folio and WaterWise in nav and app cards

- [ ] **Step 5: Commit homepage updates**

```bash
cd /tmp/website-repo
git add index.html
git commit -m "Add Folio and WaterWise to homepage"
```

Expected: "1 file changed, ~40 insertions(+)" in commit output

---

## Task 7: Update Navigation on BP Log Page

**Files:**
- Modify: `/tmp/website-repo/bplog/index.html` (lines 14-23 nav)

- [ ] **Step 1: Update BP Log page navigation**

In `/tmp/website-repo/bplog/index.html`, replace the nav section:

OLD:
```html
        <nav class="nav">
            <a href="/" class="nav-brand">PurposeLab Studio</a>
            <ul class="nav-links">
                <li><a href="/bplog/" class="active">BP Log</a></li>
                <li><a href="/hushly/">Hushly</a></li>
                <li><a href="/blog/">Blog</a></li>
                <li><a href="/about/">About</a></li>
                <li><a href="/support/">Support</a></li>
            </ul>
        </nav>
```

NEW:
```html
        <nav class="nav">
            <a href="/" class="nav-brand">PurposeLab Studio</a>
            <ul class="nav-links">
                <li><a href="/folio/">Folio</a></li>
                <li><a href="/waterwise/">WaterWise</a></li>
                <li><a href="/bplog/" class="active">BP Log</a></li>
                <li><a href="/hushly/">Hushly</a></li>
                <li><a href="/blog/">Blog</a></li>
                <li><a href="/about/">About</a></li>
                <li><a href="/support/">Support</a></li>
            </ul>
        </nav>
```

- [ ] **Step 2: Commit BP Log nav update**

```bash
cd /tmp/website-repo
git add bplog/index.html
git commit -m "Update BP Log page navigation"
```

Expected: "1 file changed, 2 insertions(+)" in commit output

---

## Task 8: Update Hushly Page (Nav and Screenshots)

**Files:**
- Modify: `/tmp/website-repo/hushly/index.html` (lines 14-23 nav, lines 50-57 screenshots)

- [ ] **Step 1: Update Hushly page navigation**

In `/tmp/website-repo/hushly/index.html`, replace the nav section:

OLD:
```html
        <nav class="nav">
            <a href="/" class="nav-brand">PurposeLab Studio</a>
            <ul class="nav-links">
                <li><a href="/bplog/">BP Log</a></li>
                <li><a href="/hushly/" class="active">Hushly</a></li>
                <li><a href="/blog/">Blog</a></li>
                <li><a href="/about/">About</a></li>
                <li><a href="/support/">Support</a></li>
            </ul>
        </nav>
```

NEW:
```html
        <nav class="nav">
            <a href="/" class="nav-brand">PurposeLab Studio</a>
            <ul class="nav-links">
                <li><a href="/folio/">Folio</a></li>
                <li><a href="/waterwise/">WaterWise</a></li>
                <li><a href="/bplog/">BP Log</a></li>
                <li><a href="/hushly/" class="active">Hushly</a></li>
                <li><a href="/blog/">Blog</a></li>
                <li><a href="/about/">About</a></li>
                <li><a href="/support/">Support</a></li>
            </ul>
        </nav>
```

- [ ] **Step 2: Update Hushly screenshot references**

In `/tmp/website-repo/hushly/index.html`, replace the screenshots section (around lines 50-57):

OLD:
```html
            <div class="screenshots">
                <img src="screenshots/hushly-screenshot-1.png" alt="Hushly player screen with sleep sounds" loading="lazy">
                <img src="screenshots/hushly-screenshot-2.png" alt="Sound library with categories" loading="lazy">
                <img src="screenshots/hushly-screenshot-3.png" alt="Mixing multiple sounds" loading="lazy">
                <img src="screenshots/hushly-screenshot-4.png" alt="Sleep timer feature" loading="lazy">
                <img src="screenshots/hushly-screenshot-5.png" alt="Night light mode" loading="lazy">
                <img src="screenshots/hushly-screenshot-6.png" alt="Indian lullabies collection" loading="lazy">
                <img src="screenshots/hushly-screenshot-7.png" alt="Dark mode for nighttime use" loading="lazy">
                <img src="screenshots/hushly-screenshot-8.png" alt="Settings and customization" loading="lazy">
            </div>
```

NEW:
```html
            <div class="screenshots">
                <img src="screenshots/01-your-baby-sleeps-you-rest.png" alt="Hushly player with soothing sounds for baby sleep" loading="lazy">
                <img src="screenshots/02-27-soothing-sounds.png" alt="27 curated sleep sounds and lullabies" loading="lazy">
                <img src="screenshots/03-record-your-voice.png" alt="Record your own voice as a custom lullaby" loading="lazy">
                <img src="screenshots/04-fade-out-softly.png" alt="Sleep timer with gentle fade out" loading="lazy">
                <img src="screenshots/05-hush-mode-softer-nights.png" alt="Hush mode for softer nights" loading="lazy">
                <img src="screenshots/06-control-from-lock-screen.png" alt="Lock screen controls for easy access" loading="lazy">
                <img src="screenshots/07-10-calm-themes.png" alt="10 calm themes to choose from" loading="lazy">
            </div>
```

- [ ] **Step 3: Commit Hushly updates**

```bash
cd /tmp/website-repo
git add hushly/index.html
git commit -m "Update Hushly page navigation and screenshot references"
```

Expected: "1 file changed, ~10 insertions(+), ~10 deletions(-)" in commit output

---

## Task 9: Update Navigation on About Page

**Files:**
- Modify: `/tmp/website-repo/about/index.html` (lines 14-23 nav)

- [ ] **Step 1: Read current About page nav**

```bash
grep -A 10 '<nav class="nav">' /tmp/website-repo/about/index.html
```

Expected: Current nav structure displayed

- [ ] **Step 2: Update About page navigation**

In `/tmp/website-repo/about/index.html`, add Folio and WaterWise to nav links:

OLD nav-links:
```html
                <li><a href="/bplog/">BP Log</a></li>
                <li><a href="/hushly/">Hushly</a></li>
```

NEW nav-links:
```html
                <li><a href="/folio/">Folio</a></li>
                <li><a href="/waterwise/">WaterWise</a></li>
                <li><a href="/bplog/">BP Log</a></li>
                <li><a href="/hushly/">Hushly</a></li>
```

- [ ] **Step 3: Commit About page update**

```bash
cd /tmp/website-repo
git add about/index.html
git commit -m "Update About page navigation"
```

Expected: "1 file changed, 2 insertions(+)" in commit output

---

## Task 10: Update Navigation on Blog Page

**Files:**
- Modify: `/tmp/website-repo/blog/index.html` (lines 14-23 nav)

- [ ] **Step 1: Read current Blog page nav**

```bash
grep -A 10 '<nav class="nav">' /tmp/website-repo/blog/index.html
```

Expected: Current nav structure displayed

- [ ] **Step 2: Update Blog page navigation**

In `/tmp/website-repo/blog/index.html`, add Folio and WaterWise to nav links before BP Log:

OLD nav-links:
```html
                <li><a href="/bplog/">BP Log</a></li>
                <li><a href="/hushly/">Hushly</a></li>
```

NEW nav-links:
```html
                <li><a href="/folio/">Folio</a></li>
                <li><a href="/waterwise/">WaterWise</a></li>
                <li><a href="/bplog/">BP Log</a></li>
                <li><a href="/hushly/">Hushly</a></li>
```

- [ ] **Step 3: Commit Blog page update**

```bash
cd /tmp/website-repo
git add blog/index.html
git commit -m "Update Blog page navigation"
```

Expected: "1 file changed, 2 insertions(+)" in commit output

---

## Task 11: Update Navigation on Support Page

**Files:**
- Modify: `/tmp/website-repo/support/index.html` (lines 14-23 nav)

- [ ] **Step 1: Read current Support page nav**

```bash
grep -A 10 '<nav class="nav">' /tmp/website-repo/support/index.html
```

Expected: Current nav structure displayed

- [ ] **Step 2: Update Support page navigation**

In `/tmp/website-repo/support/index.html`, add Folio and WaterWise to nav links before BP Log:

OLD nav-links:
```html
                <li><a href="/bplog/">BP Log</a></li>
                <li><a href="/hushly/">Hushly</a></li>
```

NEW nav-links:
```html
                <li><a href="/folio/">Folio</a></li>
                <li><a href="/waterwise/">WaterWise</a></li>
                <li><a href="/bplog/">BP Log</a></li>
                <li><a href="/hushly/">Hushly</a></li>
```

- [ ] **Step 3: Commit Support page update**

```bash
cd /tmp/website-repo
git add support/index.html
git commit -m "Update Support page navigation"
```

Expected: "1 file changed, 2 insertions(+)" in commit output

---

## Task 12: Update Sitemap

**Files:**
- Modify: `/tmp/website-repo/sitemap.xml` (add 2 new URL entries)

- [ ] **Step 1: Read current sitemap**

```bash
cat /tmp/website-repo/sitemap.xml
```

Expected: XML file with existing URL entries for bplog and hushly

- [ ] **Step 2: Add Folio and WaterWise URLs to sitemap**

In `/tmp/website-repo/sitemap.xml`, add these entries AFTER the homepage entry and BEFORE the bplog entry:

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

- [ ] **Step 3: Verify sitemap XML is valid**

```bash
xmllint --noout /tmp/website-repo/sitemap.xml && echo "XML is valid"
```

Expected: "XML is valid" output (or if xmllint not available, skip this check)

- [ ] **Step 4: Commit sitemap update**

```bash
cd /tmp/website-repo
git add sitemap.xml
git commit -m "Add Folio and WaterWise to sitemap for SEO"
```

Expected: "1 file changed, 10 insertions(+)" in commit output

---

## Task 13: Final Testing and Verification

**Files:**
- Test all pages locally or via GitHub Pages

- [ ] **Step 1: Verify all commits**

```bash
cd /tmp/website-repo
git log --oneline -15
```

Expected: 13 commits showing all changes made in this plan

- [ ] **Step 2: Check file structure**

```bash
cd /tmp/website-repo
ls -la folio/
ls -la waterwise/
ls -la hushly/screenshots/
```

Expected:
- folio/ has index.html and screenshots/ with 8 images
- waterwise/ has index.html and screenshots/ with 8 images  
- hushly/screenshots/ has 7 new images

- [ ] **Step 3: Verify navigation consistency**

```bash
grep -h '<li><a href="/folio/">' /tmp/website-repo/*/index.html /tmp/website-repo/index.html | wc -l
```

Expected: 7 (all 7 pages have Folio in nav)

- [ ] **Step 4: Verify homepage has 4 app cards**

```bash
grep -c "app-card" /tmp/website-repo/index.html
```

Expected: 4

- [ ] **Step 5: Test local preview (optional)**

```bash
cd /tmp/website-repo
python3 -m http.server 8000
```

Then open http://localhost:8000 in browser and verify:
- Homepage shows all 4 apps
- All nav links work
- All screenshot images load
- Mobile responsive design works

Press Ctrl+C to stop server when done.

- [ ] **Step 6: Push to GitHub**

```bash
cd /tmp/website-repo
git push origin main
```

Expected: All commits pushed successfully, GitHub Pages will auto-deploy

---

## Self-Review Checklist

### Spec Coverage
✅ All 4 apps visible on homepage - Task 6  
✅ Folio dedicated page created - Task 4  
✅ WaterWise dedicated page created - Task 5  
✅ Hushly screenshots updated - Task 3  
✅ Navigation updated on all 7 pages - Tasks 6-11  
✅ Sitemap updated - Task 12  
✅ Screenshots copied correctly - Tasks 1-3

### Placeholder Scan
✅ No TBD or TODO items  
✅ All HTML code complete  
✅ All file paths exact  
✅ All bash commands complete  
✅ No "implement later" references

### Type Consistency
✅ Nav structure identical across all pages  
✅ Badge classes consistent (badge-free, badge-noad, etc.)  
✅ Screenshot file naming consistent (01-name.png format)  
✅ CSS classes match existing style.css  
✅ URL formats consistent across all links

### Testing Coverage
✅ File verification steps after each copy operation  
✅ Commit verification at each step  
✅ Final integration testing in Task 13  
✅ Navigation link consistency check  
✅ Mobile responsive mentioned in testing

---

## Execution Complete

All tasks implement the approved design spec. The website will now showcase all 4 apps with consistent navigation and updated assets.
