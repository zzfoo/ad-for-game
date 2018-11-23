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
        adType: 'skippablevideo',
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

    var EVENTS = AFG.EVENTS;
    currentAd.once(EVENTS.LOADED, function() {
        console.log(currentAd.name + ' loaded!');
    })
    currentAd.once(EVENTS.LOAD_ERROR, function(error) {
        console.log(currentAd.name + ' load error: ', error);
    })
}

function playAd() {
    var googleAdForGame = currentAd;
    var showSucceed = googleAdForGame.show();
    var EVENTS = AFG.EVENTS;

    if (showSucceed) {
        googleAdForGame.once(EVENTS.AD_START, function() {
            console.log('AD_START: ' + googleAdForGame.name);
        })
        googleAdForGame.once(EVENTS.AD_SKIPPED, function() {
            console.log('AD_SKIPPED: ' + googleAdForGame.name);
        })
        googleAdForGame.once(EVENTS.AD_END, function() {
            console.log('AD_END: ' + googleAdForGame.name);
            onAdClosed(googleAdForGame.name);
        })
        googleAdForGame.once(EVENTS.AD_CLICKED, function() {
            console.log('AD_CLICKED: ' + googleAdForGame.name);
        })

        requestNewAd();
    }
}

function onAdClosed(name) {
    console.log('ad closed: ', name);
}

init();
