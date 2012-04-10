(function () {
  var channelOffset = 600000;
  var hydnaurl;
  var startup;
  var panes;

  if (typeof HYDNA_URL == "undefined") {
    hydnaurl = "notifications.hydna.net/"
  } else {
    hydnaurl = HYDNA_URL + "/";
  }

  panes = [
    document.getElementById("im"),
    document.getElementById("mail"),
    document.getElementById("phone")
  ];


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
    var realid = this.id - channelOffset;
    panes[realid].className = "pane";
  }


  function onclose (event) {
    var realid = this.id - channelOffset;
    panes[realid].className = "pane disabled";
  }


  function onmessage (event) {
    var realid = this.id - channelOffset;
    var command;
    var arg;

    hideinstructions();

    command = typeof event.data == "string" ? event.data.toLowerCase() : "";
    arg = command.split(" ")[1];
    command = command.split(" ")[0];

    switch (command) {

      case "incr":
        incr(panes[realid]);
        break;

      case "decr":
        decr(panes[realid]);
        break;

      case "reset":
        reset(panes[realid]);
        break;

      case "set":
        set(panes[realid], arg);
        break;
    }
  }


  function onerror (event) {
    console.error(event.message);
  }


  function onpaneclick (event) {

    if (/disabled/.test(this.className)) {
      return;
    }

    if (/instructions/.test(this.className) == false) {
      hideinstructions();
      this.className = "pane instructions";
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function hideinstructions () {
    for (var i = 0; i < panes.length; i++) {
      if (/instructions/.test(panes[i].className)) {
        panes[i].className = "pane";
      }
    }
  }

  function setuppane (pane, id) {
    var urls = pane.getElementsByClassName("url");
    var realid = channelOffset + id;
    var chanurl = hydnaurl + realid;
    var channel;

    pane.addEventListener("click", onpaneclick, false);

    for (var i = 0; i < urls.length; i++) {
      urls[i].innerHTML = chanurl;
    }

    channel = new HydnaChannel(chanurl, "r");
    channel.onopen = onopen;
    channel.onmessage = onmessage;
    channel.onerror = onerror;
  }


  for (var i = 0; i < panes.length; i++) {
    setuppane(panes[i], i);
  }


  window.addEventListener("click", hideinstructions, false);

})();
