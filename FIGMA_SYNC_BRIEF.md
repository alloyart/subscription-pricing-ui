# FIGMA_SYNC_BRIEF

1. **Current source / preview**
   - Live URL: https://alloyart.github.io/subscription-pricing-ui/
   - Source: `alloyart/subscription-pricing-ui` → `main`
   - Relevant implementation: `index.html`, `styles.css`, `refinement.css`, `motion.css`, `app.js`.

2. **Visual truth source**
   - The currently running live webpage is the final visual and interaction truth source.
   - Source code is used only to resolve exact values, component structure, and deterministic states.
   - Do not redesign from earlier wireframes or provisional dimensions. If they conflict, the live webpage wins.

3. **Target Figma**
   - fileKey: `CpWQ7twW4nShUnd4nORN2j`
   - Page: `Page 3`
   - page node: `353:6498`
   - Section: `UIUX Test — Subscription Plans`

4. **Formal states to sync**
   - `01 Initial — Free current` → default URL
   - `02 Processing — Upgrading to Pro…` → `?state=loading`
   - `03 Pro Success — Modal open` → `?state=success`
   - `04 Completed — Pro current` → `?state=completed`
   - Total: **4 states**.

5. **Current fonts**
   - Display CSS stack: `Universal Sans Display, Arial, Helvetica, sans-serif`.
   - UI/Text CSS stack: `Universal Sans Text, Arial, Helvetica, sans-serif`.
   - No webfont files are bundled; therefore the rendered live capture is authoritative if Universal Sans is unavailable in the browser/Figma environment.

6. **Color / spacing / radius / shadow source**
   - Source: current `styles.css` + `refinement.css`; `tesla DESIGN.md` is secondary rationale only.
   - Core colors: canvas `#FFFFFF`; surface `#F4F4F4`; ink `#171A20`; body `#393C41`; tertiary `#5C5E62`; placeholder `#8E8E8E`; divider `#EEEEEE`; control border `#D0D1D2`; primary action `#3E6AE1`; hover `#345ED0`; pressed `#2D52BA`; modal overlay `rgba(128,128,128,.65)`.
   - Key layout values: sidebar `216px`; page gutter `40px`; card gap `16px`; card radius `12px`; control/modal radius `4px`.
   - Shadows: none in the current formal page/modal.
   - Final Figma measurements must match the live page/capture, not an earlier token sheet.

7. **Current component inventory**
   - App shell; sidebar; product mark; navigation item; account card/avatar.
   - Page intro; billing selector/options.
   - Plan grid; Free / Pro / Ultra plan card; plan topline; Recommended badge; price row; plan action/current/processing states.
   - Credit summary/progress; benefit group/list/item; pricing footnotes; subscription terms.
   - Success modal layer; modal; success symbol; close button; benefit group; primary modal action.
   - Repeated UI should become editable Figma components/variants where it improves delivery quality without changing appearance.

8. **Current interaction path**
   - `Initial` → activate `Upgrade to Pro` → `Processing` for 300 ms → apply Pro state + open success modal → close by `Start using Pro`, close button, or `Esc` → `Completed`.
   - During modal: background is inert and scroll-locked; clicking overlay does not close it.
   - On success: sidebar plan changes `Free → Pro`; Free loses current state; Pro becomes current; Ultra remains neutral and does not open an independent flow.
   - Modal motion comes from current `motion.css`; do not invent a new motion language.

9. **Final Figma delivery structure**
   - `UIUX Test — Subscription Plans`
     - `00 Reference` — the 4 pixel-accurate captures from the live webpage.
     - `01 Final Screens` — 4 editable reconstructed states matching the captures.
     - `02 Components` — reusable components/variants used by the final screens.
   - Keep reference captures separate from editable final-design frames.

10. **Acceptance rules**
   - All 4 formal states are present and visually match the current live webpage at the same capture viewport.
   - Approved `UI_COPY_V2.md` text is unchanged.
   - Layout, font rendering, colors, spacing, radii, borders, disabled/current/recommended states, and modal overlay match the live implementation.
   - Final screens are editable design layers, not screenshot-only deliverables; repeated elements are consistently componentized where appropriate.
   - Initial → Processing → Success → Completed is clearly represented in Figma and can be reviewed without consulting obsolete wireframes.
   - No webpage/code changes are part of this sync task.
