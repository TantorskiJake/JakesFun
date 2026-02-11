# Accessibility & Responsiveness Checklist

This document describes how to verify the synergy workspace meets WCAG-friendly keyboard, screen-reader, and responsive requirements.

## Keyboard Interaction
- **Tabs**: `Tab` focuses the active tab, `ArrowLeft/ArrowRight` cycles, `Home/End` jump to first/last. `Enter`/`Space` not required but clicking still works.
- **Panels**: Switching tabs toggles `aria-selected`, updates `aria-controls`, and exposes the associated `role="tabpanel"` container.
- **Back to top**: Sticky button supports `Enter`/`Space` and shows a visible focus ring.

## Screen Readers
- Summary cards live-update via the `analysisStatus` polite region.
- Defense rows announce quad/weak/resist/immune counts via `role="img"` descriptions plus hidden definition lists.
- Offensive heatmap renders as a semantic `<table>` with caption and header cells; each cell exposes the attacking and defending type plus Pokémon list.
- Radar chart uses `<figure>` + `<figcaption>` along with a textual unordered list of average stats for non-visual contexts.

## Responsive & Motion Preferences
- Summary cards collapse to 2 columns at ≤1024px and a single column at ≤640px; the stats layout stacks vertically on phones.
- Heatmap remains horizontally scrollable with sticky headers, and `.heatmap` is focusable for keyboard scrolling.
- Users honoring `prefers-reduced-motion: reduce` receive disabled transitions, non-animated tabs, and a non-animated Chart.js radar.

## Manual Test Steps
1. **Keyboard traversal**: Starting from "Re-run Analysis", tab to each tab, use arrow keys to cycle, verify focus/ARIA updates, then reach the Back to top button.
2. **Screen reader sanity** (VoiceOver/NVDA): Confirm tabs announce positions, defense stacked bars read counts, heatmap cells say "Fire attacking Steel: 3 Pokémon" etc.
3. **Responsive checks**: Resize to 320px/768px/1024px to confirm no horizontal scroll (aside from intentional heatmap) and that cards/roles stack correctly.
4. **Reduced motion**: Enable OS-level reduced motion and reload `/team` — there should be no tab/chart animations while the analysis status still announces updates.
5. **Regression**: Re-run `python3 -m pytest` plus manual saved team load/share flows to ensure functionality parity.
