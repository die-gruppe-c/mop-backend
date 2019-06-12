const RoomDao = require('../db/daos/RoomDao');
const Util = require('./util/Util');
const Stopwatch = require('./util/Stopwatch');
const SpeechTypes = require('./SpeechType');
const SpeechRequest = require('./models/SpeechRequest');
const WantToSpeakList = require('./lists/WantToSpeakList');
const SpeechList = require('./lists/SpeechList');
const SortedList = require('./lists/SortedList');
const SpeechContributionHandler = require('./SpeechContributionHandler');
const StatisticHandler = require('./StatisticHandler');


//requests
//client
const wantToSpeakRegex = /^wantToSpeak:/;
const wantNotToSpeakRegex = /^wantNotToSpeak/;
//moderator
const startRegex = /^start/;
const updateUserListRegex = /^updateUserList/;
const addUserToSpeechListRegex = /^addUserToSpeechList:/;
const removeUserFromSpeechListRegex = /^removeUserFromSpeechList:/;
const changeSortOrderRegex = /^changeSortOrder:/;
const archiveRegex = /^archieve/;
//both
const startSpeechContribution = /^startSpeech/;
const pauseSpeechContribution = /^pauseSpeech/;
const stopSpeechContribution = /^stopSpeech/;

//answers
const STARTED = 'started';
const ALL_USERS = 'allUsers';
const SPEECH_TYPES = 'speechTypes';
const ROOM = 'room';
const ARCHIVED = 'archived';


const CHECK_CONNECTION_INTERVAL = 20000;
const UPDATE_SPEECH_STATISTIC_INTERVAL = 5000;

class DiscussionRoom{

    constructor(room, onArchivedCallback){
        this._room = room;
        this._onRoomArchivedCallback = onArchivedCallback;
        this._clients = [];
        this._allParticipants = [];

        this._wantToSpeakList = new WantToSpeakList();
        this._sortedUserList = new SortedList();
        this._speechList = new SpeechList();

        this._speechHandler = new SpeechContributionHandler();
        this._statisticHandler = new StatisticHandler(room);

        this._stopWatch = new Stopwatch();

        this._checkConnectionsAlive();
        this._updateSpeechStatistics();

        this._stopped = false;
    }

    getRoomId(){
        return this._room._id;
    }

    setModerator(moderator){
        this._moderator = moderator;

        //moderator functions
        moderator.on('message', (message) => {
            this._handleModeratorRequests(moderator,message);
        });

        (async () => {
            await this._broadcastUserData();

            this._sendToModerator(this._wantToSpeakList.toMessage());
            this._sendToModerator(this._speechList.toMessage());
            this._sendToModerator(this._sortedUserList.toMessage());
            this._sendToModerator(this._speechHandler.toMessage());
        })();


        this._monitorConnection(moderator);
        this._sendToModerator(DiscussionRoom._speechTypesToMessage());
        this._sendToModerator(Util.wrapResponse(ROOM, this._room.toJson(this._room._owner)));
    }

    addParticipant(participant){

        //remove existing websocket connections that are attributed to this participant
        for(let i = 0; i < this._clients.length; i++) {
            let client = this._clients[i];

            if (client.guest_data._uuid === participant.guest_data._uuid) {
                client.terminate();
                this._clients.splice(i, 1);
                i--;
            }
        }

        this._clients.push(participant);

        //participant functions
        participant.on('message', (message) => {
            this._handleParticipantRequests(participant, message)
        });

        this._monitorConnection(participant);
        this._sendToClient(participant,DiscussionRoom._speechTypesToMessage());
        this._sendToClient(participant, Util.wrapResponse(ROOM, this._room.toJson(participant.guest_data._uuid)));

        (async () => {
            await this._broadcastUserData();
            this._sendToClient(participant, this._speechList.toMessage());
            this._sendToClient(participant, this._speechHandler.toMessage());
        })();

    }

