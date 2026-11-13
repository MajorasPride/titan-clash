// Mythic Forge — modes (T035, Nov 13 2026). Mythic Forge is a general creature, character and prop builder; kaiju / mech is the Titan mode.
// Plain script, loaded before the core (build.py). The core asks window.mfModeHas / mfPartOk / mfGroupOk / mfModeWord when it lists things.
// A mode only hides things in the lists (body types, ⭐ defaults, starters, part categories). Search still finds every part, and nothing on a saved creature is ever removed.
(function () {
  const TITAN = ['biped', 'kaiju', 'mech', 'walker', 'tank', 'bone_colossus', 'primordial', 'chained_titan'];
  const CHARACTER = ['slim', 'brute', 'fourarm', 'angel', 'centaur', 'naga', 'naga_coil', 'naga_four', 'sixarm', 'cosmic_god', 'sea_god', 'death_god', 'city_god', 'reaper', 'shade', 'demon', 'construct', 'turtle2'];
  const PROP_GROUPS = ['Basic Shapes & Clay', 'Part Makers (sliders)', 'Weapons', 'Accessories & Magic', 'Cloth & Capes', 'Mech Details', 'Low-Poly Builds', 'My Parts', 'My Imports', 'Free Packs (CC0)'];
  const TITAN_ONLY_GROUP = /^(Mech |Mecha Dragon|Kaiju Kit)/;   // mech parts, the mecha dragon and kaiju kits
  const TITAN_ONLY_SUB = ['Mech weapons'];                        // missile pod, energy blade, energy shield
  const MODES = {
    creature: {name: '🐾 Creature', word: 'creature', hint: 'Animals, monsters, dragons, sea and bug creatures, elementals.'},
    character: {name: '🧑 Character', word: 'character', hint: 'People and people-shaped beings: humanoids, angels, gods, naga, centaurs.'},
    prop: {name: '🪑 Prop', word: 'prop', hint: 'Things: weapons, gear, furniture, magic items. Starts with no skeleton.'},
    titan: {name: '🦖 Titan', word: 'titan', hint: 'Kaiju and mechs at giant scale, mech weapons, and the Titan Clash export.'},
    blank: {name: '✨ Blank', word: 'build', hint: 'Make anything: every body type and every part.'}};
  const mine = k => typeof k === 'string' && (k.startsWith('mix_') || k.startsWith('my_') || /^★/.test(((window.FORGE_SKEL || {})[k] || {}).name || ''));
  const modeOf = skel => !skel || skel === 'none' ? 'prop' : TITAN.includes(skel) ? 'titan' : CHARACTER.includes(skel) ? 'character' : 'creature';
  let cur = 'creature'; try { const m = localStorage.getItem('mf-mode'); if (MODES[m]) cur = m; } catch (e) {}
  window.MF_MODES = MODES;
  window.mfModeOf = modeOf;
  window.mfMode = () => cur;
  window.mfSetModeRaw = m => { if (!MODES[m]) return false; cur = m; try { localStorage.setItem('mf-mode', m); } catch (e) {} return true; };
  window.mfModeWord = () => MODES[cur].word;
  // body types shown in this mode (your own saved and mixed bodies show everywhere)
  window.mfModeHas = k => cur === 'blank' || mine(k) || (cur === 'prop' ? k === 'none' : k !== 'none' && modeOf(k) === cur);
  // part categories shown while browsing (search shows everything)
  window.mfGroupOk = g => cur === 'blank' || cur === 'titan' || (cur === 'prop' ? PROP_GROUPS.includes(g) : !TITAN_ONLY_GROUP.test(g));
  window.mfPartOk = e => window.mfGroupOk(e.group) && (cur === 'blank' || cur === 'titan' || !TITAN_ONLY_SUB.includes(e.sub));
  window.mfTitanExportShown = () => { if (cur === 'titan') return true; try { return localStorage.getItem('mf-tc-all') === '1'; } catch (e) { return false; } };
})();
