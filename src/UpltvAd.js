var base = require('./Ad.js');
var EVENTS = base.EVENTS;
var AdManager = base.AdManager;
var Ad = base.Ad;

var UpltvAdManager = function () {
  AdManager.call(this);
}

var UpltvAdManagerProto = {
  ads: {},
  haveLoadHandler: false,

  doInit: function (callback) {
    const Me = this
    const upltv = window['upltv']
    if (!upltv) {
      console.log('===> 获取不到upltv!')
    }

    // 初始化sdk
    upltv.intSdk(0);
    this._addHandler();

    callback(null)


    // setTimeout(function () {
    //   callback(null);
    // }, 30);
  },

  _addHandler() {
    const ME = this

    // 设置加载回调
    upltv.setRewardVideoLoadCallback(function (Ad_Unit_ID, msg) {
      console.log("===> Upltv load video ad Success, unit-id:", Ad_Unit_ID);
      console.log('msg:', msg)
    }, function (Ad_Unit_ID, msg) {
      console.log("===> Upltv load video ad Fail, unit-id:", Ad_Unit_ID);
      console.log('msg:', msg)
    });

    // 设置播放回调
    upltv.setRewardVideoShowCallback(function(type, Ad_Unit_ID) {
      const ad = ME.ads[Ad_Unit_ID]
      if (!ad) {
        console.log('播放回调 ===> 找不到ad')
      }
      ad && ad.afterShow(type, Ad_Unit_ID)
    });
  },

  doCreateAd: function (options) {
    var ad = new UpltvAd()
    this.ads[options.adId] = ad
    console.log('==> creaded ad, id:', options.adId)
    return ad
  },
};
dylangen
for (var p in AdManager.prototype) {
  UpltvAdManager.prototype[p] = AdManager.prototype[p];
}
for (var p in UpltvAdManagerProto) {
  UpltvAdManager.prototype[p] = UpltvAdManagerProto[p];
}

var UpltvAd = function () {
  Ad.call(this);
}

var UpltvAdProto = {

  doShow: function () {
    this.showTask.emit(EVENTS.AD_START);
    const id = this.options.adId;
    console.log('===> show ad, id:', id)
    upltv.showRewardVideo(id);
  },

  afterShow(type, Ad_Unit_ID) {
    console.log('===> after show ad, id:', Ad_Unit_ID)
    console.log('===> after show ad, type:', type)

    const Me = this
    var event = "unkown";
    if (type == upltv.AdEventType.VIDEO_EVENT_WILL_SHOW) {
      event = "Will_Show";
    }
    else if (type == upltv.AdEventType.VIDEO_EVENT_DID_SHOW) {
      event = "Did_Show";
    }
    else if (type == upltv.AdEventType.VIDEO_EVENT_DID_CLICK) {
      event = "Did_Click";
    }
    else if (type == upltv.AdEventType.VIDEO_EVENT_DID_CLOSE) {
      Me.showTask.emit(EVENTS.AD_SKIPPED);
      Me.showTask.emit(EVENTS.AD_END);
      event = "Did_Close";
    } else if (type == upltv.AdEventType.VIDEO_EVENT_DID_GIVEN_REWARD) {
      Me.showTask.emit(EVENTS.AD_COMPLETE);
      Me.showTask.emit(EVENTS.AD_END);
      event = "Did_Given_Reward";
    } else if (type == upltv.AdEventType.VIDEO_EVENT_DID_ABANDON_REWARD) {
      Me.showTask.emit(EVENTS.AD_SKIPPED);
      Me.showTask.emit(EVENTS.AD_END);
      event = "Did_Abandon_Reward";
    }
    console.log("===> js RewardVideo Show Callback, event: %s, at: %s", event, Ad_Unit_ID);
  },

};

for (var p in Ad.prototype) {
  UpltvAd.prototype[p] = Ad.prototype[p];
}

for (var p in UpltvAdProto) {
  UpltvAd.prototype[p] = UpltvAdProto[p];
}

module.exports = {
  UpltvAdManager: UpltvAdManager,
  UpltvAd: UpltvAd,
};
