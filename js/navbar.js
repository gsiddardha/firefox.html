define([
  'js/commands',
  'js/browser'
], function(
  Cmds,
  gBrowser
) {
"use strict";

document.querySelector(".back-button").onclick = () => Cmds.goBack();
document.querySelector(".forward-button").onclick = () => Cmds.goForward();
document.querySelector(".reload-button").onclick = () => Cmds.reload();
document.querySelector(".stop-button").onclick = () => Cmds.stop();

let urlbar = document.querySelector(".urlbar");
let urlinput = document.querySelector(".urlinput");

urlinput.addEventListener("focus", () => {
  urlinput.select();
  urlbar.classList.add("focus");
})

urlinput.addEventListener("blur", () => {
  urlbar.classList.remove("focus");
})

urlinput.addEventListener("keypress", (e) => {
  if (e.keyCode == 13) {
    gBrowser.urlInputChanged()
  }
});

urlinput.addEventListener("input", () => {
  gBrowser.selectedTab.userInput = urlinput.value;
});

let searchbar = document.querySelector(".searchbar");
let searchinput = document.querySelector(".searchinput");
searchinput.addEventListener("focus", () => {
  searchinput.select();
  searchbar.classList.add("focus");
})
searchinput.addEventListener("blur", () => searchbar.classList.remove("focus"))
searchinput.addEventListener("keypress", (e) => {
  if (e.keyCode == 13) {
    gBrowser.searchInputChanged()
  }
});

});
  urlInputChanged: function() {
    let urlinput = document.querySelector(".urlinput");
    let text = urlinput.value;
    let url = this.preprocessUrlInput(text);
    this.selectedTab.iframe.src = url;
    this.selectedTab.iframe.focus();
  },

  searchInputChanged: function() {
    let searchinput = document.querySelector(".searchinput");
    let text = searchinput.value;
    let url = this._urlTemplate.replace('{searchTerms}', encodeURIComponent(text));
    this.selectedTab.iframe.src = url;
    this.selectedTab.iframe.focus();
  },

  selectedTabHasChanged: function() {
    let tab = this.selectedTab;

    document.title = "Firefox - " + tab.title;;

    if (tab.loading) {
      document.body.classList.add("loading");
    } else {
      document.body.classList.remove("loading");
    }

    let urlinput = document.querySelector(".urlinput");

    if (tab.userInput) {
      urlinput.value = tab.userInput;
    } else {
      urlinput.value = tab.location;
    }

    if (!window.IS_PRIVILEGED) {
      return;
    }

    if (tab.securityState == "secure") {
      document.body.classList.add("ssl");
      if (tab.securityExtendedValidation) {
        document.body.classList.add("sslev");
      }
    } else {
      document.body.classList.remove("ssl");
      document.body.classList.remove("sslev");
    }

    if (tab.hasIframe()) {
      let iframe = tab.iframe;

      iframe.getCanGoBack().onsuccess = r => {
        // Make sure iframe is still selected
        if (tab != this.selectedTab) {
          return;
        }
        if (r.target.result) {
          document.querySelector(".back-button").classList.remove("disabled");
        } else {
          document.querySelector(".back-button").classList.add("disabled");
        }
      }
      iframe.getCanGoForward().onsuccess = r => {
        // Make sure iframe is still selected
        if (tab != this.selectedTab) {
          return;
        }
        if (r.target.result) {
          document.querySelector(".forward-button").classList.remove("disabled");
        } else {
          document.querySelector(".forward-button").classList.add("disabled");
        }
      }
    } else {
      document.querySelector(".back-button").classList.add("disabled");
      document.querySelector(".forward-button").classList.add("disabled");
    }

  },

  preprocessUrlInput: function(input) {
    if (UrlHelper.isNotURL(input)) {
      return this._urlTemplate.replace('{searchTerms}', encodeURIComponent(input));
    }

    if (!UrlHelper.hasScheme(input)) {
      input = 'http://' + input;
    }

    return input;
  },
