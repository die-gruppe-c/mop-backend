CREATE TABLE room(
	id INT PRIMARY KEY,
	name VARCHAR (50) NOT NULL,
	owner VARCHAR (36) NOT NULL,
	created_on TIMESTAMP NOT NULL,
	archived BOOLEAN NOT NULL,
	running BOOLEAN NOT NULL,
	runtime INT
);

CREATE TABLE room_attribute(
	name VARCHAR (50) NOT NULL,
	room_id INT REFERENCES room (id) ON DELETE CASCADE,
	PRIMARY KEY (name, room_id)
);

CREATE TABLE room_attribute_value(
	name VARCHAR (50) NOT NULL,
	attribute_name VARCHAR (50),
	room_id INT,
	color VARCHAR (7) NOT NULL,
	weight INT,
	FOREIGN KEY (attribute_name, room_id) REFERENCES room_attribute (name, room_id) ON DELETE CASCADE,
	PRIMARY KEY (name, attribute_name, room_id)
);


CREATE TABLE room_participant(
	room_id INT REFERENCES room (id) ON DELETE CASCADE,
	guest_id VARCHAR (36) NOT NULL,
	guest_name VARCHAR(50) NOT NULL,
	created_by_owner BOOLEAN NOT NULL,
	PRIMARY KEY (room_id, guest_id)
);

CREATE TABLE room_participant_attribute(
	room_id INT,
	guest_id VARCHAR (36),
	attribute VARCHAR (50),
	attribute_value VARCHAR (50),
	PRIMARY KEY (room_id, guest_id, attribute, attribute_value),
	FOREIGN KEY (room_id, guest_id) REFERENCES room_participant (room_id, guest_id) ON DELETE CASCADE,
	FOREIGN KEY (attribute, attribute_value, room_id) REFERENCES room_attribute_value (attribute_name, name, room_id) ON DELETE CASCADE
);

CREATE TABLE speech_statistic(
    id SERIAL PRIMARY KEY,
    room_id INT REFERENCES room (id) ON DELETE CASCADE,
    guest_id VARCHAR (36),
    duration INT,
    FOREIGN KEY (room_id, guest_id) REFERENCES room_participant (room_id, guest_id) ON DELETE CASCADE
);



