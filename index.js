var base = require('./src/Ad.js');
var GoogleBase = require('./src/GoogleAd.js');
var WechatBase = require('./src/WechatAd.js');
module.exports = {
    EVENTS: base.EVENTS,
    AD_STATUS: base.AD_STATUS,
    AdManager: base.AdManager,
    Ad: base.Ad,
    GoogleAdManager: GoogleBase.GoogleAdManager,
    GoogleAd: GoogleBase.GoogleAd,
    WechatAdManager: WechatBase.WechatAdManager,
    WechatAd: WechatBase.WechatAd,
};