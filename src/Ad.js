// var EventEmitter = require('fbemitter').EventEmitter;
// var EventEmitter = require('eventemitter3');
var EventEmitter = require('eventemitter3');
// var async = window.async = require('async');
var EVENTS = {
    LOADED: "loaded",
    LOAD_ERROR: "load_error",
    AD_START: "ad_start",
    AD_SKIPPED: "ad_skipped",
    AD_COMPLETE: "ad_complete",
    AD_END: "ad_end",
    AD_CLICKED: "ad_clicked",
    AD_DESTROYED: "ad_destroyed",
};

var AD_STATUS = {
    FRESH: "FRESH",
    LOADING: "LOADING",
    LOADED: "LOADED",
    LOAD_FAILED: "LOAD_FAILED",
    DESTROYED: "DESTROYED",
};

var AdManager = function () {
};
var proto = {
    inited: null,
    options: null,
    _adIndex: null,
    _adCache: null,
    _initTimeoutId: null,
    init: function (options, callback) {
        this.inited = false;
        this._adCache = {};
        this.options = options;

        var Me = this;
        this.doInit(function(err) {
            Me.inited = true;
            callback && callback(err);
        });
    },
    // user to implement
    doInit: function (callback) {
        if (callback) {
            setTimeout(function () {
                callback(null);
            }, 30);
        }
    },
    createAd: function (options, name) {
        var ad = this.doCreateAd(options);
        name = name || this._generateName();
        ad.init(name, this, options);
        this._adCache[name] = ad;
        return ad;
    },
    // user to implement
    doCreateAd: function () {
        return new Ad();
    },
    destroyAd: function (ad) {
        delete this._adCache[ad.name];
        ad.destroy();
        this.doDestroyAd(ad);
        return;
    },
    // user to implement
    doDestroyAd: function(name) {
        return;
    },
    getAd: function (name) {
        return this._adCache[name];
    },
    _generateName: function () {
        return 'ad_' + (++this._adIndex);
    },
};
for (var p in proto) {
    AdManager.prototype[p] = proto[p];
}

var Ad = function () {
    this.destroyed = false;
}
var AdProto = {
    status: null,
    name: null,
    manager: null,
    options: null,
    _loadTimeoutId: null,
    loadTask: null,
    showTask: null,
    init: function (name, manager, options) {
        this.loadTask = new EventEmitter();
        this.showTask = new EventEmitter();
        this.name = name;
        this.manager = manager;
        this.options = options;
        this.status = AD_STATUS.FRESH;
        this.doInit();
    },
    // user to implement
    doInit: function () {
        return;
    },
    load: function () {
        var loadTask = this.loadTask;
        loadTask.removeAllListeners();
        this.status = AD_STATUS.LOADING;
        this.doLoad();
        loadTask.on(EVENTS.LOADED, function() {
            this.status = AD_STATUS.LOADED;
        }, this);
        loadTask.on(EVENTS.LOAD_ERROR, function() {
            this.status = AD_STATUS.LOAD_FAILED;
        }, this);
        return this.loadTask;
    },
    // user to implement
    doLoad: function() {
        var Me = this;
        setTimeout(function () {
            Me.loadTask.emit(EVENTS.LOADED);
        }, 30);
    },
    show: function () {
        this.showTask.removeAllListeners();
        this.doShow();
        return this.showTask;
    },
    // user to implement
    doShow: function() {
        var Me = this;
        setTimeout(function () {
            Me.showTask.emit(EVENTS.AD_COMPLETE);
            Me.showTask.emit(EVENTS.AD_END);
        }, 30);
    },
    destroy: function () {
        this.doDestroy();
        this.loadTask.removeAllListeners();
        this.showTask.removeAllListeners();
        this.name = null;
        this.options = null;
        this.manager = null;
        return;
    },
    // user to implement
    doDestroy: function () {
        return;
    },
}
for (var p in AdProto) {
    Ad.prototype[p] = AdProto[p];
}

module.exports = {
    EVENTS: EVENTS,
    AdManager: AdManager,
    Ad: Ad,
    AD_STATUS: AD_STATUS,
};