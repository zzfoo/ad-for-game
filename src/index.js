var base = require('./Ad.js');
var GoogleBase = require('./GoogleAd.js');
var WechatBase = require('./WechatAd.js');
module.exports = {
    EVENTS: base.EVENTS,
    AdManager: base.AdManager,
    Ad: base.Ad,
    GoogleAdManager: GoogleBase.GoogleAdManager,
    GoogleAd: GoogleBase.GoogleAd,
    WechatAdManager: WechatBase.WechatAdManager,
    WechatAd: WechatBase.WechatAd,
};