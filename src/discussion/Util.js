
class  Util{

    static parseMessage(regex, message){
        if (regex.test(message)) {
            return message.replace(regex, '').trim();
        }
    }

    static wrapResponse(command, data){
        return JSON.stringify({
            command: command,
            data: data
        });
    }

    static debugSend(ws, message){
        if (process.env.NODE_ENV !== 'production') {
            ws.send(message);
        }else{
            console.log(message);
        }
    }

}

module.exports = Util;