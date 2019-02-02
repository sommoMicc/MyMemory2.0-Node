const messages = require("./model/communications/message");

module.exports = (http,db) => {
    const io = require("socket.io")(http);
    const Token = require("./model/db/token")(db.connection);
    const User = require("./model/db/user")(db.connection);

    let usersConnected = [];
    let socketsConnected = [];

    io.on("connection",(socket)=>{
        console.log("A user connected");
        socket.on("disconnect",()=>{
            console.log("User disconnected");
            let userDisconnected = socketsConnected[socket];
            delete usersConnected[userDisconnected];
            delete socketsConnected[socket];
        });
        socket.on("login", async (tokenValue) => {
            let token = new Token(tokenValue);
            let resultMessage;
            try {
                if(!token.isValid()) {
                    throw "Token non valido";
                }
                await token.load();
                let connectedUser = await token.getUser();

                usersConnected[connectedUser] = socket;
                socketsConnected[socket] = connectedUser;

                resultMessage = messages.success(connectedUser.username);
            }
            catch(e) {
                resultMessage = messages.error(e.toString());
                console.log(e);
            }
            socket.emit("loginResponse",resultMessage);
        });
    });
};