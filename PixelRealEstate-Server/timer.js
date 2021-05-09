class Timer {
    constructor() {
        this.st = 0;
    }

    start() {
        this.st = new Date().getTime();
    }

    end() {
        console.info(new Date().getTime() - this.st);
        this.st = 0;
    }
}


module.exports.instance = new Timer();