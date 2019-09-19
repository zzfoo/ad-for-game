var base = require('./src/Ad.js');
var GoogleBase = require('./src/GoogleAd.js');
var WechatBase = require('./src/WechatAd.js');
var HippoBase = require('./src/HippoAd.js');
module.exports = {
    EVENTS: base.EVENTS,
    AD_STATUS: base.AD_STATUS,
    AdManager: base.AdManager,
    Ad: base.Ad,
    GoogleAdManager: GoogleBase.GoogleAdManager,
    GoogleAd: GoogleBase.GoogleAd,
    WechatAdManager: WechatBase.WechatAdManager,
    WechatAd: WechatBase.WechatAd,
    HippoAdManager: HippoBase.HippoAdManager,
    HippoAd: HippoBase.HippoAd,
};