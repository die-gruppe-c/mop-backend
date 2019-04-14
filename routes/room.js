var express = require('express');
var router = express.Router();
const auth = require('../src/config/auth');
var RoomDao = require('../src/db/daos/RoomDao');
var GuestDao = require('../src/db/daos/GuestDao');
var Room = require('../src/db/models/Room');
var Guest = require('../src/db/models/Guest');


router.post('/create', auth.required, function(req, res, next) {
    let userId = req.moderator.js.id;
    let roomName = req.headers.room_name;

    if (!roomName) {
        res.status(400);
        res.send( "Zum Erstellen eines Raums wird ein Name benötigt." );
    }

    RoomDao.insertRoom(new Room(null, roomName, userId, null), function (result) {
        res.status(201);
        res.send( "Raum wurde erfolgreich erstellt." );
    })
});

router.post('/join', auth.optional, function(req, res, next) {
    if (!req.headers.guest_token || !req.headers.guest_name){
        res.status(400);
        res.send( "Gast-Token oder Name nicht vorhanden." );
    }

    if (!req.headers.room_id){
        res.status(400);
        res.send( "Raum-Id nicht vorhanden." );
    }

    RoomDao.getRoomById(req.headers.room_id, function (room) {
        if (!room){
            res.status(400);
            res.send( "Raum existiert nicht!" );
        }

        let guest = new Guest(req.headers.guest_token);
        guest.set_name(req.headers.guest_name);

        GuestDao.exists(guest, function (exists) {
           if (!exists){
               res.status(400);
               res.send( "Gast existiert nicht!" );
           }

           RoomDao.insertParticipant(guest, room, function (result) {
               res.status(201);
               res.send( "Benutzer ist Raum beigetreten" );
           });
        });
    });

});

module.exports = router;
