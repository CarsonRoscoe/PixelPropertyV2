var ENV_DEV = false;
var RELOAD = false;
var CONFIRM_RELOAD = false;
var CACHE_IMAGE = false;
var USE_BOT = false;
var USE_COVER = false;

for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === 'dev')
        ENV_DEV = true;
    if (process.argv[i] === 'cache')
        CACHE_IMAGE = true;
    if (process.argv[i] === 'bot')
        USE_BOT = true;
    if (process.argv[i] === 'reload')
        RELOAD = true;
    if (process.argv[i] === 'confirm_reload')
        CONFIRM_RELOAD = true;
    if (process.argv[i] === 'cover')
        USE_COVER = true;
    if (process.argv[i] === 'help') {
        console.info("Flags: ", "\nENV_DEV:\tdev", "\nUSE_BOT:\tbot", "\nReload the canvas: \treload", "\nCACHE_IMAGE:\tcache", "\tUSE_COVER:\tcover");
        process.exit();
    }
}

console.info("Flags enabled: ", ENV_DEV ? "ENV_DEV" : "", USE_BOT ? "USE_BOT" : "", RELOAD ? "RELOAD" : "", CACHE_IMAGE ? "CACHE_IMAGE" : "", USE_COVER ? "USE_COVER" : "");

if (!CACHE_IMAGE)
    throw 'Image caching is now required.';

if (RELOAD && !CONFIRM_RELOAD)
    throw 'Make sure to have a backup of this. Run with CONFIRM_RELOAD to be sure';

module.exports.ENV_DEV = ENV_DEV;
module.exports.RELOAD = RELOAD;
module.exports.CACHE_IMAGE = CACHE_IMAGE;
module.exports.USE_BOT = USE_BOT;
module.exports.USE_COVER = USE_COVER;