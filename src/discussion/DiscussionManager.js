var Util = require('./util/Util');
var DiscussionRoom = require('./DiscussionRoom');
var RoomDao = require('../db/daos/RoomDao');


const registerRegex = /^register\:/;

class DiscussionManager{


    constructor(webSocketServer){
        this._wss = webSocketServer;
        this._discussionRooms = [];

        this._wss.on('connection', (ws) => {
            ws.on('message', (message) => {
                var uuid = Util.parseMessage(registerRegex, message);

                if (uuid){
                    this._register(uuid, ws);
                }
            });
        });
    }

    async _register(uuid, ws){
        //find discussion room
        let room = await RoomDao.isInActiveRoom(uuid);

        if (!room) {
            Util.debugSend(ws,`Nutzer ${uuid} is in keinem aktiven Raum`);
            return;
        }

        let filteredRooms = this._discussionRooms.filter(function (discussionRoom) {
            return discussionRoom.getRoomId() === room._id;
        });

        let discussionRoom;

        if (filteredRooms.length === 0){
            //room is running but is not in ram start it over
            if (room._running){
                Util.debugSend(ws,`Laufender Diskussionsraum ${room._id} wurde nicht gefunden. Wird neu gestartet...`);
                await RoomDao.updateRoomRunning(room._id, false);
                room = await RoomDao.getRoomById(room._id);
                if (room._running === true) ws.terminate();
            }

            //create discussion room if it doesnt exist
            discussionRoom = new DiscussionRoom(room, this._onRoomArchived);
            this._discussionRooms.push(discussionRoom);
        }else{
            discussionRoom = filteredRooms[0];
        }

        //add guest to discussion room
        if (room._owner === uuid){
            discussionRoom.setModerator(ws);
            Util.debugSend(ws,`als Moderator zu Raum ${room._id} hinzugefüt`);
        }else{
            ws.guest_data = await RoomDao.getParticipant(uuid, room._id);
            if (!ws.guest_data) return;
            discussionRoom.addParticipant(ws);
            Util.debugSend(ws,`als Teilnehmer zu Raum ${room._id} hinzugefüt`);
        }
    }

    _onRoomArchived(discussionRoom){
        for( var i = 0; i < this._discussionRooms.length; i++){
            if ( this._discussionRooms[i] === discussionRoom) {
                this._discussionRooms.splice(i, 1);
            }
        }
    }


}

module.exports = DiscussionManager;