var fs = require('fs');
var compress = require('lzwcompress');
var PNG = require('pngjs').PNG;
const flags = require('./flags.js');
const shell = require('shelljs');

let COVER_IMAGE = null;

const PATHS = {
    PNG_STORAGE: { dir: "./cache/", name: "image.png" },
    DATA_STORAGE: { dir: "./cache/", name: "properties.json" },
    PORTFOLIO_STORAGE: { dir: "./img/", name: "canvas.png" },
    CANVAS_STORAGE_DEV: { dir: "../PixelRealEstate/public/assets/canvas/", name: "canvas.png" },
    CANVAS_STORAGE: { dir: "../assets/canvas/", name: "canvas.png" },
    CANVAS_STORAGE_PORTFOLIO: { dir: "./img/", name: "canvas.png" },
    CANVAS_DATA_STORAGE_DEV: { dir: "../PixelRealEstate/public/assets/canvas/", name: "properties.json" },
    CANVAS_DATA_STORAGE: { dir: "../assets/canvas/", name: "properties.json" },
    BOT_IMAGES: { dir: "./BotImages/", name: "" },
}

const CacheFile = (path, data, callback) => {
    shell.mkdir('-p', path.dir);
    fs.writeFile(path.dir + path.name, JSON.stringify(data), 'utf8', (err) => {
        if (err)
            callback(err);
        else
            callback(true);
    });
};

const UncacheFile = (path, callback) => {
    shell.mkdir('-p', path.dir);
    fs.readFile(path.dir + path.name, 'utf8', (err, data) => {
        if (err)
            return callback(err, {});
        if (data)
            return callback(err, JSON.parse(data));
        console.info('No data from load.');
    });
};

const lerp = (v0, v1, t) => {
    return v0 * (1 - t) + v1 * t;
}

const CacheImage = (path, data, callback) => {
    let img = new PNG({
        filterType: 4,
        width: 1000,
        height: 1000,
    });
    if (flags.USE_COVER && COVER_IMAGE == null) {
        fs.createReadStream('./cache/cover.png')
            .pipe(new PNG({ filterType: 4 }))
            .on('parsed', function() {
                COVER_IMAGE = this;
                for (let i = 0; i < Object.keys(data).length; i++) {
                    for (let j = 0; j < data[i].length; j++) {
                        if (j % 4 == 3)
                            img.data[i * data[i].length + j] = Math.min(255, data[i][j] + COVER_IMAGE.data[i * data[i].length + j]);
                        else
                            img.data[i * data[i].length + j] = lerp(data[i][j], COVER_IMAGE.data[i * data[i].length + j], COVER_IMAGE.data[i * data[i].length + (Math.ceil(j / 4) * 4)] / 255);
                    }
                }
                shell.mkdir('-p', path.dir);
                img.pack().pipe(fs.createWriteStream(path.dir + path.name)).on('finish', () => {
                    return callback(true);
                });
            });
    } else if (flags.USE_COVER && COVER_IMAGE != null) {
        for (let i = 0; i < Object.keys(data).length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                if (j % 4 == 3)
                    img.data[i * data[i].length + j] = Math.min(255, data[i][j] + COVER_IMAGE.data[i * data[i].length + j]);
                else
                    img.data[i * data[i].length + j] = lerp(data[i][j], COVER_IMAGE.data[i * data[i].length + j], COVER_IMAGE.data[i * data[i].length + (Math.ceil(j / 4) * 4)] / 255);
            }
        }
        shell.mkdir('-p', path.dir);
        img.pack().pipe(fs.createWriteStream(path.dir + path.name)).on('finish', () => {
            return callback(true);
        });
    } else {
        for (let i = 0; i < Object.keys(data).length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                img.data[i * data[i].length + j] = data[i][j];
            }
        }
        shell.mkdir('-p', path.dir);
        img.pack().pipe(fs.createWriteStream(path.dir + path.name)).on('finish', () => {
            return callback(true);
        });
    }
}

const UncacheImage = (p, callback, fileName = null) => {
    let path = p;
    if (fileName != null)
        path.name = fileName;
    shell.mkdir('-p', path.dir);
    fs.createReadStream(path.dir + path.name)
        .on('error', (err) => {
            return callback(err, null);
        })
        .pipe(new PNG({
            filterType: 4
        }))
        .on('parsed', function() {
            let err = null; //implement errors for this
            return callback(err, this);
        });
}

module.exports.PATHS = PATHS;
module.exports.CacheFile = CacheFile;
module.exports.UncacheFile = UncacheFile;
module.exports.CacheImage = CacheImage;
module.exports.UncacheImage = UncacheImage;