/** SuJi classic-compatible module wrapper. Source owner: js/main.js */
SuJiModules.define("js/main.js", function(require, exports){
'use strict';
/** SuJi 1.31.0 composition root. Detailed behaviour lives in specialised modules. */
const {app} = require("js/core/app-context.js");
const {$} = require("js/core/dom.js");
require("js/data/pattern-provider.js");
require("js/storage/progress-store.js");
require("js/game/scoring.js");
require("js/ui/stats-view.js");
require("js/ui/conflict-view.js");
require("js/features/hints.js");
require("js/features/picture-preview.js");
require("js/features/tutorial.js");
require("js/layout/responsive-layout.js");
require("js/game/sudoku-generator.js");
require("js/game/puzzle-builder.js");
require("js/game/placement-rules.js");
require("js/ui/board-view.js");
require("js/ui/piece-view.js");
require("js/layout/rack-layout.js");
require("js/ui/rack-view.js");
require("js/features/drag-drop.js");
require("js/game/validator.js");
require("js/levels/level-loader.js");
require("js/levels/level-manager.js");
require("js/features/settings.js");
require("js/features/level-picker.js");
const {initDialogs} = require("js/ui/dialogs.js");
const {initPWA} = require("js/pwa/install.js");
app.initSettings();
app.initLevelActions();
app.initLevelPicker();
app.initTutorial();
app.initHints();
app.initPicturePreview();
app.initResponsiveLayout();
initDialogs();
initPWA();

app.updateResponsiveLayout();
app.buildBoard();
app.resetLevel(true);

});
