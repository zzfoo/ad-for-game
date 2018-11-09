var adSenseManager = null;
var currentAdSense = null;


function init() {
    // videoContent = document.getElementById('contentElement');
    playButton = document.getElementById('playButton');
    playButton.addEventListener('click', playAd);
    adSenseManager = new AFG.AdSenseManager();
    adSenseManager.init({
        // containerElement: document.getElementById('adContainer'),
    }, function() {
        console.log('adSenseManager inited!');
        requestNewAd();
    })
}

function requestNewAd() {
    currentAdSense = adSenseManager.createAd({
        adType: 'image',
        id: 'ca-games-pub-9274896770936398',
        descriptionPage: 'http://onemorejoy.com/wx-games/fat-jump/index.html',
        delay: 0,
        // adDuration: 30 * 1000,
        // skippableAdDuration: 30 * 1000,
        timeout: 20 * 1000,
        language: 'en',
        channel: '4301438093',
        vastLoadTimeout: 10 * 1000, // 广告加载超时时间
        // width: 640,
        // height: 400,
    });

    var EVENTS = AFG.EVENTS;
    currentAdSense.once(EVENTS.LOADED, function() {
        console.log(currentAdSense.name + ' loaded!');
    })
    currentAdSense.once(EVENTS.LOAD_ERROR, function(error) {
        console.log(currentAdSense.name + ' load error: ', error);
    })
}

function playAd() {
    var googleAdForGame = currentAdSense;
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
