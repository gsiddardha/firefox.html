require.config({
  scriptType: "text/javascript;version=1.8",
  enforceDefine: true,
});

define([
  'js/os',
  'js/iframedeck',
  'js/keybindings',
  'js/tab',
], function(
  os,
  IframeDeck,
  keybindings,
  tab
) {

  "use strict";

  IframeDeck.add({url: "http://medium.com"});
})
