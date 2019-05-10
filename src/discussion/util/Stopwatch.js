class Stopwatch {

    constructor(){
        this.reset();
    }

    reset(){
        this._running = false;
        this._startTime = new Date().getTime();
        this._interimTime = 0;
    }

    start(){
        if (!this._running){
            this._startTime = new Date().getTime();
            this._running = true;
        }
    }

    pause(){
        if (this._running){
            this._interimTime += new Date().getTime() - this._startTime;
            this._startTime = 0;
        }
    }

    isRunning(){
        return this._running;
    }

    getDuration(){
        return this._interimTime + (new Date().getTime() - this._startTime);
    }

}

module.exports = Stopwatch;