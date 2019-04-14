# MOP Backend

## Run locally
1. Clone Repository
2. Install dependencies `npm install`
3. Run `DEBUG=mop-backend:* npm start`

## Deploy on Heroku
1. Install Heroku Cli
2. Login `heroku login`
3. Configure Heroku remote `heroku git:remote -a mop-gruppec-backend`
4. Push to Heroku remote `git push heroku master`
5. Open in Browser `heroku open`

## URL
`https://mop-gruppec-backend.herokuapp.com/`

## Endpunkte

Bei Endpunkten die mit `AUTH` markiert sind muss ein Token im Header mitgeschickt werden.
```
Authorization: Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpb
```
Den Token erhält man beim Aufruf des Login-Endpunkts und sollte dann gespeichert werden.


### /moderator/login `POST` `NOAUTH` 
Benutzername und Passwort müssen im Body als JSON mitgegeben werden.
```
{	
  "email":"test6@mail.com", 
  "password":"passwort"
}
```
### /moderator/register `POST` `NOAUTH` 
Benutzername und Passwort müssen im Header mitgegeben werden.
```
email: test6@mail.com
password: passwort
```
Antwort:
```
{
"user":{
    "id": 8,
    "email": "test3@mail.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QzQG1haWwuY29tIiwiaWQiOjgsImlhdCI6MTU1NTA5MDQ2Nn0.qyIk8TPz8-0I85S5R7B4mEsijvI-6D50laCDyD9QrGA"
    }
}
```

### /guest/request `GET` `NOAUTH` 
Erstellt einen Gast-Token und schickt ihn als JSON zurück. Gast-Token sollte beim ersten Start der App angefragt werden 
und immer wieder verwendet werden.

### /room/create `POST` `AUTH` 
Erstellt einen neuen Diskussionsraum. Name des Raums muss im Header angegeben werden. Maximale Raumlänge: 50 Zeichen.
```
room_name: Diskussionsraum1
```

### /room/join `POST` `NOAUTH` 
Lässt einen Gast einem Raum beitreten. Gastname kann für jeden Raum neu vergeben werden.
```
guest_token: 4b4c0aba-75b7-4747-ac6e-f8f7fc72554c
room_id: 2
guest_name: Gastname1
```