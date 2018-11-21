(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.AFG = {})));
}(this, (function (exports) { 'use strict';

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

  var eventemitter3 = /*#__PURE__*/Object.freeze({

  });

  function getCjsExportFromNamespace (n) {
  	return n && n.default || n;
  }

  var EventEmitter$1 = getCjsExportFromNamespace(eventemitter3);

  // var EventEmitter = require('fbemitter').EventEmitter;

  var EVENTS = {
      LOADED: "loaded",
      LOAD_ERROR: "load_error",
      AD_START: "ad_start",
      AD_SKIPPED: "ad_skipped",
      AD_COMPLETE: "ad_complete",
      AD_END: "ad_end",
      AD_CLICKED: "ad_clicked",
  };

  var AdManager = function () {
      this.inited = false;
  };
  var proto = {
      inited: null,
      options: null,
      _adIndex: null,
      _adCache: null,
      init: function (options, callback) {
          this._adCache = {};
          this.options = options;
          this.doInit(callback);
      },
      // user to implement
      doInit: function (callback) {
          if (callback) {
              setTimeout(function () {
                  callback && callback(null);
              }, 30);
          }
      },
      // user to implement
      doCreateAd: function () {
          return new Ad();
      },
      createAd: function (options, name) {
          var ad = this.doCreateAd();
          if (!ad) {
              return false;
          }
          name = name || this.generateName();
          ad.init(name, this, options);
          this._adCache[name] = ad;
          return ad;
      },
      getAd: function (name) {
          return this._adCache[name];
      },
      destroyAd: function (name) {
          delete this._adCache[name];
          return;
      },
      displayAd: function (name) {
          return;
      },
      generateName: function () {
          return 'ad_' + (++this._adIndex);
      },
  };
  for (var p in proto) {
      AdManager.prototype[p] = proto[p];
  }

  var Ad = function () {
      EventEmitter$1.call(this);

      this.destroyed = false;
  };
  var AdProto = {
      name: null,
      manager: null,
      options: null,
      loaded: null,
      destroyed: null,
      init: function (name, manager, options) {
          this.manager = manager;
          this.name = name;
          this.options = options;
          this.onInit();
          // this.load();
      },
      // user to implement
      onInit: function () {
      },
      // user to implement
      load: function () {
          this.loaded = false;
          var Me = this;
          setTimeout(function () {
              Me.loaded = true;
              Me.emit(EVENTS.LOADED);
          }, 30);
          return;
      },
      // user to implement
      unload: function () {
          return;
      },
      // user to implement
      onDestroy: function () {
          return;
      },
      // user to implement
      refresh: function () {
          this.load();
      },
      // user to implement
      show: function () {
          this.emit(EVENTS.AD_START);
          var Me = this;
          setTimeout(function () {
              Me.emit(EVENTS.AD_COMPLETE);
              Me.emit(EVENTS.AD_END);
          }, 30);
          return;
      },
      destroy: function () {
          var manager = this.manager;
          this.name = null;
          this.options = null;
          this.manager = null;
          this.unload();
          this.onDestroy();
          this.removeAllListeners();
          manager.destroyAd(this);
          this.destroyed = true;
          return;
      },
  };
  for (var p in EventEmitter$1.prototype) {
      Ad.prototype[p] = EventEmitter$1.prototype[p];
  }
  for (var p in AdProto) {
      Ad.prototype[p] = AdProto[p];
  }

  var Ad_1 = {
      EVENTS: EVENTS,
      AdManager: AdManager,
      Ad: Ad,
  };

  var EVENTS$1 = Ad_1.EVENTS;
  var AdManager$1 = Ad_1.AdManager;
  var Ad$1 = Ad_1.Ad;

  var google;
  var imasdkJsSrc = '//imasdk.googleapis.com/js/sdkloader/ima3.js';
  var GoogleAdManager = function() {
      AdManager$1.call(this);
  };

  var GoogleAdManagerProto = {
      _adsLoader: null,
      _containerElement: null,
      doInit: function(callback) {
          var Me = this;
          window['adsbygoogle'] = window['adsbygoogle'] || [];
          includeJS(imasdkJsSrc, function () {
              google = window['google'];
              Me._initAdLoader();
              Me.inited = true;
              callback && callback(null);
          }, function(err) {
              callback(err);
          });
      },

      doCreateAd: function() {
          return new GoogleAd();
      },

      displayAd: function(name) {
          this._displayContainerElement(true);
      },

      loadAd: function(ad) {
          var options = ad.options;
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

          this._adsLoader.requestAds(adsRequest, {
              name: ad.name,
          });
      },

      _initAdLoader: function() {
          var options = this.options;
          var adDisplayContainer = this._createAdDisplayContainer(options);
          var adsLoader = this._adsLoader = new google.ima.AdsLoader(adDisplayContainer);
          var Me = this;
          adsLoader.addEventListener(
              google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
              // this._onAdsManagerLoaded.bind(this),
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
                  ad.once(EVENTS$1.AD_END, function () {
                      Me._onAdClosed(name);
                      if (ad.autoDestroy) {
                          ad.destroy();
                      }
                  });
              },
              false);

          adsLoader.addEventListener(
              google.ima.AdErrorEvent.Type.AD_ERROR,
              // this._onAdsManagerLoadError.bind(this),
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
  for (var p$1 in AdManager$1.prototype) {
      GoogleAdManager.prototype[p$1] = AdManager$1.prototype[p$1];
  }
  for (var p$1 in GoogleAdManagerProto) {
      GoogleAdManager.prototype[p$1] = GoogleAdManagerProto[p$1];
  }

  var GoogleAd = function() {
      Ad$1.call(this);
  };

  var GoogleAdProto = {
      _adsManager: null,
      adsRenderingSettings: null,
      _timeoutId: null,
      autoDestroy: null,
      timeout: null,
      onInit: function() {
          var options = this.options;
          this.adsRenderingSettings = options.adsRenderingSettings;
          this.autoDestroy = options.autoDestroy;
          this.destroyed = false;
      },
      refresh: function() {
          this.clearTimeout();
          this.load();
      },
      clearTimeout: function() {
          if (this._timeoutId) {
              clearTimeout(this._timeoutId);
              this._timeoutId = null;
          }
      },
      load: function() {
          var options = this.options;

          this.loaded = false;
          this._adsManager = null;

          this.manager.loadAd(this);
          var timeout = options.timeout;
          if (timeout) {
              this._timeoutId = setTimeout(function () {
                  this._timeoutId = null;
                  this._onLoadTimeout();
              }.bind(this), timeout);
          }
      },
      show: function() {
          var adsManager = this._adsManager;
          if (!adsManager) {
              return false;
          }

          this.manager.displayAd(this);

          var options = this.options;
          adsManager.init(options.width, options.height, google.ima.ViewMode.NORMAL);
          adsManager.start();
          return true;
      },

      _onLoadTimeout: function() {
          this.emit(EVENTS$1.LOAD_ERROR, "load timeout!");
          this.destroy();
      },
      _onAdsManagerLoaded: function(adsManager) {
          if (this.destroyed) {
              return;
          }
          this.loaded = true;
          this._adsManager = adsManager;

          var Me = this;
          var AdEventType = google.ima.AdEvent.Type;

          this.emit(EVENTS$1.LOADED);

          adsManager.addEventListener(AdEventType.STARTED, function () {
              Me.emit(EVENTS$1.AD_START);
          });

          adsManager.addEventListener(AdEventType.COMPLETE, function () {
              Me.emit(EVENTS$1.AD_COMPLETE);
              Me.emit(EVENTS$1.AD_END);
          });

          var skipped = false;
          adsManager.addEventListener(AdEventType.SKIPPED, function () {
              skipped = true;
              Me.emit(EVENTS$1.AD_SKIPPED);
              Me.emit(EVENTS$1.AD_END);
          });

          adsManager.addEventListener(AdEventType.USER_CLOSE, function () {
              setTimeout(function () {
                  if (!skipped) {
                      Me.emit(EVENTS$1.AD_COMPLETE);
                      Me.emit(EVENTS$1.AD_END);
                  }
              }, 100);
          });

          adsManager.addEventListener(AdEventType.CLICK, function () {
              Me.emit(EVENTS$1.AD_CLICKED);
          });

          this.clearTimeout();
      },
      _onAdsLoadError: function(error) {
          if (this.destroyed) {
              return;
          }
          this.clearTimeout();
          this.emit(EVENTS$1.LOAD_ERROR, error);
          this.destroy();
      },

      unload: function() {
          this._adsManager && this._adsManager.destroy();
          this._adsManager = null;
          this.adsRenderingSettings = null;
      },
  };
  for (var p$1 in Ad$1.prototype) {
      GoogleAd.prototype[p$1] = Ad$1.prototype[p$1];
  }
  for (var p$1 in GoogleAdProto) {
      GoogleAd.prototype[p$1] = GoogleAdProto[p$1];
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

  var GoogleAd_1 = {
      GoogleAdManager: GoogleAdManager,
      GoogleAd: GoogleAd,
  };

  var EVENTS$2 = Ad_1.EVENTS;
  var AdManager$2 = Ad_1.AdManager;
  var Ad$2 = Ad_1.Ad;

  var WechatAdManager = function () {
      AdManager$2.call(this);
  };

  var WechatAdManagerProto = {
      adSingleton: null,
      adUnitId: null,
      currentAd: null,
      doInit: function (options, callback) {
          this.adUnitId = options.adUnitId;
          setTimeout(function() {
              callback(null);
          }, 30);
      },

      displayAd: function (name) {
          this.adSingleton.show();
      },

      doCreateAd: function () {
          var ad = new WechatAd();
          return ad;
      },

      _initAdSingleton: function () {
          var Me = this;
          var adSingleton = this.adSingleton = wx.createRewardedVideoAd({ adUnitId: this.adUnitId });
          adSingleton.onLoad(function () {
              Me.currentAd.onLoaded();
          });
          adSingleton.onError(function (err) {
              Me.currentAd.onLoadError(err);
          });
          adSingleton.onClose(function (res) {
              if (res && res.isEnded || res === undefined) {
                  Me.currentAd.onComplete();
              } else {
                  Me.currentAd.onSkipped();
              }
          });
      },

      loadAd: function (ad) {
          this.currentAd = ad;
          if (!this.adSingleton) {
              this._initAdSingleton();
          }
      }
  };

  for (var p$2 in AdManager$2.prototype) {
      WechatAdManager.prototype[p$2] = AdManager$2.prototype[p$2];
  }
  for (var p$2 in WechatAdManagerProto) {
      WechatAdManager.prototype[p$2] = WechatAdManagerProto[p$2];
  }

  var WechatAd = function () {
      Ad$2.call(this);
  };

  var WechatAdProto = {
      _timeoutId: null,
      timeout: null,
      refresh: function () {
          this.clearTimeout();
          this.load();
      },
      load: function () {
          var options = this.options;
          this.loaded = false;
          this.manager.loadAd(this);

          var timeout = options.timeout;
          if (timeout) {
              this._timeoutId = setTimeout(function () {
                  this._timeoutId = null;
                  this.onLoadTimeout();
              }.bind(this), timeout);
          }
      },
      clearTimeout: function () {
          if (this._timeoutId) {
              clearTimeout(this._timeoutId);
              this._timeoutId = null;
          }
      },
      unload: function () {
          this.loaded = false;

      },
      show: function () {
          this.manager.displayAd();
          return true;
      },

      onLoaded: function () {
          this.loaded = true;
          this.clearTimeout();
          this.emit(EVENTS$2.LOADED);
      },

      onLoadError: function (err) {
          this.clearTimeout();
          this.emit(EVENTS$2.LOAD_ERROR, err.errMsg);
      },

      onSkipped: function () {
          this.emit(EVENTS$2.AD_SKIPPED);
          this.emit(EVENTS$2.AD_END);
      },

      onComplete: function () {
          this.emit(EVENTS$2.AD_COMPLETE);
          this.emit(EVENTS$2.AD_END);
      },

      onLoadTimeout: function () {
          this.emit(EVENTS$2.LOAD_ERROR, "load timeout!");
      },
  };

  for (var p$2 in Ad$2.prototype) {
      WechatAd.prototype[p$2] = Ad$2.prototype[p$2];
  }

  for (var p$2 in WechatAdProto) {
      WechatAd.prototype[p$2] = WechatAdProto[p$2];
  }

  var WechatAd_1 = {
      WechatAdManager: WechatAdManager,
      WechatAd: WechatAd,
  };

  var src = {
      EVENTS: Ad_1.EVENTS,
      AdManager: Ad_1.AdManager,
      Ad: Ad_1.Ad,
      GoogleAdManager: GoogleAd_1.GoogleAdManager,
      GoogleAd: GoogleAd_1.GoogleAd,
      WechatAdManager: WechatAd_1.WechatAdManager,
      WechatAd: WechatAd_1.WechatAd,
  };
  var src_1 = src.EVENTS;
  var src_2 = src.AdManager;
  var src_3 = src.Ad;
  var src_4 = src.GoogleAdManager;
  var src_5 = src.GoogleAd;
  var src_6 = src.WechatAdManager;
  var src_7 = src.WechatAd;

  exports.default = src;
  exports.EVENTS = src_1;
  exports.AdManager = src_2;
  exports.Ad = src_3;
  exports.GoogleAdManager = src_4;
  exports.GoogleAd = src_5;
  exports.WechatAdManager = src_6;
  exports.WechatAd = src_7;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
