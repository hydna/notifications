(function () {
  var hydnaurl;
  var startup;
  var panes;

  if (typeof HYDNA_URL == "undefined") {
    hydnaurl = "notifications.hydna.net/"
  } else {
    hydnaurl = HYDNA_URL + "/";
  }

  // Get a random channel so that we get a unqiue experience
  hydnaurl += String(~~(Math.random() * 0xFFF) + 1) + "/";

  panes = {};
  panes[hydnaurl + "im"] = document.getElementById("im");
  panes[hydnaurl + "mail"] = document.getElementById("mail");
  panes[hydnaurl + "phone"] = document.getElementById("phone");

  startup = document.getElementById("startup-notification");
  startup.className = "hidden";

  setTimeout(function () {
    startup.className = "";
    setTimeout(function () {
      startup.className = "hidden";
    }, 5000);
  }, 2000);


  function hasAnimationSupport () {
    var body = document.getElementsByTagName("body")[0];
    return "animationName" in body.style ||
           "MozAnimationName" in body.style ||
           "webkitAnimationName" in body.style ||
           "OAnimationName" in body.style ||
           "msAnimationName" in body.style ||
           false;
  }


  function incr (elem) {
    var counter = getcounter(elem);
    var current = parseInt(counter.innerHTML, 10);
    current = isNaN(current) ? 0 : current;
    counter.innerHTML = ++current;
    startshake(elem);
  }


  function decr (elem) {
    var counter = getcounter(elem);
    var current = parseInt(counter.innerHTML, 10);
    current = isNaN(current) ? 0 : current;
    counter.innerHTML = --current;
    if (counter.innerHTML == "0") {
      counter.innerHTML = "";
    }
    startshake(elem);
  }


  function set (elem, value) {
    var counter = getcounter(elem);
    if (isNaN(value)) {
      counter.innerHTML = '';
    } else {
      counter.innerHTML = parseInt(value, 10);
    }
    startshake(elem);
  }


  function reset (elem) {
    var counter = getcounter(elem);
    counter.innerHTML = "";
  }


  function startshake (elem) {
    if (hasAnimationSupport() == false) return;
    elem.className = "pane shake";
    setTimeout (function () {
      elem.className = "pane";
    }, 400);
  }


  function getcounter (parent) {
    for (var i = 0; i < parent.childNodes.length; i++) {
      if (parent.childNodes[i].className == "count") {
        return parent.childNodes[i];
      }
    }
  }

  function onopen (event) {
    var url = stripProtocol(this.url);
    panes[url].className = "pane";
  }


  function onclose (event) {
    var url = stripProtocol(this.url);
    panes[url].className = "pane disabled";
  }


  function onmessage (event) {
    var url = stripProtocol(this.url);
    var command;
    var arg;

    hideinstructions();

    command = typeof event.data == "string" ? event.data.toLowerCase() : "";
    arg = command.split(" ")[1];
    command = command.split(" ")[0];

    switch (command) {

      case "incr":
        incr(panes[url]);
        break;

      case "decr":
        decr(panes[url]);
        break;

      case "reset":
        reset(panes[url]);
        break;

      case "set":
        set(panes[url], arg);
        break;
    }
  }


  function onerror (event) {
    console.error(event.message);
  }


  function onpaneclick (event) {
    hideinstructions();

    if (/disabled/.test(this.className)) {
      return;
    }

    if (/instructions/.test(this.className) == false) {
      this.className = "pane instructions";
      event.preventDefault();
      event.stopPropagation();
    }
  }


  function hideinstructions () {
    for (var url in panes) {
      if (/instructions/.test(panes[url].className)) {
        panes[url].className = "pane";
      }
    }
  }


  function setuppane (pane, url) {
    var urls = pane.getElementsByTagName("i");
    var channel;

    pane.addEventListener("click", onpaneclick, false);

    for (var i = 0; i < urls.length; i++) {
      urls[i].innerHTML = url;
    }

    channel = new HydnaChannel(url, "r");
    channel.onopen = onopen;
    channel.onmessage = onmessage;
    channel.onerror = onerror;
  }


  function stripProtocol (url) {
    return url.replace(/^(http:\/\/|https:\/\/)/, '');
  }


  for (var url in panes) {
    setuppane(panes[url], url);
  }

  window.addEventListener("click", hideinstructions, false);

})();
