(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var base = require('./src/Ad.js');
var GoogleBase = require('./src/GoogleAd.js');
var WechatBase = require('./src/WechatAd.js');
module.exports = {
    EVENTS: base.EVENTS,
    AD_STATUS: base.AD_STATUS,
    AdManager: base.AdManager,
    Ad: base.Ad,
    GoogleAdManager: GoogleBase.GoogleAdManager,
    GoogleAd: GoogleBase.GoogleAd,
    WechatAdManager: WechatBase.WechatAdManager,
    WechatAd: WechatBase.WechatAd,
};
},{"./src/Ad.js":3,"./src/GoogleAd.js":4,"./src/WechatAd.js":5}],2:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Add a listener for a given event.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {EventEmitter}
 * @private
 */
function addListener(emitter, event, fn, context, once) {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function');
  }

  var listener = new EE(fn, context || emitter, once)
    , evt = prefix ? prefix + event : event;

  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
  else emitter._events[evt] = [emitter._events[evt], listener];

  return emitter;
}

/**
 * Clear event by name.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */
function clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) emitter._events = new Events();
  else delete emitter._events[evt];
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Array} The registered listeners.
 * @public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  var evt = prefix ? prefix + event : event
    , handlers = this._events[evt];

  if (!handlers) return [];
  if (handlers.fn) return [handlers.fn];

  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
    ee[i] = handlers[i].fn;
  }

  return ee;
};

/**
 * Return the number of listeners listening to a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Number} The number of listeners.
 * @public
 */
EventEmitter.prototype.listenerCount = function listenerCount(event) {
  var evt = prefix ? prefix + event : event
    , listeners = this._events[evt];

  if (!listeners) return 0;
  if (listeners.fn) return 1;
  return listeners.length;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  return addListener(this, event, fn, context, false);
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  return addListener(this, event, fn, context, true);
};

