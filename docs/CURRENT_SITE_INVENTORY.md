# Current site inventory (read-only)

Inspected on 2026-10-05 from `E:\bio.mieowparadise.io.vn\public_html`.
This is a source-file inventory, not a live production runtime audit. No production file, package, routing or deployment setting was modified. Only the HTML, main script and asset listing needed for this inventory were inspected; archived implementations were not migrated.

Primary evidence: `index.html`, `js/script.js`, and existing asset paths. Line references below refer to that inspected snapshot.

## Sections and preservation mapping

| Current area | Existing anchor | Foundation destination | Useful content |
| --- | --- | --- | --- |
| Fixed profile/sidebar | No hero section | Hero (empty for now) | Meow Ngáo / EmBeHocCode, role, bio, avatar, social links, BETU K23 |
| Về Bản Thân / About Me | `about` | About | Business-to-software thinking, useful products, human-led planning |
| Chuyên Môn / Expertise | `services` | Expertise | E-Commerce Mindset, Web Product Building, AI-assisted Workflow, Product Planning |
| Kỹ Năng / Công Nghệ | `skills` | Skills | Tool stack and practice-level labels |
| Hiện tại mình đang tập trung | `focus` | Focus | Graduation-oriented projects, AI business tools, content workflow, system thinking |
| Security Lab | `security-lab` | Deferred; possible Projects content | Educational client-side Anti-DDoS / OSI defense simulation iframe |
| Dự Án Đang Làm / Current Projects | `experience` | Projects | Six project entries below |
| Kết nối nhanh / Quick connect | `connect` | Connect | GitHub, website, Discord, TikTok |

The new components preserve `services` and `experience` anchor IDs. No new route or router is introduced. Security Lab is documented, not silently removed from production or added to the seven-section foundation.

## Identity and reusable copy

`index.html:222-255, 318-362`: display name **Meow Ngáo**, alias **EmBeHocCode**, role **E-Commerce Student & AI-Assisted Builder**, **3rd-year IT student**, location **Ho Chi Minh City, Vietnam**, study direction **IT / E-Commerce**, badge **BETU K23**. These are existing claims, not independently verified current facts; reconfirm time-sensitive study year before publishing.

Existing English bio:

> I'm EmBeHocCode. I focus on E-Commerce, enjoy building web products and mini tools, and use AI to accelerate execution while keeping strategy and planning human-led.

Other useful messaging: learning by building; understand business operations and user needs before choosing implementation; build web products, mini games and practical E-Commerce tools; open to serious project discussions with clear briefs and goals. Both Vietnamese and English strings are embedded in `data-vi` / `data-en` attributes.

`index.html:428-487`: listed tools are HTML, CSS, JavaScript, React, TypeScript and Next.js. Practice labels: AI-assisted execution (Upgrading), Product thinking & planning (Applying), Frontend web building (Shipped products), E-Commerce mindset (Learning). Visual progress values are 86/72/82/48; do not present them as independently measured proficiency.

## Projects

| Project | Existing description (summary) | Existing destination |
| --- | --- | --- |
| mieow-bio | Personal portfolio presenting profile, E-Commerce direction and learning projects; currently cyber pink/purple glassmorphism | `https://github.com/EmBeHocCode/mieow-bio`; production site demo |
| SnapTrans | Windows translation tool with screenshot OCR and offline translation | `https://github.com/EmBeHocCode/SnapTrans` |
| ZenoDigital | Digital-services storefront/backoffice, product administration, order operations, AI experiments | `https://github.com/EmBeHocCode/ZenoDigital` |
| Mona Idle Quest | Windows 2D pixel-art action/idle RPG prototype with combat, frame animation and boss encounter | `https://github.com/EmBeHocCode/MonaIdleQuest` |
| E-Commerce Workflow Notes | Purchase journeys, content operations, translating shop insights into requirements | `https://github.com/EmBeHocCode` |
| Meow Astral Core | Three.js/WebGL purple energy core, particles and pointer interaction with mobile reduction | `https://github.com/EmBeHocCode/Meow-Astral-Core`; `./assets/site3d-bg/index.html` |

Evidence: `index.html:571-733`. Existing descriptions and project destinations should be reviewed and migrated separately; none is copied into the empty foundation sections yet.

## Contact destinations

