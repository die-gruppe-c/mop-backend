var express = require('express');
var router = express.Router();
var RoomDao = require('../src/db/daos/RoomDao');
var Room = require('../src/db/entities/Room');
var Guest = require('../src/db/entities/Guest');


router.post('/create', async function(req, res, next) {
    let userId = req.headers.guest_uuid;
    let roomName = req.body.name;

    if (!roomName || ! userId) {
        res.status(400);
        res.send( "Zum Erstellen eines Raums wird ein Name und die Benutzer-UUID benötigt." );
        return;
    }

    const isInActiveRoom = await RoomDao.isInActiveRoom(userId);

    if (isInActiveRoom){
        res.status(400);
        res.send( "Nutzer ist bereits in einem Raum der noch nicht archiviert wurde." );
        return;
    }

    let generate_unique_id = async function(){
        let roomId = Room.generate_id();

        const room = await RoomDao.getRoomById(roomId);

        if (room){
            await generate_unique_id();
        }else{
            var newRoom = Room.createFromJson(req.body);
            newRoom._id = roomId;
            newRoom._owner = userId;

            const success = await RoomDao.insertRoom(newRoom);

            if (success){
                res.status(201);
                res.json({
                    id: roomId,
                    room_name: roomName,
                });
            } else {
                res.status(400);
                res.send('Fehler beim erstellen des Raums.');
            }

        }
    };

    generate_unique_id();

});

router.post('/join', async function(req, res, next) {

    if (!req.headers.guest_uuid){
        res.status(400);
        res.send( "Ungültige Anfrage!" );
        return;
    }

    let guest = Guest.createFromJson(req.body);

    const room = await RoomDao.getRoomById(guest._roomId);

    if (!room || room._archived || room._running){
        res.status(400);
        res.send( "Raum existiert nicht, läuft bereits oder ist archiviert!" );
        return;
    }

    if (req.headers.guest_uuid === room._owner){
        if (!guest._uuid) {
            res.status(400);
            res.send( "Wenn Moderator einen Teilnehmer hinzufügt muss dessen UUID im Body mitgegeben werden!" );
            return;
        }
        guest._createdByOwner = true;
    }else{
        guest._uuid = req.headers.guest_uuid;
        guest._createdByOwner = false;
    }

    const isAlreadyInRoom = await RoomDao.isInActiveRoom(guest._uuid);

    if (isAlreadyInRoom) {
        res.status(400);
        res.send( "Benutzer ist bereits in einem Raum der noch nicht archiviert wurde!" );
        return;
    }

    const success = await RoomDao.insertParticipant(guest);

    if (success){
        res.status(201);
        res.send( "Benutzer ist Raum beigetreten" );
    }else{
        res.status(400);
        res.send('Fehler beim Beitreten des Raums.');
    }

});

router.get('/', async function(req, res, next) {
    if (req.query.id){
        const room = await RoomDao.getRoomById(req.query.id);

        if (!room){
            res.status(400);
            res.send( "Raum existiert nicht!" );
            return;
        }
        res.json(room.toJson());
    }else{
        if (!req.headers.guest_uuid){
            res.status(400);
            res.send( "Benutzer-UUID nicht im Header vorhanden!" );
            return;
        }
        const myRooms = await RoomDao.getRoomsOfOwner(req.headers.guest_uuid);
        const roomsParticipated = await RoomDao.getRoomsParticipated(req.headers.guest_uuid);

        let roomsJson = [];

        myRooms.concat(roomsParticipated).forEach(function (room) {
            roomsJson.push(room.toJson(req.headers.guest_uuid));
        });

        res.json(roomsJson);
    }
});

router.get('/rejoin', async function(req, res, next) {
    if (!req.headers.guest_uuid){
        res.status(400);
        res.send( "Benutzer-UUID nicht im Header vorhanden!" );
        return;
    }

    const room = await RoomDao.isInActiveRoom(req.headers.guest_uuid);
    console.log(room);

    if (room) {
        res.json(room.toJson(req.headers.guest_uuid));
    }else{
        res.send();
    }
});

module.exports = router;
