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
            this._running = false;
            this._interimTime += new Date().getTime() - this._startTime;
            this._startTime = 0;
        }
    }

    isRunning(){
        return this._running;
    }

    getDuration(){
        if (this._running){
            return this._interimTime + (new Date().getTime() - this._startTime);
        } else{
            return this._interimTime;
        }
    }

}

module.exports = Stopwatch;