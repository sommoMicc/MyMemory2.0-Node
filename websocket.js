require("./model/db/user");
require("./model/communications/message");

module.exports = (http,db) => {
    const io = require("socket.io")(http);
    const Token = require("./model/db/token")(db);
    let usersConnected = [];
    let socketsConnected = [];

    io.on("connection",(socket)=>{
        console.log("A user connected");
        socket.on("disconnect",()=>{
            console.log("User disconnected")
        });
        socket.on("login", async (tokenValue) => {
            let token = new Token(tokenValue);
            let resultMessage;
            try {
                if(!token.isValid()) {
                    throw "Token non valido";
                }
                let connectedUser = await token.getUser();
                usersConnected[connectedUser] = socket;
                socketsConnected[socket] = connectedUser;

                resultMessage = message.success(connectedUser.username);
            }
            catch(e) {
                resultMessage = message.error(e);
            }
            socket.emit("loginResponse",resultMessage);
        });
    });
}