class SpeechContribution {

    constructor(id, speechtype){
        this.id = id;
        this.speechType = speechtype;
    }

    toJson(){
        return {
            id: this.id,
            speechType: this.speechType
        }
    }

    static listToJson(list){
        let json = [];
        for (let i in list){
            if (!list.hasOwnProperty(i)) continue;
            json.push(list[i].toJson());
        }
        return json;
    }

}

module.exports = SpeechContribution;