interface InitOptions {
    containerElement
}
/** 
 * {
        adType: 'image',
        id: 'ca-games-pub-9274896770936398',
        descriptionPage: 'http://onemorejoy.com/wx-games/fat-jump/index.html',
        delay: 0,
        adDuration: 15 * 1000,
        skippableAdDuration: 30 * 1000,
        language: 'en',
        channel: '4301438093',
        onAdClosed: function() {
            console.log('ad closed!');
        },
    }
*/
interface CreateOptions {
    adType: string,
    id: string,
    descriptionPage: string,
    delay: number,
    adDuration: number,
    skippableAdDuration: number,
    language: string,
    channel: string,
    onAdClosed: ()=>void,
}
declare namespace AFG {
    export class AdSense extends EventEmitter{
        name: string;
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
        init(options: InitOptions, callback: ()=>void);
        createAd(name, options: CreateOptions): AdSense;
    }
}