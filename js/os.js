define(function() {
  // Detect Operating System
  if (navigator.appVersion.indexOf("Win") >= 0) {
    window.OS = "windows";
    document.body.setAttribute("os", "windows");
  }
  if (navigator.appVersion.indexOf("Mac") >= 0) {
    window.OS = "osx";
    document.body.setAttribute("os", "osx");
  }
  if (navigator.appVersion.indexOf("X11") >= 0) {
    window.OS = "linux";
    document.body.setAttribute("os", "linux");
  }

  // IS_PRIVILEGED is false if Firefox.html runs in a regular browser,
  // with no Browser API.

  window.IS_PRIVILEGED = !!HTMLIFrameElement.prototype.setVisible;
});
