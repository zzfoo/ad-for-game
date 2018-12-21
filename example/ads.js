var adManager = null;
var currentAd = null;

function init() {
    // videoContent = document.getElementById('contentElement');
    playButton = document.getElementById('playButton');
    playButton.addEventListener('click', playAd);
    adManager = new AFG.GoogleAdManager();
    adManager.init({
        // containerElement: document.getElementById('adContainer'),
    }, function() {
        console.log('adManager inited!');
        requestNewAd();
    })
}

function requestNewAd() {
    currentAd = adManager.createAd({
        adType: 'image',
        id: 'ca-games-pub-9274896770936398',
        descriptionPage: 'http://onemorejoy.com/wx-games/fat-jump/index.html',
        delay: 0,
        language: 'en',
        channel: '4301438093',
        vastLoadTimeout: 10 * 1000, // 广告加载超时时间
        timeout: 5 * 1000,
        // adDuration: 30 * 1000,
        // skippableAdDuration: 30 * 1000,
        // width: 640,
        // height: 400,
    });

    currentAd.load();

    var EVENTS = AFG.EVENTS;
    currentAd.once(EVENTS.LOADED, function() {
        console.log(currentAd.name + ' loaded!');
    })
    currentAd.once(EVENTS.LOAD_ERROR, function(error) {
        console.log(currentAd.name + ' load error: ', error);
    })
}

function playAd() {
    var EVENTS = AFG.EVENTS;
    if (currentAd.status === AFG.AD_STATUS.LOADED) {
        currentAd.show();
        currentAd.once(EVENTS.AD_START, function() {
            console.log('AD_START: ' + currentAd.name);
        })
        currentAd.once(EVENTS.AD_SKIPPED, function() {
            console.log('AD_SKIPPED: ' + currentAd.name);
        })
        currentAd.once(EVENTS.AD_END, function() {
            console.log('AD_END: ' + currentAd.name);
            currentAd.load();
        })
        currentAd.once(EVENTS.AD_CLICKED, function() {
            console.log('AD_CLICKED: ' + currentAd.name);
        })
    }
}

init();