    _handleModeratorRequests(moderator, request){
        if (this._room._running) {
            switch (true) {
                case addUserToSpeechListRegex.test(request):
                    this._addUserWhoWantsToSpeechList(request);
                    break;
                case removeUserFromSpeechListRegex.test(request):
                    this._speechList.remove(Util.parseMessage(removeUserFromSpeechListRegex,request));
                    this._broadcastAll(this._speechList.toMessage());
                    break;
                case changeSortOrderRegex.test(request):
                    let messages = Util.parseMessage(changeSortOrderRegex, request).split(',');
                    if (messages.length === 2){
                        this._speechList.reorder(messages[0], messages[1]);
                        this._broadcastAll(this._speechList.toMessage());
                    }
                    break;
                case archiveRegex.test(request):
                    this._archiveRoom();
                    break;
                default:
                    this._handleCommonRequests(moderator, request);
            }
        }else{
            switch (true) {
                case startRegex.test(request):
                    this._startRoom();
                    break;
                case updateUserListRegex.test(request):
                    this._broadcastUserData();
                    break;
            }
        }
    }

    _handleParticipantRequests(participant, request){
        if (this._room._running) {
            let id = this._getFrontendIdFromClient(participant);

            switch (true) {
                case wantToSpeakRegex.test(request):
                    this._wantToSpeakList.add(id, Util.parseMessage(wantToSpeakRegex,request));
                    this._sendToModerator(this._wantToSpeakList.toMessage());
                    break;
                case wantNotToSpeakRegex.test(request):
                    this._wantToSpeakList.remove(id);
                    this._sendToModerator(this._wantToSpeakList.toMessage());
                    break;
                default:
                    this._handleCommonRequests(participant, request);
            }
        }
    }

    _handleCommonRequests(client, request){

        if (client !== this._moderator) {
            let id = this._getFrontendIdFromClient(client);

            if (isNaN(id) || id !== this._speechHandler.getSpeaker()) return;
        }

        switch (true) {
            case startSpeechContribution.test(request):
                this._speechHandler.start();
                break;
            case pauseSpeechContribution.test(request):
                this._speechHandler.pause();
                break;
            case stopSpeechContribution.test(request):
                this._speechHandler.pause();
                let guest = this._getParticipantFromFrontendId(this._speechHandler.getSpeaker());
                if (!guest) return;
                this._statisticHandler.addRecord(guest, this._speechHandler.getDuration());
                this._speechHandler.stop();
                let nextSpeaker = this._speechList.removeFirst();
                if (nextSpeaker) this._speechHandler.setSpeaker(nextSpeaker.id, nextSpeaker.speechType);
                this._broadcastAll(this._speechList.toMessage());
                break;
        }
        this._broadcastAll(this._speechHandler.toMessage());
    }

    //start: user functions

    async _startRoom(){

        if (this._room._archived || this._room._running){
            return;
        }

        await RoomDao.updateRoomRunning(this.getRoomId(), true);

        this._room = await RoomDao.getRoomById(this.getRoomId());

        if (this._room._running) {
            this._broadcastAll(Util.wrapResponse(STARTED));

            this._stopWatch.start();

            this._allParticipants = await RoomDao.getAllParticipants(this.getRoomId());

            for (let i in this._allParticipants) {
                this._allParticipants[i]._frontendId = i;
            }

            this._sortedUserList.updateList(this._allParticipants);

            await this._broadcastUserData();
            this._sendToModerator(this._sortedUserList.toMessage());
        }
    }

    async _archiveRoom(){
        let success = await RoomDao.archiveRoom(this.getRoomId());

        if (success){
            this._broadcastAll(Util.wrapResponse(ARCHIVED));

            this._onRoomArchivedCallback(this);

            this._stopped = true;
        }
    }

    async _addUserWhoWantsToSpeechList(request){
        //remove from want to speak list and add to speech list
        let reqId = Util.parseMessage(addUserToSpeechListRegex,request);


        let wantToSpeakItem = this._wantToSpeakList.contains(reqId);
        if (wantToSpeakItem){
            this._wantToSpeakList.remove(reqId);
        }else{
            if (isNaN(reqId)) return;
            wantToSpeakItem = new SpeechRequest(reqId,SpeechTypes.SPEECH_CONTRIBUTION);
        }

        this._broadcastAll(this._wantToSpeakList.toMessage());

        if (!this._speechHandler.getSpeaker() && this._speechList.getLength() === 0) {
            this._speechHandler.setSpeaker(wantToSpeakItem.id, wantToSpeakItem.speechType);
            this._broadcastAll(this._speechHandler.toMessage());
        }else{
            this._speechList.add(wantToSpeakItem.id,wantToSpeakItem.speechType);
            this._broadcastAll(this._speechList.toMessage());
        }

    }

