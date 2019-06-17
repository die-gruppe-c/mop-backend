var expect = require('chai').expect;
var RoomDao = require('../src/db/daos/RoomDao');

describe('parse Participants', function () {
    it('one attribute', function () {

        let rows = [
            { room_id: 1234, guest_id: 3456, guest_name: "Name", created_by_owner: true, attribute: "Attr1", attribute_value: "w1", color: "#ffffff", weight: 0 },
            { room_id: 1234, guest_id: 5342, guest_name: "Name", created_by_owner: true, attribute: "Attr2", attribute_value: "w2", color: "#ffffff", weight: 0 },
        ];

        let guests = RoomDao._parseParticipantRows(rows);

        console.log(guests);

        // 3. ASSERT
        expect(guests.length).to.be.equal(2);

        expect(guests[0]._attributes.length).to.be.equal(1);
        expect(guests[1]._attributes.length).to.be.equal(1);

        expect(guests[0]._attributes[0]._valueDurations.length).to.be.equal(1);
        expect(guests[1]._attributes[0]._valueDurations.length).to.be.equal(1);

    });

    it('two attributes', function () {

        let rows = [
            { room_id: 1234, guest_id: 3456, guest_name: "Name", created_by_owner: true, attribute: "Attr1", attribute_value: "w1", color: "#ffffff", weight: 0 },
            { room_id: 1234, guest_id: 3456, guest_name: "Name", created_by_owner: true, attribute: "Attr2", attribute_value: "w1", color: "#ffffff", weight: 0 },
            { room_id: 1234, guest_id: 5342, guest_name: "Name2", created_by_owner: true, attribute: "Attr1", attribute_value: "w2", color: "#ffffff", weight: 0 },
            { room_id: 1234, guest_id: 5342, guest_name: "Name2", created_by_owner: true, attribute: "Attr2", attribute_value: "w2", color: "#ffffff", weight: 0 },
        ];

        let guests = RoomDao._parseParticipantRows(rows);

        console.log(guests);

        // 3. ASSERT
        expect(guests.length).to.be.equal(2);

        expect(guests[0]._attributes.length).to.be.equal(2);
        expect(guests[1]._attributes.length).to.be.equal(2);

        expect(guests[0]._attributes[0]._valueDurations.length).to.be.equal(1);
        expect(guests[0]._attributes[1]._valueDurations.length).to.be.equal(1);
        expect(guests[1]._attributes[0]._valueDurations.length).to.be.equal(1);
        expect(guests[1]._attributes[1]._valueDurations.length).to.be.equal(1);

    });
});
