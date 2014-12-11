define([
  'js/iframedeck'
], function(IframeDeck) {

  "use strict";

  const Cmds = {
    goBack: function() {
      IframeDeck.getSelected().goBack();
    },
    goForward: function() {
      IframeDeck.getSelected().goForward();
    },
    reload: function() {
      IframeDeck.getSelected().reload();
    },
    stop: function() {
      IframeDeck.getSelected().stop();
    },
    createNewTab: function(url) {
      IframeDeck.add({url:url,select:true});
    },
    selectNextTab: function() {
      IframeDeck.selectNext();
    },
    selectPreviousTab: function() {
      IframeDeck.selectPrevious();
    },
    focusURLBar: function() {
      document.querySelector(".urlinput").focus();
      document.querySelector(".urlinput").select();
    },
    focusSearchBar: function() {
      document.querySelector(".searchinput").focus();
      document.querySelector(".searchinput").select();
    },
    closeTab: function() {
      IframeDeck.remove(IframeDeck.getSelected());
    },
    zoomIn: function() {
      // FIXME:
      // IframeDeck.getSelected().zoomIn();
    },
    zoomOut: function() {
      // FIXME:
      // IframeDeck.getSelected().zoomOut();
    },
    resetZoom: function() {
      // FIXME:
      // IframeDeck.getSelected().resetZoom();
    },
  }

  return Cmds;

});
