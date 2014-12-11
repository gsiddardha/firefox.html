define(['js/iframedeck'], function(IframeDeck) {

  "use strict";

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2;

  const allTabs = new Map();

  function Tab(iframe) {
    let hbox = document.createElement("hbox");
    hbox.className = "tab";
    hbox.setAttribute("align", "center");

    let throbber = document.createElement("div");
    throbber.className = "throbber";

    let favicon = document.createElement("img");
    favicon.className = "favicon";

    let title = document.createElement("hbox");
    title.className = "title";

    let button = document.createElement("button");
    button.className = "close-button";

    button.onclick = (event) => {
      event.stopPropagation();
      IframeDeck.remove(iframe);
    };

    hbox.onclick = (event) => {
      IframeDeck.select(iframe);
    };

    hbox.appendChild(throbber);
    hbox.appendChild(favicon);
    hbox.appendChild(title);
    hbox.appendChild(button);

    this.clearTabData();

    this._dom = hbox;

    this.updateDom();

    this._iframe = iframe;
    this._trackIframe();

    document.querySelector(".tabstrip").appendChild(this._dom);
  }

  Tab.prototype = {

    get iframe() {
      return this._iframe;
    },

    get dom() {
      return this._dom;
    },

    destroy: function() {
      this._untrackIframe();
      this._iframe = null;
      this.dom.remove();
    },

    select: function() {
      this.dom.classList.add("selected");
    },

    unselect: function() {
      this.dom.classList.remove("selected");
    },

    _events: ["mozbrowserasyncscroll", "mozbrowserclose", "mozbrowsercontextmenu",
              "mozbrowsererror", "mozbrowsericonchange", "mozbrowserloadend",
              "mozbrowserloadstart", "mozbrowserlocationchange", "mozbrowseropenwindow",
              "mozbrowsersecuritychange", "mozbrowsershowmodalprompt", "mozbrowsertitlechange",
              "mozbrowserusernameandpasswordrequired"],
    _trackIframe: function() {
      for (let eventName of this._events) {
        this.iframe.addEventListener(eventName, this);
      }
    },
    _untrackIframe: function() {
      for (let eventName of this._events) {
        this.iframe.removeEventListener(eventName, this);
      }
    },

    get loading() { return this._loading },
    get title() { return this._title},
    get location() { return this._location},
    get favicon() { return this._favicon},
    get securityState() { return this._securityState},
    get securityExtendedValidation() { return this._securityExtendedValidation},

    updateDom: function() {
      if (this.loading) {
        this.dom.classList.add("loading");
      } else {
        this.dom.classList.remove("loading");
      }

      if (this.title) {
        this.dom.querySelector(".title").textContent = this.title;
      } else {
        if (this.location) {
          this.dom.querySelector(".title").textContent = this.location;
        } else {
          this.dom.querySelector(".title").textContent = "New Tab";
        }
      }

      let faviconImg = this.dom.querySelector(".favicon");
      if (this.favicon) {
        faviconImg.src = this.favicon;
      } else {
        faviconImg.removeAttribute("src");
      }
    },

    /* FIXME: this should move into a iframe wrapper */
    zoom: 1,
    zoomIn: function() {
      this.zoom += 0.1;
      this.zoom = Math.min(MAX_ZOOM, this.zoom);
      this._applyZoom();
    },
    zoomOut: function() {
      this.zoom -= 0.1;
      this.zoom = Math.max(MIN_ZOOM, this.zoom);
      this._applyZoom();
    },
    resetZoom: function() {
      this.zoom = 1;
      this._applyZoom();
    },
    _applyZoom: function() {
      if (this.hasIframe()) {
        this.iframe.zoom(this.zoom);
      }
    },

    clearTabData: function() {
      this._loading = false;
      this._title = "";
      this._location = "";
      this._favicon = "";
      this._securityState = "unsecure";
      this._securityExtendedValidation = false;
    },

    userInput: "",

    handleEvent: function(e) {
      let somethingChanged = true;
      switch(e.type) {
        case "mozbrowserloadstart":
          this.clearTabData();
          this._loading = true;
          break;
        case "mozbrowserloadend":
          this._loading = false;
          break;
        case "mozbrowsertitlechange":
          this._title = e.detail;
          break;
        case "mozbrowserlocationchange":
          this.userInput = "";
          this._location = e.detail;
          break;
        case "mozbrowsericonchange":
          this._favicon = e.detail.href;
          break;
        case "mozbrowsererror":
          this._loading = false;
          break;
        case "mozbrowseropenwindow":
          IframeDeck.add({url:e.detail.url});
          break;
        case "mozbrowsersecuritychange":
          this._securityState = e.detail.state;
          this._securityExtendedValidation = e.detail.extendedValidation;
          break;
        default:
          somethingChanged = false;
      }
      if (somethingChanged) {
        this.updateDom();
      }
    },
  };

  IframeDeck.on("add", (event, detail) => {
    let iframe = detail.iframe;
    let tab = new Tab(iframe);
    allTabs.set(iframe, tab);
    if (iframe == IframeDeck.getSelected()) {
      tab.select();
    }
  });

  IframeDeck.on("remove", (event, detail) => {
    let tab = allTabs.get(detail.iframe);
    if (tab) {
      tab.destroy();
      allTabs.delete(detail.iframe);
    }
  });

  IframeDeck.on("select", (event, detail) => {
    let tab = allTabs.get(detail.iframe);
    if (tab) {
      tab.select();
    }
  });

  IframeDeck.on("unselect", (event, detail) => {
    let tab = allTabs.get(detail.iframe);
    if (tab) {
      tab.unselect();
    }
  });

  for (let iframe of IframeDeck) {
    let tab = new Tab(iframe);
    allTabs.set(iframe, tab);
  }

  let iframe = IframeDeck.getSelected();
  let tab = allTabs.get(iframe);
  tab.select();

  /* Build curved tabs */

  if (document.readyState == "complete") {
    BuildCurvedTabs();
  } else {
    document.addEventListener("readystatechange", onDocumentLoaded);
  }

  function onDocumentLoaded() {
    if (document.readyState == "complete") {
      document.removeEventListener("readystatechange", onDocumentLoaded);
      BuildCurvedTabs();
    }
  }

  function BuildCurvedTabs() {
    let curveDummyElt = document.querySelector(".dummy-tab-curve");
    let style = window.getComputedStyle(curveDummyElt);

    let curveBorder = style.getPropertyValue("--curve-border");
    let curveGradientStart = style.getPropertyValue("--curve-gradient-start");
    let curveGradientEnd = style.getPropertyValue("--curve-gradient-end");
    let curveHoverBorder = style.getPropertyValue("--curve-hover-border");
    let curveHoverGradientStart = style.getPropertyValue("--curve-hover-gradient-start");
    let curveHoverGradientEnd = style.getPropertyValue("--curve-hover-gradient-end");

    let c1 = document.createElement("canvas");
        c1.id = "canvas-tab-selected";
        c1.hidden = true;
        c1.width = 3 * 28;
        c1.height = 28;
    drawBackgroundTab(c1, curveGradientStart, curveGradientEnd, curveBorder);
    document.body.appendChild(c1);

    let c2 = document.createElement("canvas");
        c2.id = "canvas-tab-hover";
        c2.hidden = true;
        c2.width = 3 * 28;
        c2.height = 28;
    drawBackgroundTab(c2, curveHoverGradientStart, curveHoverGradientEnd, curveHoverBorder);
    document.body.appendChild(c2);


    function drawBackgroundTab(canvas, bg1, bg2, borderColor) {
      canvas.width = window.devicePixelRatio * canvas.width;
      canvas.height = window.devicePixelRatio * canvas.height;
      let ctx = canvas.getContext("2d");
      let r = canvas.height;
      ctx.save();
      ctx.beginPath();
      drawCurve(ctx,r);
      ctx.lineTo(3 * r, r);
      ctx.lineTo(0, r);
      ctx.closePath();
      ctx.clip();

      // draw background
      let lingrad = ctx.createLinearGradient(0,0,0,r);
      lingrad.addColorStop(0, bg1);
      lingrad.addColorStop(1, bg2);
      ctx.fillStyle = lingrad;
      ctx.fillRect(0,0,3*r,r);

      // draw border
      ctx.restore();
      ctx.beginPath();
      drawCurve(ctx,r);
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }

    function drawCurve(ctx,r) {
      let firstLine = 1 / window.devicePixelRatio;
      ctx.moveTo(r * 0, r * 0.984);
      ctx.bezierCurveTo(r * 0.27082458, r * 0.95840561,
                        r * 0.3853096, r * 0.81970962,
                        r * 0.43499998, r * 0.5625);
      ctx.bezierCurveTo(r * 0.46819998, r * 0.3905,
                        r * 0.485, r * 0.0659,
                        r * 0.95,  firstLine);
      ctx.lineTo(r + r * 1.05, firstLine);
      ctx.bezierCurveTo(3 * r - r * 0.485, r * 0.0659,
                        3 * r - r * 0.46819998, r * 0.3905,
                        3 * r - r * 0.43499998, r * 0.5625);
      ctx.bezierCurveTo(3 * r - r * 0.3853096, r * 0.81970962,
                        3 * r - r * 0.27082458, r * 0.95840561,
                        3 * r - r * 0, r * 0.984);
    }
  }

});