| Channel | Existing URL |
| --- | --- |
| GitHub | `https://github.com/EmBeHocCode` |
| Website | `https://bio.mieowparadise.io.vn/` |
| Facebook (sidebar) | `https://www.facebook.com/hungng.0505` |
| Discord | `https://discord.com/users/embi_dev` |
| TikTok | `https://www.tiktok.com/@00bidev00` |

Keep these as source references; validate destinations before a content migration. In particular, verify whether the Discord username-form URL actually resolves; do not invent a numeric user ID.

## Interactive features

`index.html` controls and `js/script.js` describe language switching, accent-color presets and custom color management with local persistence, hiding/showing UI, static/animated background switching, mobile navigation, collapsible sections, lazy section work, back-to-top, custom cursor, and scene zoom/reset/drag/wheel controls. The 3D background and Security Lab are iframe integrations. Background animation is suppressed for reduced motion, save-data and mobile performance modes.

There is also legacy Lanyard/Discord presence code, a Minecraft-status helper and a local view-counter helper. Their presence does not prove live services are active: initialization is DOM/config dependent, and Minecraft status is rendered from static data attributes rather than a real-time ping. Do not restore historical backend assumptions.

Copy/selection/context-menu and developer-key blocking code also exists. Documented for awareness, not carried into the new foundation: it is not a content-protection boundary and restricts normal user actions. Existing viewport markup disables user zoom; the foundation intentionally does not copy this restriction.

## Location and weather

`js/script.js:1696-1915`, `initFocusBubble()`:

1. Begins with HCMC coordinates `10.8231, 106.6297`, HCMC city text and a separate Đồng Nai region fallback.
2. Fetches current temperature and weather code from Open-Meteo (`api.open-meteo.com/v1/forecast`, `current=temperature_2m,weather_code`, `timezone=auto`). Maps codes to VI/EN labels.
3. Reverse-geocodes coordinates using Nominatim (`nominatim.openstreetmap.org/reverse`, `format=jsonv2`, `zoom=10`, `accept-language=vi`).
4. Requests browser geolocation after idle initialization, with low accuracy, 5-second timeout and 15-minute cached-position allowance. Successful visitor coordinates trigger both external requests again; denial retains fallback content.
5. Rotates location, region, weather, clock, date and greeting every 3.2 seconds; refreshes displayed time every 30 seconds using `Asia/Ho_Chi_Minh`.

Potential future preservation: optional weather, useful local time and clear fallback. Decide whether weather represents the owner or the visitor. The existing fallback mixes HCMC and Đồng Nai; do not silently treat them as the same location. A new visitor-location feature needs a clear opt-in and disclosure before sending coordinates to external services. No geolocation or weather requests are made by this foundation.

## Music and audio

`index.html:858-929`, `js/script.js:639+` and `initMusicPlayer():1176+`: local static playlist from `assets/music/`; floating panel, track listing/selection, previous/next, play/pause, seeking and time display, shuffle with stored preference, repeat modes, playback speed 0.5–2x, and volume up to 200% through Web Audio gain with ordinary-volume fallback. Track history supports previous behavior.

Old code attempts audible autoplay, then muted autoplay when blocked, and interaction-based resume. Preserve player capability only after explicit implementation approval; prefer user-started audio in the new experience. Confirm music licensing and consolidate duplicated asset collections. No background music player or audio permission flow is implemented now.

## Loading behavior

`index.html:24-63`, `js/script.js:27-180`: existing loader is a generated CSS/DOM identity animation, not the supplied MP4. It uses rings/arcs/traces/shards, simulated progress and stage labels, pointer drift, approximately 1.9 seconds on desktop (1.2 seconds for coarse/small-screen variant), then a 120 ms delay and 620 ms cleanup. Mobile performance mode skips it; history navigation may skip it. This progress is time-based, not actual asset progress.

The new foundation replaces that implementation only in the new project: the supplied MP4 covers the viewport, previews briefly once ready, fades, never loops, and has failure/timeout/reduced-motion exits. It never waits for decorative Canvas resources.

## Migration cautions

Production references a missing `tichtuyetavt.webp` preload and declares a `.png` source as `image/webp`; validate media types later. Old markup uses inline code, external Google Fonts/Font Awesome, compiled scene assets and archived implementations. Do not copy these wholesale. `.htaccess` and deployment behavior remain untouched; no deployment is configured for the new project.
