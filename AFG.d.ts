declare namespace AFG {
    export const EVENTS: {
        LOADED: string,
        LOAD_ERROR: string,
        AD_START: string,
        AD_SKIPPED: string,
        AD_COMPLETE: string,
        AD_END: string,
        AD_CLICKED: string,
    }
    export const STATUS: {
        FRESH: string,
        LOADING: string,
        LOADED: string,
        LOAD_FAILED: string,
        DESTROYED: string,
    }
    export class AdManager {
        inited: boolean;
        init(options, callback?);
        createAd(options, name?);
        destroyAd(ad);
    }
    export class Ad {
        name: string;
        status: string;
        load(): EventEmitter;
        show(): EventEmitter;
    }
    export interface GoogleAdManagerOptions {
        containerElement,
        containerStyle,
    }
    export interface GoogleAdOptions {
        descriptionPage?,
        adType?,
        id?,
        channel?,
        adDuration?,
        skippableAdDuration?,
        delay?,
        language?,
        vastLoadTimeout?,
        width?,
        height?,
    }
    export class GoogleAdManager extends AdManager {
    }
    export class GoogleAd extends Ad {
    }
    export interface WechatAdManagerOptions {
    }
    export interface WechatAdOptions {
        adUnitId?,
    }
    export class WechatAdManager extends AdManager {
    }
    export class WechatAd extends Ad {
    }
}