// var EventEmitter3 = require('fbemitter').EventEmitter3;
// var EventEmitter3 = require('eventemitter3');
var EventEmitter3 = window.EventEmitter3 = require('eventemitter3');
// var async = window.async = require('async');
var EVENTS = {
    LOADED: "loaded",
    LOAD_ERROR: "load_error",
    AD_START: "ad_start",
    AD_SKIPPED: "ad_skipped",
    AD_COMPLETE: "ad_complete",
    AD_END: "ad_end",
    AD_CLICKED: "ad_clicked",
};

var AdManager = function () {
    this.inited = false;
};
var proto = {
    inited: null,
    options: null,
    _adIndex: null,
    _adCache: null,
    init: function (options, callback) {
        this._adCache = {};
        this.options = options;
        this.doInit(callback);
    },
    // user to implement
    doInit: function (callback) {
        if (callback) {
            setTimeout(function () {
                callback && callback(null);
            }, 30);
        }
    },
    // user to implement
    doCreateAd: function () {
        return new Ad();
    },
    createAd: function (options, name) {
        var ad = this.doCreateAd();
        if (!ad) {
            return false;
        }
        name = name || this.generateName();
        ad.init(name, this, options);
        this._adCache[name] = ad;
        return ad;
    },
    getAd: function (name) {
        return this._adCache[name];
    },
    destroyAd: function (name) {
        delete this._adCache[name];
        return;
    },
    displayAd: function (name) {
        return;
    },
    generateName: function () {
        return 'ad_' + (++this._adIndex);
    },
};
for (var p in proto) {
    AdManager.prototype[p] = proto[p];
}

var Ad = function () {
    EventEmitter3.call(this);

    this.destroyed = false;
}
var AdProto = {
    name: null,
    manager: null,
    options: null,
    loaded: null,
    destroyed: null,
    init: function (name, manager, options) {
        this.manager = manager;
        this.name = name;
        this.options = options;
        this.onInit();
        // this.load();
    },
    // user to implement
    onInit: function () {
    },
    // user to implement
    load: function () {
        this.loaded = false;
        var Me = this;
        setTimeout(function () {
            Me.loaded = true;
            Me.emit(EVENTS.LOADED);
        }, 30);
        return;
    },
    // user to implement
    unload: function () {
        return;
    },
    // user to implement
    onDestroy: function () {
        return;
    },
    // user to implement
    refresh: function () {
        this.load();
    },
    // user to implement
    show: function () {
        this.emit(EVENTS.AD_START);
        var Me = this;
        setTimeout(function () {
            Me.emit(EVENTS.AD_COMPLETE);
            Me.emit(EVENTS.AD_END);
        }, 30);
        return;
    },
    destroy: function () {
        var manager = this.manager;
        this.name = null;
        this.options = null;
        this.manager = null;
        this.unload();
        this.onDestroy();
        this.removeAllListeners();
        manager.destroyAd(this);
        this.destroyed = true;
        return;
    },
}
for (var p in EventEmitter3.prototype) {
    Ad.prototype[p] = EventEmitter3.prototype[p];
}
for (var p in AdProto) {
    Ad.prototype[p] = AdProto[p];
}

module.exports = {
    EVENTS: EVENTS,
    AdManager: AdManager,
    Ad: Ad,
};