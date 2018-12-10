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
    export class AdManager {
        inited: boolean;
        init(options, callback?);
        createAd(options, name?);
    }
    export class Ad extends EventEmitter {
        name: string;
        loaded: boolean;
        destroyed: boolean;
        load();
        show();
        refresh();
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
        timeout?,
    }
    export class GoogleAdManager extends AdManager {
    }
    export class GoogleAd extends Ad {
    }
    export interface WechatAdManagerOptions {
        adUnitId
    }
    export interface WechatAdOptions {
        timeout?,
    }
    export class WechatAdManager extends AdManager {
    }
    export class WechatAd extends Ad {
    }
}