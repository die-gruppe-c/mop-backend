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

## Endpunkte

Bei Endpunkten die mit `AUTH` markiert sind muss ein Token im Header mitgeschickt werden.
```
Authorization: Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpb
```
Den Token erhält man beim Aufruf des Login-Endpunkts und sollte dann gespeichert werden.


### /user/login `POST` `NOAUTH` 
Benutzername und Passwort müssen im Body als JSON mitgegeben werden.
```
{	
  "email":"test6@mail.com", 
  "password":"passwort"
}
```
### /user/register `POST` `NOAUTH` 
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