/**
 * Remove the listeners of a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {*} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    clearEvent(this, evt);
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
      listeners.fn === fn &&
      (!once || listeners.once) &&
      (!context || listeners.context === context)
    ) {
      clearEvent(this, evt);
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
        listeners[i].fn !== fn ||
        (once && !listeners[i].once) ||
        (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else clearEvent(this, evt);
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {(String|Symbol)} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) clearEvent(this, evt);
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],3:[function(require,module,exports){
// var EventEmitter = require('fbemitter').EventEmitter;
// var EventEmitter = require('eventemitter3');
var EventEmitter = require('eventemitter3');
// var async = window.async = require('async');
var EVENTS = {
    LOADED: "loaded",
    LOAD_ERROR: "load_error",
    AD_START: "ad_start",
    AD_SKIPPED: "ad_skipped",
    AD_COMPLETE: "ad_complete",
    AD_END: "ad_end",
    AD_CLICKED: "ad_clicked",
    AD_DESTROYED: "ad_destroyed",
};

var AD_STATUS = {
    FRESH: "FRESH",
    LOADING: "LOADING",
    LOADED: "LOADED",
    LOAD_FAILED: "LOAD_FAILED",
    DESTROYED: "DESTROYED",
};

var AdManager = function () {
};
var proto = {
    inited: null,
    options: null,
    _adIndex: null,
    _adCache: null,
    _initTimeoutId: null,
    init: function (options, callback) {
        this.inited = false;
        this._adCache = {};
        this.options = options;

        var Me = this;
        this.doInit(function(err) {
            Me.inited = true;
            callback && callback(err);
        });
    },
    // user to implement
    doInit: function (callback) {
        if (callback) {
            setTimeout(function () {
                callback(null);
            }, 30);
        }
    },
    createAd: function (options, name) {
        var ad = this.doCreateAd();
        name = name || this._generateName();
        ad.init(name, this, options);
        this._adCache[name] = ad;
        return ad;
    },
    // user to implement
    doCreateAd: function () {
        return new Ad();
    },
    destroyAd: function (ad) {
        delete this._adCache[ad.name];
        ad.destroy();
        this.doDestroyAd(ad);
        return;
    },
    // user to implement
    doDestroyAd: function(name) {
        return;
    },
    getAd: function (name) {
        return this._adCache[name];
    },
    _generateName: function () {
        return 'ad_' + (++this._adIndex);
    },
};
for (var p in proto) {
    AdManager.prototype[p] = proto[p];
}

var Ad = function () {
    this.destroyed = false;
}
var AdProto = {
    status: null,
    name: null,
    manager: null,
    options: null,
    _loadTimeoutId: null,
    loadTask: null,
    showTask: null,
    init: function (name, manager, options) {
        this.loadTask = new EventEmitter();
        this.showTask = new EventEmitter();
        this.name = name;
        this.manager = manager;
        this.options = options;
        this.status = AD_STATUS.FRESH;
        this.doInit();
    },
    // user to implement
    doInit: function () {
        return;
    },
    load: function () {
        var loadTask = this.loadTask;
        loadTask.removeAllListeners();
        this.status = AD_STATUS.LOADING;
        this.doLoad();
        loadTask.on(EVENTS.LOADED, function() {
            this.status = AD_STATUS.LOADED;
        }, this);
        loadTask.on(EVENTS.LOAD_ERROR, function() {
            this.status = AD_STATUS.LOAD_FAILED;
        }, this);
        return this.loadTask;
    },
    // user to implement
    doLoad: function() {
        var Me = this;
        setTimeout(function () {
            Me.loadTask.emit(EVENTS.LOADED);
        }, 30);
    },
    show: function () {
        this.showTask.removeAllListeners();
        this.doShow();
        return this.showTask;
    },
    // user to implement
    doShow: function() {
        var Me = this;
        setTimeout(function () {
            Me.showTask.emit(EVENTS.AD_COMPLETE);
            Me.showTask.emit(EVENTS.AD_END);
        }, 30);
    },
    destroy: function () {
        this.doDestroy();
        this.loadTask.removeAllListeners();
        this.showTask.removeAllListeners();
        this.name = null;
        this.options = null;
        this.manager = null;
        return;
    },
    // user to implement
    doDestroy: function () {
        return;
    },
}
for (var p in AdProto) {
    Ad.prototype[p] = AdProto[p];
}

module.exports = {
    EVENTS: EVENTS,
    AdManager: AdManager,
    Ad: Ad,
    AD_STATUS: AD_STATUS,
};
},{"eventemitter3":2}],4:[function(require,module,exports){
var base = require('./Ad.js');
var EVENTS = base.EVENTS;
var AdManager = base.AdManager;
var Ad = base.Ad;

var google;
var imasdkJsSrc = '//imasdk.googleapis.com/js/sdkloader/ima3.js';
var GoogleAdManager = function() {
    AdManager.call(this);
};

var GoogleAdManagerProto = {
    adsLoader: null,
    _containerElement: null,

    doInit: function(callback) {
        var Me = this;
        window['adsbygoogle'] = window['adsbygoogle'] || [];
        includeJS(imasdkJsSrc, function () {
            google = window['google'];
            Me._initAdLoader();
            callback(null);
        }, function(err) {
            callback(err);
        });
    },

    _initAdLoader: function() {
        var options = this.options;
        var adDisplayContainer = this._createAdDisplayContainer(options);
        var adsLoader = this.adsLoader = new google.ima.AdsLoader(adDisplayContainer);
        var Me = this;
        adsLoader.addEventListener(
            google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
            function (adsManagerLoadedEvent) {
                var requestContentObject = adsManagerLoadedEvent.getUserRequestContext();
                var name = requestContentObject.name;
                var ad = Me.getAd(name);
                if (!ad) {
                    return;
                }
                var adsManager = adsManagerLoadedEvent.getAdsManager({
                    currentTime: 0,
                    duration: 60 * 10,
                }, ad.adsRenderingSettings);

                ad._onAdsManagerLoaded(adsManager);
            },
            false);

        adsLoader.addEventListener(
            google.ima.AdErrorEvent.Type.AD_ERROR,
            function (adErrorEvent) {
                var requestContentObject = adErrorEvent.getUserRequestContext();
                var name = requestContentObject.name;
                var ad = Me.getAd(name);
                if (!ad) {
                    return;
                }
                var error = adErrorEvent.getError();
                ad._onAdsLoadError(error);
            },
            false);
    },

    doCreateAd: function() {
        return new GoogleAd();
    },

    displayContainer: function() {
        this._displayContainerElement(true);
    },
    hideContainer: function() {
        this._displayContainerElement(false);
    },

    _createAdDisplayContainer: function(options) {
        var containerElement;
        var containerStyle;
        if (options) {
            containerElement = options.containerElement;
            containerStyle = options.containerStyle;
        }
        if (!containerElement) {
            containerElement = this._createContainerElement();
        } else if (typeof containerElement === "string") {
            containerElement = document.getElementById(containerElement);
        }

        for (var p in containerStyle) {
            containerElement.style[p] = containerStyle[p];
        }

        this._containerElement = containerElement;
        this._displayContainerElement(false);
        var adDisplayContainer = new google.ima.AdDisplayContainer(containerElement);
        adDisplayContainer.initialize();
        return adDisplayContainer;
    },

    _createContainerElement: function() {
        var containerElement = document.createElement("div");
        var width = window.innerWidth;
        var height = window.innerHeight;
        var style = containerElement.style;
        var defaultStyle = {
            "position": "absolute",
            "top": "0px",
            "left": "0px",
            "backgroundColor": "rgba(0,0,0,0.75)",
            "width": width + "px",
            "height": height + "px",
            "z-index": 9E9,
        };
        for (var p in defaultStyle) {
            style[p] = defaultStyle[p];
        }
        document.body.appendChild(containerElement);
        return containerElement;
    },
    _displayContainerElement: function(isShow) {
        this._containerElement.style.display = isShow ? "block" : "none";
    },
    _onAdClosed: function(name) {
        this._displayContainerElement(false);
    },
};
for (var p in AdManager.prototype) {
    GoogleAdManager.prototype[p] = AdManager.prototype[p];
}
for (var p in GoogleAdManagerProto) {
    GoogleAdManager.prototype[p] = GoogleAdManagerProto[p];
}

var GoogleAd = function() {
    Ad.call(this);
}

var GoogleAdProto = {
    _adsManager: null,
    adsRenderingSettings: null,
    doDestroy: function() {
        this._adsManager && this._adsManager.destroy();
        this._adsManager = null;
        this.adsRenderingSettings = null;
    },
    doLoad: function() {
        var options = this.options;
        if (this._adsManager) {
            this._adsManager.destroy();
            this._adsManager = null;
        }
        var src = "https://googleads.g.doubleclick.net/pagead/ads";
        var pageUrl = options.descriptionPage || window.location.href;

        var params = {
            "ad_type": options.adType,
            "client": options.id,
            "description_url": pageUrl,
            "videoad_start_delay": options.delay || 0,
            "hl": options.language || "en",
        };

        if (options.channel) {
            params["channel"] = options.channel;
        }
        if (options.adDuration) {
            params["max_ad_duration"] = options.adDuration;
        }
        if (options.skippableAdDuration) {
            params["sdmax"] = options.skippableAdDuration;
        }

        var query = [];
        for (var p in params) {
            query.push(p + "=" + encodeURIComponent(params[p]));
        }
        var adTagUrl = src + "?" + query.join("&");

        var width = options.width || window.innerWidth;
        var height = options.height || window.innerHeight;
        options.width = width;
        options.height = height;
        // console.log(adTagUrl, width, height);

        var adsRequest = new google.ima.AdsRequest();
        adsRequest["adTagUrl"] = adTagUrl;
        adsRequest["forceNonLinearFullSlot"] = true;
        adsRequest["linearAdSlotWidth"] = width;
        adsRequest["linearAdSlotHeight"] = height;
        adsRequest["nonLinearAdSlotWidth"] = width;
        adsRequest["nonLinearAdSlotHeight"] = height;
        if (options.vastLoadTimeout || options.vastLoadTimeout === 0) {
            adsRequest.vastLoadTimeout = options.vastLoadTimeout;
        }

        var adsRenderingSettings = new google.ima.AdsRenderingSettings();
        adsRenderingSettings["restoreCustomPlaybackStateOnAdBreakComplete"] = true;
        adsRenderingSettings["useStyledNonLinearAds"] = false;
        adsRenderingSettings["useStyledLinearAds"] = false;
        this.adsRenderingSettings = adsRenderingSettings;

        this.manager.adsLoader.requestAds(adsRequest, {
            name: this.name,
        });
    },
    doShow: function() {
        var Me = this;
        this.showTask.once(EVENTS.AD_END, function () {
            Me.manager.hideContainer();
        });
        this.manager.displayContainer();

        var options = this.options;
        var adsManager = this._adsManager;
        adsManager.init(options.width, options.height, google.ima.ViewMode.NORMAL);
        adsManager.start();
        return true;
    },

    _onAdsManagerLoaded: function(adsManager) {
        this._adsManager = adsManager;

        var Me = this;
        var AdEventType = google.ima.AdEvent.Type;

        this.loadTask.emit(EVENTS.LOADED);

        adsManager.addEventListener(AdEventType.STARTED, function () {
            Me.showTask.emit(EVENTS.AD_START);
        });

        adsManager.addEventListener(AdEventType.COMPLETE, function () {
            Me.showTask.emit(EVENTS.AD_COMPLETE);
            Me.showTask.emit(EVENTS.AD_END);
        });

        var skipped = false;
        adsManager.addEventListener(AdEventType.SKIPPED, function () {
            skipped = true;
            Me.showTask.emit(EVENTS.AD_SKIPPED);
            Me.showTask.emit(EVENTS.AD_END);
        });

        adsManager.addEventListener(AdEventType.USER_CLOSE, function () {
            setTimeout(function () {
                if (!skipped) {
                    Me.showTask.emit(EVENTS.AD_COMPLETE);
                    Me.showTask.emit(EVENTS.AD_END);
                }
            }, 100);
        });

        adsManager.addEventListener(AdEventType.CLICK, function () {
            Me.showTask.emit(EVENTS.AD_CLICKED);
        });

    },
    _onAdsLoadError: function(error) {
        this.loadTask.emit(EVENTS.LOAD_ERROR, error);
    },
}
for (var p in Ad.prototype) {
    GoogleAd.prototype[p] = Ad.prototype[p];
}
for (var p in GoogleAdProto) {
    GoogleAd.prototype[p] = GoogleAdProto[p];
}

function includeJS(src, onload, onerror) {
    var script = document.createElement('script');
    script.async = true;

    var done = false;
    script.onload = function (event) {
        if (done) {
            return;
        }
        done = true;
        if (onload) {
            onload(event);
        }
    };
    script.onerror = function (event) {
        if (onerror) {
            onerror(event);
        }
    };

    var head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
    head.insertBefore(script, head.firstChild);

    script.src = src;

    return script;
}

module.exports = {
    GoogleAdManager: GoogleAdManager,
    GoogleAd: GoogleAd,
};

// export interface GoogleAdManagerOptions {
//     containerElement,
//     containerStyle,
//     descriptionPage,
//     adType,
//     id,
//     channel,
//     adDuration,
//     skippableAdDuration,
//     delay,
//     language,
//     vastLoadTimeout,
//     width,
//     height,
// }

},{"./Ad.js":3}],5:[function(require,module,exports){
var base = require('./Ad.js');
var EVENTS = base.EVENTS;
var AdManager = base.AdManager;
var Ad = base.Ad;

var WechatAdManager = function () {
    AdManager.call(this);
}

var WechatAdManagerProto = {
    doInit: function (callback) {
        setTimeout(function() {
            callback(null);
        }, 30);
    },

    doCreateAd: function () {
        return new WechatAd();
    },
};

for (var p in AdManager.prototype) {
    WechatAdManager.prototype[p] = AdManager.prototype[p];
}
for (var p in WechatAdManagerProto) {
    WechatAdManager.prototype[p] = WechatAdManagerProto[p];
}

var WechatAd = function () {
    Ad.call(this);
}

var WechatAdProto = {
    adSingleton: null,
    doLoad: function () {
        var Me = this;
        var options = this.options;
        var adSingletonInited = !!this.adSingleton;
        var wx = options.wx || window['wx']
        var adSingleton = this.adSingleton = wx.createRewardedVideoAd(options);

        if (!adSingletonInited) {
            adSingleton.onLoad(function () {
                // console.log('wechat ad on load');
                Me.loadTask.emit(EVENTS.LOADED);
            })
            adSingleton.onError(function (err) {
                // console.log('wechat ad on error');
                Me.loadTask.emit(EVENTS.LOAD_ERROR, err.errMsg);
            })
            adSingleton.onClose(function (res) {
                // console.log('wechat ad on close');
                if (res && res.isEnded || res === undefined) {
                    Me.showTask.emit(EVENTS.AD_COMPLETE);
                    Me.showTask.emit(EVENTS.AD_END);
                } else {
                    Me.showTask.emit(EVENTS.AD_SKIPPED);
                    Me.showTask.emit(EVENTS.AD_END);
                }
            })
        }
    },
    doShow: function () {
        this.showTask.emit(EVENTS.AD_START);
        this.adSingleton.show();
    },
};

for (var p in Ad.prototype) {
    WechatAd.prototype[p] = Ad.prototype[p];
}

for (var p in WechatAdProto) {
    WechatAd.prototype[p] = WechatAdProto[p];
}

module.exports = {
    WechatAdManager: WechatAdManager,
    WechatAd: WechatAd,
};

},{"./Ad.js":3}],6:[function(require,module,exports){
var AFG = require('./index');
window['AFG'] = AFG;
},{"./index":1}]},{},[6]);
