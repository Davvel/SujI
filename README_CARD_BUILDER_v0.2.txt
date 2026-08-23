SuJi Physical Print Builder v0.2
================================

DROP-IN INSTALL
Copy/extract this ZIP over the root of your SuJi folder.
It adds/updates:
  cards.html
  css/card-maker.css
  js/tools/card-maker.js
  config/print-packs.js

OPEN
Open cards.html through the same local/static server used for SuJi.

NEW IN v0.2
- Pack picklist. Regular works immediately.
- Level picklist.
- Board Side (cm) field.
- The physical piece cell size is derived from the board:
      cell_mm = (board_side_cm * 10) / 9
- Exact-size 9x9 board preview/print.
- 50 mm calibration line.
- Board PDF, 12 Cards PDF, and Complete PDF print buttons.
- Picture fragments scale from the exact physical tile size.
- Warning when the chosen board size makes a piece too large for the selected card dimensions.

IMPORTANT PRINT SETTING
The browser print dialog must use 100% / Actual Size.
Disable Fit to Page / Scale to Fit.
Measure the 50 mm calibration line on the first physical prototype.

NAMED PACKS
Edit config/print-packs.js only. The builder itself does not need changing.
Regular is already defined. Add named pack objects following the example comments in that file.

PACK MAPPING
A pack may define:
- id
- name
- levels: [1,2,...] OR minLevel/maxLevel
- engineLevelOffset (optional)
- engineLevels object (optional explicit displayed->engine level mapping)
- imageTemplate

Image template tokens:
  {level}
  {level4}
  {engineLevel}
  {engineLevel4}
