# MOP Backend

## Run locally
1. Clone Repository
2. Install dependencies `npm install`
3. Run `DEBUG=mop-backend:* npm start`

## Deploy on Heroku
Push to master. Gets deployed automatically.

## URL
`https://mop-gruppec-backend.herokuapp.com/`

## Endpunkte
Es gibt eine Postman Collection im Ordner `postman-collection`. 
Diese Collection ist nich immer aktuell.
Zum benutzten muss nur die `MOP.postman_collection.json` Datei in Postman importiert werden. 
In dieser Collection werden Umgebungsvariablen benutzt welche in `MOP.postman_environment.json` gespeichert sind und ebenfalls importiert werden können.   

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

### /room/leave `POST`
Lässt einen Gast einen Raum verlassen dem er zuvor beigetreten ist. Der
Raum darf jedoch noch nicht gestartet sein.

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

## Websocket Commands

Id ist in diesem Kontext die Frontend-Id die nach start des Raums in der "allUsers" 
Nachricht enthalten ist.

### Anfragen

#### register: `UUID`
Ordnet die Websocket-Verbindung einem Benutzer zu. Muss direkt nach dem
Verbinden aufgerufen werden.

#### start
Nur Moderator wenn Raum noch nicht läuft.

Started den Raum. Schickt danach allen die endgültige Nutzerliste samt
Frontend-Id.

#### updateUserList
Nur Moderator.
 
Aktualisiert die Daten der Gäste. Antwort: allUsers

#### addUserToSpeechList: `ID`
Nur Moderator und wenn Raum bereits läuft.

Fügt einen Client der sich gemeldet hat der Redeliste hinzu.

#### changeSortOrder: `ID`,`INDEX`
Nur Moderator und wenn Raum bereits läuft.

Ändert die Reihenfolge auf der Redeliste.

#### wantToSpeak: `SPEECH TYPE`
Nur Client wenn Raum bereits läuft.

Fügt der Melde-Liste einen Redebeitrag des Nutzers hinzu. Auf der
Melde-Liste kann ein Nutzer nur ein mal stehen. Alle anderen Meldungen
werden ignoriert.

#### wantNotToSpeak
Nur Client wenn Raum bereits läuft.

Löscht die Meldung des Nutzers. 

#### startSpeech
Startet den Redebeitrag des aktuellen Redners

#### pauseSpeech
Pausiert den Redebeitrag des aktuellen Redners

#### stopSpeech
Stoppt den Redebeitrag des aktuellen Redners und macht den
ersten auf der Redeliste zum aktuellen Redner.

#### archieve
Lässt Moderator den Raum archivieren.

### Antworten

Antworten werden in einem Wrapper verschickt:

```
{
    "command": "stared",
    "data": 
}
```


#### started
Benachrichtigt alle dass der Raum vom Moderator gestarted wurde.

#### archived
Benachrichtigt alle dass der Raum archiviert wurde.

#### speechTypes
Redebeitrag-Typen. Bei senden an den Server immer die Id und nicht den
Namen verwenden!
```
{
  "command": "speechTypes",
  "data": {
    "SPEECH_CONTRIBUTION": 1,
    "QUESTION": 2
  }
}
```

#### allUsers
Daten der Gäste. Frontend_id Attribut nur vorhanden nachdem der Raum
gestartet wurde. UUID Feld nur gefüllt, wenn dieser Gast zum App-Benutzer
gehört.

```
{
  "command": "allUsers",
  "data": [
    {
      "roomId": 3952,
      "uuid": "",
      "name": "Name1",
      "createdByOwner": false,
      "online": false,
      "attributes": [
        {
          "name": "Alter",
          "values": [
            {
              "name": "jung",
              "color": "#ff35e5",
              "weight": 70
            }
          ]
        },
        {
          "name": "Geschlecht",
          "values": [
            {
              "name": "männlich",
              "color": "#00ff23",
              "weight": 30
            }
          ]
        }
      ],
      "frontend_id": "0"
    }
  ]
}
```

#### speechList
Redeliste
```
{
  "command": "speechList",
  "data": [
    {
      "id": "1",
      "speechType": 2
    },
    {
      "id": "0",
      "speechType": 2
    }
  ]
}
```

#### wantToSpeakList
Meldeliste
```
{
  "command": "wantToSpeakList",
  "data": [
    {
      "id": "1",
      "speechType": 2
    },
    {
      "id": "0",
      "speechType": 2
    }
  ]
}
```

#### sortedList
Sortierte Liste
```
{
  "command": "sortedList",
  "data": [2,3,1]
}
```

#### currentlySpeaking
Aktueller Redner
```
{
  "command": "currentlySpeaking",
  "data": {
              "speaker": 2,
              "speechType": 1,
              "running": true,
              "duration": 34342
          }
}
```

#### speechStatistics
Redesatistik

Gesamtzeit in Millisekunden. Werte prozentual zur Gesamtzeit.

```
{
  "command": "speechStatistics",
  "data": {
              "Geschlecht": {
                "total": 34534545,
                "values": {
                    "männlich": 60,
                    "weiblich": 40
                }
              }
          }
}
```