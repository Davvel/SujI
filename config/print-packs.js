/*
 * SuJi Print Pack Registry
 * ------------------------
 * Drop this file into config/print-packs.js.
 *
 * The Card Builder always includes a Regular pack. Add named packs below.
 * A named pack can map its displayed level to an existing SuJi engine level and
 * can optionally point at a different picture location.
 *
 * Example:
 * {
 *   id: 'malta',
 *   name: 'Malta Pack',
 *   levels: [1,2,3,4,5,6,7,8,9,10],
 *   engineLevelOffset: 100,
 *   imageTemplate: 'resources/packs/malta/Image_{level4}.png'
 * }
 *
 * In that example Malta Pack level 1 uses engine level 101.
 */
window.SuJiPrintPacks = [
  {
    id: 'regular',
    name: 'Regular',
    minLevel: 1,
    maxLevel: 9999,
    engineLevelOffset: 0,
    imageTemplate: 'resources/Image_{engineLevel4}.png'
  }
];
