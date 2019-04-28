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
Bei jeder Anfrage muss die UUID des Benutzers im Request-Header angegeben werden:
```
guest_uuid: ed6cb2a9-85ce-4020-bb28-df828b11f8f8
```

### /room/create `POST`
Erstellt einen neuen Diskussionsraum. Maximale Raumlänge: 50 Zeichen.

Request-Body:
```
{
  "name": "Raum1",
  "attributes": [
    {
      "name": "Geschlecht",
      "values": [
        {
          "name": "männlich",
          "color": "#00ff23",
          "weight": "40"
        },
        {
          "name": "weiblich",
          "color": "#00ff64",
          "weight": "60"
        }
      ]
    },
    {
      "name": "Alter",
      "values": [
        {
          "name": "jung",
          "color": "#ff35e5",
          "weight": "70"
        },
        {
          "name": "alt",
          "color": "#ee3533",
          "weight": "30"
        }
      ]
    }
  ]
}
```
Antwort:
```
{
    "id": 3717,
    "room_name": "Testraum1",
}
```

### /room/join `POST`
Lässt einen Gast einem Raum beitreten. Im Header muss immer die UUID des Benutzers mitgegeben werden, auch
wenn der Moderator einen Gast hinzu fügt. Die UUID im Body muss nur angegeben werden wenn der Moderator
den Teilnehmer hinzufügt. Die UUID im Body sollte im Frontend dafür neu generiert werden.

Request-Body:
```
{
 "roomId": "4825",
 "name": "Name1",
 "uuid": "sdf-flsl23-3l432-3efl",
 "attributes": [
  {
   "name": "Geschlecht",
   "values": [
    {
     "name": "männlich"
    }
   ]
  },
  {
   "name": "Alter",
   "values": [
    {
     "name": "jung"
    }
   ]
  }
 ]
}
```

### /room `GET`
Ohne Parameter: Gibt alle Raume zurück die der Nutzer erstellt hat oder an 
welchen er teilgenommen hat. Die Benutzer-UUID muss im Header angegeben werden.
Wenn der Nutzer den Raum erstellt hat ist die UUID im Raum mit angegeben. Wenn er nur 
Teilgenommen hat ist das Feld leer.

Mit Parameter `?id=1234`: Ein Raum wird zurückgegeben.

```
{
  "id": 1671,
  "name": "Raum1",
  "owner": "",
  "created_on": "2019-04-23T18:02:36.377Z",
  "archived": false,
  "running": false,
  "attributes": [
    {
      "name": "Geschlecht",
      "values": [
        {
          "name": "männlich",
          "color": "#00ff23",
          "weight": 40
        },
        {
          "name": "weiblich",
          "color": "#00ff64",
          "weight": 60
        }
      ]
    },
    {
      "name": "Alter",
      "values": [
        {
          "name": "alt",
          "color": "#ee3533",
          "weight": 30
        },
        {
          "name": "jung",
          "color": "#ff35e5",
          "weight": 70
        }
      ]
    }
  ]
}
```

### /room/rejoin `GET`
Wenn der Benutzer in einem Raum ist der noch nicht archiviert ist
wird diesre zurückgegeben. Falls nicht kommt nichts zurück. Wenn das
UUID-Feld (Owner) im Raum gefüllt ist, ist der Benutzer der Ersteller des Raums.
