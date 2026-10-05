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

## Section vocabulary and composition examples

These are approved examples of roles, not mandatory simultaneous stacks or instructions to replace current section content now. Chinese phrases may be thematic rather than literal translations of the Vietnamese/English labels.

| Section | Chinese decorative accent | English support | Vietnamese primary |
| --- | --- | --- | --- |
| Hero | 入仙境 | ENTER THE REALM; E-Commerce Student & AI-assisted Builder | Meow Ngáo; Sinh viên Thương mại điện tử |
| About | 關於我 | ABOUT ME | Về tôi |
| Skills | 功法 · 法器 | SKILLS / TOOLS | Kỹ năng & Công nghệ |
| Projects | 秘境 | PROJECTS | Dự án |
| Connect | 傳音 | CONNECT | Kết nối |

Keep the identity “Meow Ngáo” unchanged. In Hero, the Chinese/English atmosphere pair is separate from identity and professional subtitle. Do not automatically repeat the subtitle or biography in three languages. No new Chinese labels are prescribed for Expertise or Focus; choose any future accents deliberately within their approved design scope.

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
