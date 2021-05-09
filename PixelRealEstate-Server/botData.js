const Cache = require('./cache.js');

const BotImages = {
    //eth50x50: { image: null, width: 50, height: 50 },
    //btc50x50: { image: null, width: 50, height: 50 },
    //neo50x50: { image: null, width: 50, height: 50 },
    //doge50x50: { image: null, width: 50, height: 50 },
    //ark50x50: { image: null, width: 50, height: 50 },
    //eos50x50: { image: null, width: 50, height: 50 },
    //ltc50x50: { image: null, width: 50, height: 50 },
    //xmr50x50: { image: null, width: 50, height: 50 },
    //steem50x50: { image: null, width: 50, height: 50 },
    //angryBossman: { image: null, width: 100, height: 50 },
    bulletjim_50x50: { image: null, width: 50, height: 50 },
    castle_50x50: { image: null, width: 50, height: 50 },
    handleFacebook200x50: { image: null, width: 200, height: 50 },
    handleInstagram200x50: { image: null, width: 200, height: 50 },
    handleSteem200x50: { image: null, width: 200, height: 50 },
    handleTwitter200x50: { image: null, width: 200, height: 50 },
    houses_50x50: { image: null, width: 50, height: 50 },
    houses1_100x50: { image: null, width: 100, height: 50 },
    houses2_50x50: { image: null, width: 50, height: 50 },
    houses2_100x50: { image: null, width: 100, height: 50 },
    //iota100x50: { image: null, width: 100, height: 50 },
    land_100x50: { image: null, width: 100, height: 50 },
    //ltc2_50x50: { image: null, width: 50, height: 50 },
    misc2_50x50: { image: null, width: 50, height: 50 },
    misc3_50x50: { image: null, width: 50, height: 50 },
    misc4_100x50: { image: null, width: 100, height: 50 },
    //misc5_200x50: { image: null, width: 200, height: 50 },
    misc50x50: { image: null, width: 50, height: 50 },
    mountains2_50x50: { image: null, width: 50, height: 50 },
    mountains50x50: { image: null, width: 50, height: 50 },
    //nem_neo_50x50: { image: null, width: 50, height: 50 },
    //nem100x50: { image: null, width: 100, height: 50 },
    //neo100x50: { image: null, width: 100, height: 50 },
    origLogo1_50x50: { image: null, width: 50, height: 50 },
    origLogo2_50x50: { image: null, width: 50, height: 50 },
    seed_100x50: { image: null, width: 100, height: 50 },
    //sia_nem_50x50: { image: null, width: 50, height: 50 },
    //sia100x50: { image: null, width: 100, height: 50 },
    Coffee_50x50: { image: null, width: 50, height: 50 },
    Drums_50x50: { image: null, width: 50, height: 50 },
    Fake_notfake_Fake_50x50: { image: null, width: 50, height: 50 },
    FakeInitials_50x50: { image: null, width: 50, height: 50 },
    FakeJailPerson_50x50: { image: null, width: 50, height: 50 },
    FakeLogo_50x50: { image: null, width: 50, height: 50 },
    msp1_50x50: { image: null, width: 50, height: 50 },
    msp2_50x50: { image: null, width: 50, height: 50 },
    fakeCat_50x50: { image: null, width: 50, height: 50 },
    OfJ_100x50: { image: null, width: 100, height: 50 },
    pyramidpanic_crimsonclad_100x50: { image: null, width: 100, height: 50 },
    SealLogo_50x50: { image: null, width: 50, height: 50 },
    TeddyFace_100x50: { image: null, width: 100, height: 50 },
    //waves_followbtcnews_100x50: { image: null, width: 100, height: 50 },
    //woodland_saicos_100x50: { image: null, width: 100, height: 50 },
    Canada_100x50: { image: null, width: 100, height: 50 },
    Chalkboard_100x50: { image: null, width: 100, height: 50 },
    Mountains_100x50: { image: null, width: 100, height: 50 },
    TreeTK_100x50: { image: null, width: 100, height: 50 },
    BurgerQueen_50x50: { image: null, width: 50, height: 50 },
    Creatures_100x50: { image: null, width: 100, height: 50 },
    FakeDoors_50x50: { image: null, width: 50, height: 50 },
    GreenTooth_50x50: { image: null, width: 50, height: 50 },
    Music_100x50: { image: null, width: 100, height: 50 },
    Ocean_100x50: { image: null, width: 100, height: 50 },
    PizzaSpying_100x50: { image: null, width: 100, height: 50 },
    Eringar_50x50: { image: null, width: 50, height: 50 },
    Groff_50x50: { image: null, width: 50, height: 50 },
    InAMouth_100x50: { image: null, width: 100, height: 50 },
    Lofiodin_50x50: { image: null, width: 50, height: 50 },
    Mixture_200x50: { image: null, width: 200, height: 50 },
    Nikster_50x50: { image: null, width: 50, height: 50 },
    Stiching_100x50: { image: null, width: 100, height: 50 },
    Tentomatone_100x50: { image: null, width: 100, height: 50 },
};

function LoadImages() {
    let imageNames = Object.keys(BotImages);
    for (let i = 0; i < imageNames.length; i++) {
        Cache.UncacheImage(Cache.PATHS.BOT_IMAGES, (err, imgData) => {
            if (imgData != null) {
                let finalData = {};
                for (let y = 0; y < imgData.height; y++) {
                    finalData[y] = [];
                    for (let x = 0; x < imgData.width; x++)
                        for (let c = 0; c < 4; c++)
                            finalData[y].push(imgData.data[(y * imgData.width * 4) + (x * 4) + c]);
                }
                if (finalData == null)
                    console.info("failed loading: " + imageNames[i]);
                BotImages[imageNames[i]].image = finalData;
            } else {
                console.info('Error loading bot image ' + imageNames[i]);
            }
        }, imageNames[i] + '.png');
    }
}


module.exports.BotImages = BotImages;
module.exports.LoadBotImages = LoadImages();