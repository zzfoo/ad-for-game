var base = require('./Ad.js');
var EVENTS = base.EVENTS;
var AdManager = base.AdManager;
var Ad = base.Ad;

var WechatAdManager = function () {
    AdManager.call(this);
}

var WechatAdManagerProto = {
    adSingleton: null,
    adUnitId: null,
    currentAd: null,
    doInit: function (callback) {
        var options = this.options;
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

    _initAdSingleton: function (adUnitId) {
        var Me = this;
        this.adUnitId = adUnitId;
        var adSingleton = this.adSingleton = wx.createRewardedVideoAd({ "adUnitId": adUnitId });
        adSingleton.onLoad(function () {
            Me.currentAd.onLoaded();
        })
        adSingleton.onError(function (err) {
            Me.currentAd.onLoadError(err);
        })
        adSingleton.onClose(function (res) {
            if (res && res.isEnded || res === undefined) {
                Me.currentAd.onComplete();
            } else {
                Me.currentAd.onSkipped();
            }
        })
    },

    loadAd: function (ad) {
        this.currentAd = ad;
        if (!this.adSingleton) {
            this._initAdSingleton(ad.options.adUnitId);
        }
    }
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
        this.emit(EVENTS.LOADED);
    },

    onLoadError: function (err) {
        this.clearTimeout();
        this.emit(EVENTS.LOAD_ERROR, err.errMsg);
    },

    onSkipped: function () {
        this.emit(EVENTS.AD_SKIPPED);
        this.emit(EVENTS.AD_END);
    },

    onComplete: function () {
        this.emit(EVENTS.AD_COMPLETE);
        this.emit(EVENTS.AD_END);
    },

    onLoadTimeout: function () {
        this.emit(EVENTS.LOAD_ERROR, "load timeout!");
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
