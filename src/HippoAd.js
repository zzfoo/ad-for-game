var base = require('./Ad.js');
var EVENTS = base.EVENTS;
var AdManager = base.AdManager;
var Ad = base.Ad;

var HippoAdManager = function () {
  AdManager.call(this);
}

var HippoAdManagerProto = {
  doInit: function (callback) {
    var HippoAdSDK = this.options.HippoAdSDK
    var adIds = this.options.adIds
    HippoAdSDK.initRewardedVideoAd(adIds, function (hippoPlacementId, success) {
      var err = success ? null : 'HippoAdSDK initRewardedVideoAd error';
      callback(err)
    });
  },

  doCreateAd: function () {
    return new HippoAd();
  },
};

for (var p in AdManager.prototype) {
  HippoAdManager.prototype[p] = AdManager.prototype[p];
}
for (var p in HippoAdManagerProto) {
  HippoAdManager.prototype[p] = HippoAdManagerProto[p];
}

var HippoAd = function () {
  Ad.call(this);
}

var HippoAdProto = {
  adSingleton: null,
  doLoad: function () {
    var Me = this;
    setTimeout(function () {
      Me.loadTask.emit(EVENTS.LOADED);
    }, 60)
  },
  doShow: function () {
    var Me = this
    var HippoAdSDK = this.manager.options.HippoAdSDK
    HippoAdSDK.showRewardVideoAd(this.options.adId, function (success, errorMessage, isRewarded) { // 展示之后的回调
      if (success) {
        // 展示成功和发放奖励
        if (isRewarded) {
          Me.showTask.emit(EVENTS.AD_COMPLETE);
        } else {
          Me.showTask.emit(EVENTS.AD_SKIPPED);
        }
      }
      Me.showTask.emit(EVENTS.AD_END);
    }, function () { // 点击回调
      Me.showTask.emit(EVENTS.AD_CLICKED)
    });
    Me.showTask.emit(EVENTS.AD_START);
  }
};

for (var p in Ad.prototype) {
  HippoAd.prototype[p] = Ad.prototype[p];
}

for (var p in HippoAdProto) {
  HippoAd.prototype[p] = HippoAdProto[p];
}

module.exports = {
  HippoAdManager: HippoAdManager,
  HippoAd: HippoAd,
};
