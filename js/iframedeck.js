define(["js/eventemitter"], function(EventEmitter) {

  "use strict";

  HTMLIFrameElement.prototype.show = function() {
    this.removeAttribute("hidden");
    if (window.IS_PRIVILEGED) {
      this.setVisible(true);
    }
  }

  HTMLIFrameElement.prototype.hide = function() {
    this.setAttribute("hidden", "true");
    if (window.IS_PRIVILEGED) {
      this.setVisible(false);
    }
  }

  document.registerElement("browser-tab");

  let _iframeArray = [];
  let _selectIndex = -1;

  let _iframeParent = document.querySelector(".iframes");

  const IframeDeck = {

    add: function(options={}) {
      let iframe = document.createElement("iframe");
      iframe.setAttribute("mozbrowser", "true");
      iframe.setAttribute("flex", "1");
      iframe.setAttribute("remote", "true");

      _iframeParent.appendChild(iframe);
      _iframeArray.push(iframe);

      this.emit("add", {
        iframe: iframe,
        index: _iframeArray.length - 1
      });

      if (options.url) {
        if (window.IS_PRIVILEGED) {
          iframe.src = options.url;
        } else {
          iframe.src = "data:," + options.url;
        }
      }

      if (options.select || _selectIndex < 0) {
        this.select(iframe);
      } else {
        iframe.hide();
      }

      return iframe;
    },

    remove: function(iframe) {
      let index = _iframeArray.indexOf(iframe);
      if (index < 0) {
        throw new Error("Unknown iframe");
      }

      if (_iframeArray.length == 1) {
        throw new Error("Deck has only one iframe");
      }

      if (index == _selectIndex) {
        let newSelectIndex;
        if (index == _iframeArray.length - 1) {
          newSelectIndex = index - 1;
        } else {
          newSelectIndex = index + 1;
        }
        this.select(_iframeArray[newSelectIndex]);
      }

      if (_selectIndex > index) {
        _selectIndex--;
      }

      _iframeArray.splice(index, 1);
      iframe.remove();

      this.emit("remove", {
        iframe: iframe
      });
    },

    select: function(iframe) {
      let index = _iframeArray.indexOf(iframe);
      if (index < 0) {
        throw new Error("Unknown iframe");
      }

      if (_selectIndex > -1) {
        let selectedIframe = _iframeArray[_selectIndex];
        selectedIframe.hide();
        this.emit("unselect", {
          iframe: selectedIframe,
          index: _selectIndex
        });
      }

      _selectIndex = index;
      iframe.show();

      this.emit("select", {
        iframe: iframe,
        index: index
      });
    },

    selectNext: function() {
      let newSelectIndex = _selectIndex + 1;
      if (newSelectIndex == _iframeArray.length) {
        newSelectIndex = 0;
      }
      this.select(_iframeArray[newSelectIndex]);
    },

    selectPrevious: function() {
      let newSelectIndex = _selectIndex - 1;
      if (newSelectIndex < 0) {
        newSelectIndex = _iframeArray.length - 1;
      }
      this.select(_iframeArray[newSelectIndex]);
    },

    getSelected: function() {
      return _iframeArray[_selectIndex];
    },

    getCount: function() {
      return _iframeArray.length;
    },
  }

  IframeDeck[Symbol.iterator] = function*() {
    for (let iframe of _iframeArray) {
      yield iframe;
    }
  }

  EventEmitter.decorate(IframeDeck);
  IframeDeck.add({url: "http://medium.com"});

  return IframeDeck;
});
