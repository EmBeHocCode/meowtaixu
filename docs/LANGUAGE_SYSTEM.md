# Multilingual design system

Status: approved language roles for future portfolio work; documentation only. This document does not authorize redesigning sections, translating existing content wholesale, adding a language switcher, or generating artwork.

## Language roles

The portfolio is Vietnamese-first with selective English support and Chinese visual accents. These are complementary roles, not three equal translation layers.

| Language | Purpose | Content and presentation |
| --- | --- | --- |
| Vietnamese — primary | Understanding the person and their work | Body content, explanations, readable personal information, long-form content, navigation and clear action labels. Highest reading priority. |
| English — professional / international support | Professional context and recognizable terminology | Professional subtitles, technology names, portfolio labels, short secondary descriptions and international context. Do not duplicate every Vietnamese paragraph. |
| Chinese — decorative / xianxia visual language | Atmosphere and visual identity | Decorative headings, poetic labels, seals, cultivation terminology and visual emphasis. Never the sole carrier of critical information. |

A visitor who cannot read Chinese must still understand who the owner is, their studies, skills, projects, navigation and contact actions. Do not invent or alter personal facts when composing secondary copy.

## Typographic hierarchy

| Role | Typography | Limits |
| --- | --- | --- |
| Vietnamese | Readable paragraph typography, natural casing, comfortable line height and clear contrast. Use fonts with complete Vietnamese accents, including real italic/bold styles when needed. | Do not use decorative calligraphy, wide tracking, vertical text or all caps for long passages. Keep diacritics unclipped. |
| English | Small uppercase labels with restrained tracking; professional subtitles and secondary descriptions can use normal case. | Secondary must still be legible; never shrink to unreadable microtext. Preserve technology/product spelling and casing. |
| Chinese | Occasional large or vertical decorative typography, poetic labels or seals; strong visual identity at low frequency. | Visually large does not mean semantically primary. Keep decoration away from reading and interaction zones. |

Use multilingual typography selectively as part of the composition, not as a repeated VN + EN + CN sentence template. A section may have one Chinese accent and a short English label around its Vietnamese heading; it does not have to display all three. On narrow screens, omit optional decoration before shrinking or hiding essential Vietnamese content.

## Approved journey terminology

Use the following Vietnamese labels consistently in the global journey. The xianxia vocabulary adds identity without replacing clear modern terms where a visitor needs them.

| Section / concept | Approved label | Usage example |
| --- | --- | --- |
| Hero | Nhập cảnh | Navigation and `01 — NHẬP CẢNH`; optional English support: `ENTER THE REALM` |
| About | Thân thế | Navigation and `02 / THÂN THẾ`; retain `ABOUT ME` as secondary editorial context |
| Expertise | Sở tu | Future expertise chapter label |
| Skills | Công pháp | Future skill groups such as React, TypeScript, PHP and Three.js |
| Tools / Technologies | Pháp khí | Future tools such as Git, Docker, Codex and Cloudflare; retain recognizable product names |
| Focus | Đạo lộ | Future professional direction chapter label |
| Projects | Bí cảnh | Future individual project entries |
| Connect | Truyền âm | Future contact methods such as Email, Discord and GitHub |

These labels are portfolio terminology, not permission to fill Vietnamese body copy with cultivation roleplay. Use `đạo hữu` only as an occasional deliberate accent. Keep explicit modern terms such as GitHub, technology names and contact methods visible so visitors never need to decode the theme.

## Narrative voice

Hero and About use `ta` as the narrator's first-person Vietnamese pronoun. The voice is calm, reflective and self-possessed: a modern person describing learning, web building and E-Commerce through a restrained cultivation-world metaphor. Omit the pronoun naturally when possible instead of beginning every sentence with `ta`.

Do not use `mình` or `tôi` in this narrator voice. Avoid exaggerated roleplay such as `bổn tọa`, `tại hạ`, `nghịch thiên`, `độ kiếp` or `thiên mệnh`. Limit cultivation terms to one or two useful terms per paragraph; identity and professional meaning must remain understandable without fantasy knowledge. Addressing a visitor as `đạo hữu` is optional and rare, never repeated through Hero or About body copy.

## Section vocabulary and composition examples

These are approved examples of roles, not mandatory simultaneous stacks or instructions to replace current section content now. Chinese phrases may be thematic rather than literal translations of the Vietnamese/English labels.

| Section | Chinese decorative accent | English support | Vietnamese primary |
| --- | --- | --- | --- |
| Hero | 入仙境 | ENTER THE REALM | Nhập cảnh; Meow; Mang đạo hiệu Meow, hành giữa thương đạo, web và AI. |
| About | 關於我 | ABOUT ME | Thân thế; Ta mang đạo hiệu Meow; Tên thật: Nguyễn Lâm Hùng. |
| Expertise | 所修 | EXPERTISE | Sở tu |
| Skills / tools | 功法 · 法器 | SKILLS / TOOLS | Công pháp; Pháp khí |
| Focus | 所行 | FOCUS | Đạo lộ |
| Projects | 秘境 | PROJECTS | Bí cảnh |
| Connect | 傳音 | CONNECT | Truyền âm |

Keep the identity “Meow” and real name “Nguyễn Lâm Hùng” distinct; `EmBeHocCode` is the GitHub username, never a nickname. In Hero, the Chinese/English atmosphere pair is separate from identity and professional subtitle. Do not automatically repeat the subtitle or biography in three languages. Chinese labels remain decorative; Vietnamese chapter terminology and recognizable modern words carry the meaning.

## Semantics and accessibility for future implementation

Keep primary headings, biography, project information and controls in semantic HTML, not embedded in artwork or Three.js textures. The document language is `vi`; mark English passages with `lang="en"` and Chinese with `lang="zh-Hant"` when using the Traditional Chinese vocabulary above. Use the appropriate language/script tag if future copy differs.

A Vietnamese heading supplies the section's semantic name. Purely decorative Chinese calligraphy or a redundant visual label may be `aria-hidden="true"` only when it carries no unique information and is not interactive. Do not hide meaningful English subtitles from assistive technology. Do not make a Chinese-only seal the accessible name of navigation or a CTA: provide a visible, understandable Vietnamese label; English may supplement it when useful.

Match font coverage to the language and verify the actual rendered glyphs. Prefer consistent Traditional Chinese forms for the supplied accents; do not substitute unrelated characters to suit a font. If future artwork includes decorative writing, inspect it for accuracy and keep all essential information available in HTML.

## Review before completing future section work

1. Ignore every Chinese accent: the portfolio and all actions must remain fully understandable.
2. Check Vietnamese readability, accents, wrapping and contrast on desktop and mobile.
3. Check that English adds professional context rather than repeating long-form Vietnamese copy.
4. Remove redundant multilingual stacks; preserve breathing room and the environment's visual balance.
5. Check heading order, language tags and accessible names; decoration must not create repeated screen-reader announcements.

## Integration and boundaries

This is the canonical detailed language reference. `ART_DIRECTION.md` summarizes its visual application; `.codex/skills/xianxia-web-design/SKILL.md` requires reading it before future text, typography, section-composition or text-bearing-artwork work. Apply it within each requested task, not as authorization for an unsolicited site-wide migration.
