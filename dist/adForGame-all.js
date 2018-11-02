(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.EventEmitter3 = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}]},{},[1])(1)
});
"use strict";

var AFG = {};

(function() {

    var EventEmitter3 = window.EventEmitter3;

    var google;

    var EVENTS = AFG.EVENTS = {
        LOADED: "loaded",
        LOAD_ERROR: "load_error",
        AD_START: "ad_start",
        AD_SKIPPED: "ad_skipped",
        AD_END: "ad_end",
        AD_CLICKED: "ad_clicked",
    };

    var AdSenseManager = AFG.AdSenseManager = function() {
        // do nothing
    };

    var proto = {
        _adIndex: null,
        _adsLoader: null,
        _adCache: null,
        _containerElement: null,

        disabled: false,

        // adsRequest: null,
        init: function(options, callback) {
            if (this.disabled) {
                return false;
            }

            var Me = this;
            var jsSrc = "//imasdk.googleapis.com/js/sdkloader/ima3.js";
            this._includeJS(jsSrc, function() {
                google = window.google;
                Me._initAdLoader(options);
                callback && callback();
            });

            window.adsbygoogle = window.adsbygoogle || [];
            this._adCache = {};
            this._adIndex = 0;
        },
        _initAdLoader: function(options) {
            var adDisplayContainer = this._createAdDisplayContainer(options);
            var adsLoader = this._adsLoader = new google.ima.AdsLoader(adDisplayContainer);
            adsLoader.addEventListener(
                google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
                this._onAdsManagerLoaded.bind(this),
                false);

            adsLoader.addEventListener(
                google.ima.AdErrorEvent.Type.AD_ERROR,
                this._onAdsManagerLoadError.bind(this),
                false);
        },
        _createAdDisplayContainer: function(options) {
            var containerElement = options.containerElement;
            var containerStyle = options.containerStyle;
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
                "backgroundColor": "black",
                "width": width + "px",
                "height": height + "px",
            };
            for (var p in defaultStyle) {
                style[p] = defaultStyle[p];
            }
            // containerElement.hidden = true;
            document.body.appendChild(containerElement);
            return containerElement;
        },
        _displayContainerElement: function(isShow) {
            this._containerElement.style.display = isShow ? "block" : "none";
        },
        createAd: function(options) {
            if (this.disabled || !google) {
                return false;
            }

            var name = options.name || this._generateName();
            var src = "https://googleads.g.doubleclick.net/pagead/ads";
            var pageUrl = options.descriptionPage || window.location.href;

            var params = {
                "ad_type": options.adType,
                "client": options.id || this.id,
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

            var width = options.width || this.screenWidth || window.innerWidth;
            var height = options.height || this.screenHeight || window.innerHeight;
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

            this._adsLoader.requestAds(adsRequest, {
                name: name,
            });

            var ad = new AdSense();
            ad._init({
                manager: this,
                name: name,
                adOptions: options,
                adsRenderingSettings: adsRenderingSettings,
            });
            this._adCache[name] = ad;
            return ad;
        },

        getAd: function(name) {
            return this._adCache[name];
        },

        showAd: function(name) {
            var ad = this.getAd(name);
            if (this.disabled || !ad) {
                return false;
            }

            return ad.show();
        },

        hideAd: function(name) {
            var ad = this.getAd(name);
            if (this.disabled || !ad) {
                return false;
            }

            this._displayContainerElement(false);

            return true;
        },

        removeAd: function(name) {
            var ad = this.getAd(name);
            if (!ad) {
                return false;
            }

            this._displayContainerElement(false);

            ad.destroy();

            return ad;
        },

        _generateName: function() {
            return "googleAdForGame_" + (++this._adIndex);
        },
        _onAdsManagerLoaded: function(adsManagerLoadedEvent) {
            var requestContentObject = adsManagerLoadedEvent.getUserRequestContext();
            var name = requestContentObject.name;
            var ad = this.getAd(name);
            if (!ad) {
                return;
            }
            var adsManager = adsManagerLoadedEvent.getAdsManager({
                currentTime: 0,
                duration: 1,
            }, ad.adsRenderingSettings);

            var Me = this;
            adsManager.addEventListener(google.ima.AdEvent.Type.USER_CLOSE, function(addEvent) {
                // console.log("USER_CLOSE");
                Me._onAdClosed(name);
            });

            ad._onAdsManagerLoaded(adsManager);
        },
        _onAdsManagerLoadError: function(adErrorEvent) {
            var requestContentObject = adErrorEvent.getUserRequestContext();
            var name = requestContentObject.name;
            var ad = this.getAd(name);
            if (!ad) {
                return;
            }
            var error = adErrorEvent.getError();
            ad._onAdsManagerLoadError(error);
        },
        // onAdEvent: function(name, adEvent) {
        //     var ad = this.getAd(name);
        //     if (!ad) {
        //         return;
        //     }

        //     var type = adEvent.type;
        //     var AdEventType = google.ima.AdEvent.Type;
        // },
        _onAdClosed: function(name) {
            // console.log("on ad closed: ", name);
            // this._containerElement.hidden = true;
            // this._containerElement.style.display = "none";
            this._displayContainerElement(false);
        },
        _displayAd: function(ad) {
            // this._containerElement.hidden = false;
            this._displayContainerElement(true);
        },
        _destroyAd: function(ad) {
            delete this._adCache[ad.name];
        },
        _includeJS: function(src, onload, onerror) {
            var script = document.createElement("script");
            script.async = true;

            var done = false;
            script.onload = function(event) {
                if (done) {
                    return;
                }
                done = true;
                if (onload) {
                    onload(event);
                }
            };
            script.onerror = function(event) {
                if (onerror) {
                    onerror(event);
                }
            };

            var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
            head.insertBefore(script, head.firstChild);

            script.src = src;

            return script;
        },
    };

    for (var p in proto) {
        AdSenseManager.prototype[p] = proto[p];
    }

    var AdSense = AFG.AdSense = function() {
        EventEmitter3.call(this);
    }

    var AdSenseProto = {
        name: null,
        disabled: false,
        _manager: null,
        _adsManager: null,
        _adOptions: null,
        _adsRenderingSettings: null,
        destroyed: null,
        _timeoutId: null,
        _init: function(options) {
            this.destroyed = false;
            this.loaded = false;
            this._adsManager = null;
            this._manager = options.manager;
            this.name = options.name;
            this._adsRenderingSettings = options.adsRenderingSettings;
            this._adOptions = options.adOptions;

            var timeout = options.adOptions.timeout;
            if (timeout) {
                this._timeoutId = setTimeout(function() {
                    this._timeoutId = null;
                    this._onLoadTimeout();
                }.bind(this), timeout);
            }
        },
        show: function() {
            if (this.disabled || this.destroyed) {
                return false;
            }

            var adsManager = this._adsManager;
            if (!adsManager) {
                return false;
            }

            this._manager._displayAd(this);

            var options = this._adOptions;
            adsManager.init(options.width, options.height, google.ima.ViewMode.NORMAL);
            adsManager.start();
            return true;
        },
        isLoaded: function() {
            return !!this._adsManager;
        },
        _onLoadTimeout: function() {
            this.emit(EVENTS.LOAD_ERROR, "load timeout!");
            this.destroy();
        },
        _onAdsManagerLoaded: function(adsManager) {
            if (this.destroyed) {
                return;
            }
            this._adsManager = adsManager;

            var Me = this;
            var AdEventType = google.ima.AdEvent.Type;
            adsManager.addEventListener(AdEventType.STARTED, function() {
                Me.emit(EVENTS.AD_START);
            });

            adsManager.addEventListener(AdEventType.SKIPPED, function() {
                Me.emit(EVENTS.AD_SKIPPED);
            });

            adsManager.addEventListener(AdEventType.USER_CLOSE, function() {
                Me.emit(EVENTS.AD_END);
            });

            adsManager.addEventListener(AdEventType.CLICK, function() {
                Me.emit(EVENTS.AD_CLICKED);
            });
            if (this._timeoutId) {
                clearTimeout(this._timeoutId);
                this._timeoutId = null;
            }
            this.emit(EVENTS.LOADED);
        },
        _onAdsManagerLoadError: function(error) {
            if (this.destroyed) {
                return;
            }
            if (this._timeoutId) {
                clearTimeout(this._timeoutId);
                this._timeoutId = null;
            }
            this.emit(EVENTS.LOAD_ERROR, error);
            this.destroy();
        },
        destroy: function() {
            this._manager._destroyAd(this);
            this._manager = null;

            this.destroyed = true;

            this._adsManager && this._adsManager.destroy();
            this._adsManager = null;

            this._adOptions = null;
            this._adsRenderingSettings = null;
            this.name = null;

            this.removeAllListeners();
        }
    }

    for (var p in EventEmitter3.prototype) {
        AdSense.prototype[p] = EventEmitter3.prototype[p];
    }
    for (var p in AdSenseProto) {
        AdSense.prototype[p] = AdSenseProto[p];
    }


    // don't obscure google's `properties` .
    AdSenseManager._reserved = [
        "google", "ima", "adsbygoogle",
        "AdsLoader", "AdDisplayContainer", "AdsRenderingSettings", "AdsRequest",

        "initialize",
        "requestAds",
        "getUserRequestContext",
        "getAdsManager",
        "getError",
        "EventEmitter3",
        "addEventListener",
        "on",
        "name",
        "bind",
        "emit",
        "destroy",

        "ViewMode",
        "AdErrorEvent",
        "AdEvent", "AdEventType",
        "AdsManagerLoadedEvent",
        "Type",

        "AD_ERROR",
        "USER_CLOSE",
        "CLICK",
        "SKIPPED",
        "STARTED",
        "USER_CLOSE",
        "ADS_MANAGER_LOADED",
        "NORMAL",
    ];
}());
