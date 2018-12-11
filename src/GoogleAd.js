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
    _adsLoader: null,
    _containerElement: null,
    doInit: function(callback) {
        var Me = this;
        window['adsbygoogle'] = window['adsbygoogle'] || [];
        includeJS(imasdkJsSrc, function () {
            google = window['google'];
            Me._initAdLoader();
            Me.inited = true;
            callback(null);
        }, function(err) {
            callback(err)
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
                ad.once(EVENTS.AD_END, function () {
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
        this.emit(EVENTS.LOAD_ERROR, "load timeout!");
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

        this.emit(EVENTS.LOADED);

        adsManager.addEventListener(AdEventType.STARTED, function () {
            Me.emit(EVENTS.AD_START);
        });

        adsManager.addEventListener(AdEventType.COMPLETE, function () {
            Me.emit(EVENTS.AD_COMPLETE);
            Me.emit(EVENTS.AD_END);
        });

        var skipped = false;
        adsManager.addEventListener(AdEventType.SKIPPED, function () {
            skipped = true;
            Me.emit(EVENTS.AD_SKIPPED);
            Me.emit(EVENTS.AD_END);
        });

        adsManager.addEventListener(AdEventType.USER_CLOSE, function () {
            setTimeout(function () {
                if (!skipped) {
                    Me.emit(EVENTS.AD_COMPLETE);
                    Me.emit(EVENTS.AD_END);
                }
            }, 100);
        });

        adsManager.addEventListener(AdEventType.CLICK, function () {
            Me.emit(EVENTS.AD_CLICKED);
        });

        this.clearTimeout();
    },
    _onAdsLoadError: function(error) {
        if (this.destroyed) {
            return;
        }
        this.clearTimeout();
        this.emit(EVENTS.LOAD_ERROR, error);
        this.destroy();
    },

    unload: function() {
        this._adsManager && this._adsManager.destroy();
        this._adsManager = null;
        this.adsRenderingSettings = null;
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
