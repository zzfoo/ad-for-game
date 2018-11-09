interface InitOptions {
    containerElement
}
/**
 * {
        adType: 'image',
        id: 'ca-games-pub-1234567890',
        descriptionPage: 'http://example.com/game/index.html',
        delay: 0,
        adDuration: 15 * 1000,
        skippableAdDuration: 30 * 1000,
        language: 'en',
        channel: '123123123',
        onAdClosed: function() {
            console.log('ad closed!');
        },
    }
*/
interface CreateOptions {
    name: string,
    disabled: boolean;
    adType: string,
    id: string,
    descriptionPage: string,
    delay: number,
    adDuration: number,
    skippableAdDuration: number,
    language: string,
    channel: string,
    containerElement: HTMLElement | string,
    containerStyle: object,
    onAdClosed: ()=>void,
}
declare namespace AFG {
    export class AdSense extends EventEmitter{
        name: string;
        disabled: boolean;
        destroyed: boolean;
        show(): boolean;
        isLoaded(): boolean;
        destroy();
    }

    export class AdSenseManager {
        static EVENTS: {
            LOADED: string,
            LOAD_ERROR: string,
            AD_START: string,
            AD_SKIPPED: string,
            AD_END: string,
            AD_CLICKED: string,
        };
        disabled: boolean;
        init(options: InitOptions, callback: ()=>void);
        createAd(options: CreateOptions): AdSense;
        getAd(name: string): boolean;
        showAd(name: string): boolean;
        hideAd(name: string): boolean;
        removeAd(name: string): boolean;
    }
}
