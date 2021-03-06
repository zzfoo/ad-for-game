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
