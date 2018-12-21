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
        var adSingleton = this.adSingleton = wx.createRewardedVideoAd({ "adUnitId": options.adUnitId });
        adSingleton.onLoad(function () {
            Me.loadTask.emit(EVENTS.LOADED);
        })
        adSingleton.onError(function (err) {
            Me.loadTask.emit(EVENTS.LOAD_ERROR, err.errMsg);
        })
        adSingleton.onClose(function (res) {
            if (res && res.isEnded || res === undefined) {
                this.showTask.emit(EVENTS.AD_COMPLETE);
                this.showTask.emit(EVENTS.AD_END);
            } else {
                this.showTask.emit(EVENTS.AD_SKIPPED);
                this.showTask.emit(EVENTS.AD_END);
            }
        })
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
