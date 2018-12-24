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
        var adSingleton = this.adSingleton = wx.createRewardedVideoAd({ "adUnitId": options.adUnitId });

        if (!adSingletonInited) {
            adSingleton.onLoad(function () {
                console.log('wechat ad on load');
                Me.loadTask.emit(EVENTS.LOADED);
            })
            adSingleton.onError(function (err) {
                console.log('wechat ad on error');
                Me.loadTask.emit(EVENTS.LOAD_ERROR, err.errMsg);
            })
            adSingleton.onClose(function (res) {
                console.log('wechat ad on close');
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