    //end: user functions

    _getFrontendIdFromClient(client){
        if (!this._room._running || client === this._moderator) return false;

        let filteredParticipants = this._allParticipants.filter(function (item) {
           return client.guest_data._uuid === item._uuid;
        });

        if (filteredParticipants.length === 0) return false;

        return filteredParticipants[0]._frontendId;
    }

    _getParticipantFromFrontendId(id){
        let filteredParticipants = this._allParticipants.filter(function (item) {
            return id === item._frontendId;
        });

        if (filteredParticipants.length === 0) return false;

        return filteredParticipants[0];
    }

    static _speechTypesToMessage(){
        return Util.wrapResponse(SPEECH_TYPES, SpeechTypes);
    }

    async _broadcastUserData(){

        let participants;

        if (this._room._running){
            participants = this._allParticipants;
        }else {
            participants = await RoomDao.getAllParticipants(this.getRoomId());
        }

        let json = [];

        //update online status
        for (let i in participants){
            if (!participants.hasOwnProperty(i)) continue;
            let guest = participants[i];

            let filteredRoomParticipants = this._clients.filter(function (roomParticipant) {
                return roomParticipant.guest_data._uuid === guest._uuid;
            });

            guest._online = filteredRoomParticipants.length !== 0;
            json.push(guest.toJson());
        }

        try{
            this._sendToModerator(Util.wrapResponse(ALL_USERS, json));
        }catch (e) {
            console.log(e);
        }

        //each client seperately to show which entry belongs to the client
        for (let i in this._clients) {
            if (!this._clients.hasOwnProperty(i)) continue;
            json = [];

            for (let a in participants){
                if (!participants.hasOwnProperty(a)) continue;
                let guest = participants[a];
                json.push(guest.toJson(this._clients[i].guest_data._uuid))
            }
            try{
                this._sendToClient(this._clients[i],Util.wrapResponse(ALL_USERS, json));
            }catch (e) {
                console.log(e);
            }
        }
    }

    _broadcastToParticipants(message){
        for (let i in this._clients) {
            this._sendToClient(this._clients[i], message);
        }
    }

    _broadcastAll(message){
        this._sendToModerator(message);
        this._broadcastToParticipants(message);
    }

    _sendToModerator(message){
        this._sendToClient(this._moderator,message);
    }

    _sendToClient(ws_client,message){
        if (this._stopped) return;
        ws_client.send(message,function (error) {
           //console.log(error);
        });
    }

    _checkConnectionsAlive(){
        //Check if connection is still alive
        setInterval(() => {
            let statusChanged = false;
            for(let i = 0; i < this._clients.length; i++){
                let conn = this._clients[i];

                if (!conn.isAlive) {
                    statusChanged = true;
                    //conn.terminate();

                    //remove from list
                    this._clients.splice(i, 1);
                    i--;

                    continue;
                }

                conn.isAlive = false;
                try{
                    conn.ping();
                }catch (e) {
                    //connection is not alive anymore
                }
            }

            if (statusChanged) {
                this._broadcastUserData();
            }
        }, CHECK_CONNECTION_INTERVAL);
    }

    _monitorConnection(participant){
        participant.isAlive = true;

        participant.on('pong', () => {
            participant.isAlive = true;
        });
    }

    _updateSpeechStatistics() {
        setInterval(() => {
            if (this._room._running){
                this._sendToModerator(this._statisticHandler.toMessage(
                    this._getParticipantFromFrontendId(this._speechHandler.getSpeaker()), this._speechHandler.getDuration()));
            }
        }, UPDATE_SPEECH_STATISTIC_INTERVAL);
    }
}

module.exports = DiscussionRoom;