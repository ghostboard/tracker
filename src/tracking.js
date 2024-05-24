(function (win, doc, loc) {
  var init = true;
  var visitID = null;
  var scriptEl = doc.querySelector('[src*="t.ghostboard.io"]');
  var API = 'https://api.ghostboard.io/';
  var BLOG_ID = scriptEl && scriptEl.getAttribute('data-gbid');
  if (!BLOG_ID) {
    console.warn(
      '👉 Please check your Ghostboard tracking code, it looks invalid. More info: https://ghostboard.io/blog/how-to-setup-ghostboard/'
    );
    return false;
  }

  function addEvent(element, event, fn) {
    if (element.addEventListener) {
      element.addEventListener(event, fn, false);
      return true;
    } else if (element.attachEvent) {
      return element.attachEvent('on' + event, fn);
    }
    element['on' + event] = fn;
  }

  function getAjax() {
    try {
      return new XMLHttpRequest();
    } catch (e) {}
    try {
      return new ActiveXObject('Msxml2.XMLHTTP.6.0');
    } catch (e) {}
    try {
      return new ActiveXObject('Msxml2.XMLHTTP.3.0');
    } catch (e) {}
    try {
      return new ActiveXObject('Msxml2.XMLHTTP');
    } catch (e) {}
    try {
      return new ActiveXObject('Microsoft.XMLHTTP');
    } catch (e) {}
    return false;
  }

  function sendHeartbeat(id, t, e) {
    var img = new Image();
    img.src =
      API +
      'views/' +
      id +
      '/heartbeat?t=' +
      t +
      '&e=' +
      encodeURIComponent(e);
  }

  function sendClick(data) {
    var img = new Image();
    var path = API + 'v2/clicks/'+ BLOG_ID + '?';
    for (var i = 0, total = data.length; i < total; i++) {
      path +=
        (i === 0 ? '' : '&') +
        data[i][0] +
        '=' +
        encodeURIComponent(data[i][1]);
    }
    img.src = path;
  }

  function getReferrer() {
    var referrer = '';
    try {
      referrer = win.top.document.referrer;
    } catch (e) {
      if (win.parent) {
        try {
          referrer = win.parent.document.referrer;
        } catch (e2) {
          referrer = '';
        }
      }
    }
    return referrer === '' ? doc.referrer : referrer;
  }

  function getIsMobileDevice() {
    try {
      var regex =
        /Mobile|Tablet|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune|Playbook/i;
      return regex.test(win.navigator.userAgent);
    } catch (e) {
      return false;
    }
  }
  var isMobile = getIsMobileDevice();

  function runGB() {
    try {
      if (!init) {
        return false;
      }
      init = false;
      var visitTime = 0;
      var rssPath = doc.querySelector("link[type='application/rss+xml']");
      var baseUrl = doc.querySelector('head base');
      var anyBase = rssPath || baseUrl;
      var rootURL = anyBase ? anyBase.href : '';
      var shortcut = doc.querySelector("link[rel='shortcut icon']");
      var icon = doc.querySelector("link[rel='icon']");
      var anyIcon = shortcut || icon;
      var favicon = anyIcon ? anyIcon.href : '';
      var locationData = loc || win.location || doc.location;
      var ghostAPIEnable = typeof ghost !== 'undefined' && ghost && ghost.url && ghost.url.api();
      if (ghostAPIEnable) {
        var ghostAPI = ghost.url.api();
        rootURL = ghostAPI.substring(0, ghostAPI.indexOf('/ghost/') + 1);
        if (rootURL.indexOf('//') === 0) {
          rootURL = locationData.protocol + rootURL;
        }
      } else {
        var hasRss = rootURL && rootURL.indexOf('/rss/') !== -1;
        if (hasRss) {
          rootURL = rootURL.substring(0, rootURL.length - 4);
        } else if (!rootURL) {
          rootURL = locationData.origin + '/';
        }
      }
      var visitData = {
        A: rootURL,
        C: navigator.language || navigator.userLanguage,
        F: locationData.origin,
        I: favicon,
        U: locationData.href || doc.url,
        V: 4,
      };
      var referrer = getReferrer();
      if (referrer) {
        visitData.D = referrer;
      }
      var metaGenerator = doc.head.querySelector('[name=generator]');
      if (metaGenerator && metaGenerator.content) {
        visitData.E = metaGenerator.content;
      }
      var startDate = null;
      var lastHearbeat = null;
      var savingVisit = false;
      var newVisit = function (e) {
        if (visitID || savingVisit) {
          return false;
        }
        savingVisit = true;
        visitData.G = e;
        startDate = new Date().getTime();
        visitTime = 0;
        var xhr = getAjax();
        xhr.open('POST', API + 'v3/views/' + BLOG_ID, true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xhr.onreadystatechange = function () {
          savingVisit = false;
          if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            visitID = response.id;
            if (response.tc) {
              listenToClicks();
            }
          }
        };
        xhr.send(JSON.stringify(visitData));
      };
      var heartbeat = function (event, isExit) {
        var now = new Date().getTime();
        var onlyOnce =
          !lastHearbeat || (lastHearbeat && now - lastHearbeat >= 1000);
        var proceed = visitID && (onlyOnce || isExit);
        if (proceed) {
          lastHearbeat = now;
          sendHeartbeat(visitID, visitTime, event);
        }
      };
      var updateTime = function () {
        var now = new Date().getTime();
        var spentTime = now - startDate;
        if (spentTime > 0) {
          visitTime += parseInt(spentTime / 1000, 10);
          startDate = now;
        }
      };
      var handleEnter = function (e) {
        var now = new Date().getTime();
        if (!visitID) {
          newVisit(e);
        } else {
          startDate = now;
        }
      };
      var handleExit = function (e) {
        var updateEvents = [
          'blur',
          'focusout',
          'pagehide',
          'visibilityState:hidden',
        ];
        if (updateEvents.indexOf(e) !== -1) {
          updateTime();
        }
        heartbeat(e, true);
        if (isMobile) {
          visitID = null;
        }
      };
      addEvent(doc, 'visibilitychange', function () {
        if (doc.visibilityState === 'hidden') {
          handleExit('visibilityState:hidden');
        }
        if (doc.visibilityState === 'visible') {
          handleEnter('visibilityState:visible');
        }
      });
      addEvent(win, 'focus', function () {
        handleEnter('focus');
      });
      addEvent(win, 'focusin', function () {
        handleEnter('focusin');
      });
      addEvent(win, 'pageshow', function () {
        handleEnter('pageshow');
      });
      addEvent(win, 'blur', function () {
        handleExit('blur');
      });
      addEvent(win, 'focusout', function () {
        handleExit('focusout');
      });
      addEvent(win, 'pagehide', function () {
        handleExit('pagehide');
      });
      addEvent(win, 'beforeunload', function () {
        handleExit('beforeunload');
      });
      addEvent(win, 'unload', function () {
        handleExit('unload');
      });

      var isActive =
        (typeof doc.hasFocus === 'function' && doc.hasFocus()) ||
        doc.visibilityState === 'visible';
      if (isActive) {
        handleEnter('document-focus');
      }
    } catch (e) {}
  }

  function listenToClicks() {
    var links = doc.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
      addEvent(links[i], 'click', function (e) {
        onLinkClick(e);
      });
    }
  }

  function onLinkClick(e) {
    if (!e) {
      return false;
    }
    var target = e.target || e.currentTarget;
    var text = target.innerText || target.title;
    var image = target.currentSrc;
    var proceed = target && (text || image);
    if (!proceed) {
      return false;
    }
    var params = [];
    if (target.href) {
      params.push(['l', target.href]);
    }
    if (text) {
      params.push(['a', text]);
    } else if (image) {
      params.push(['i', image]);
    }
    sendClick(params);
  }

  function startup() {
    addEvent(doc, 'DOMContentLoaded', function () {
      runGB();
    });
    addEvent(doc, 'readystatechange', function () {
      runGB();
    });
    addEvent(win, 'load', function () {
      runGB();
    });
    var isReady = doc && doc.readyState && doc.readyState === 'complete';
    if (isReady) {
      runGB();
    }
  }

  startup();
})(window, document, location);
