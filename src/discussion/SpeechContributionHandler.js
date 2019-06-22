const Util = require('./util/Util');
const Stopwatch = require('./util/Stopwatch');

const MESSAGE_KEY = 'currentlySpeaking';

class SpeechContributionHandler {

    constructor(){
        this._currentlySpeaking = undefined;
        this._speechType = undefined;
        this._stopwatch = new Stopwatch();
    }

    setSpeaker(id, speechType){
        if (isNaN(id) || id < 0) return;

        this._currentlySpeaking = id;
        this._speechType = speechType;

        this._stopwatch.reset();
    }

    start(){
        if (!this._currentlySpeaking) return;
        this._stopwatch.start();
    }

    pause(){
        this._stopwatch.pause();
    }

    stop(){
        this._currentlySpeaking = undefined;
        this._speechType = undefined;
        this._stopwatch.reset();
    }

    getSpeaker(){
        return this._currentlySpeaking;
    }

    getDuration(){
        return this._stopwatch.getDuration();
    }

    getSpeachType(){
        return this._speechType;
    }

    toMessage(){
        return Util.wrapResponse(MESSAGE_KEY, {
            speaker: this.getSpeaker(),
            speechType: this._speechType,
            running: this._stopwatch.isRunning(),
            duration: this._stopwatch.getDuration()
        } );
    }

}

module.exports = SpeechContributionHandler;