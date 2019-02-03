const messages = require("./model/communications/message");

module.exports = (http,db) => {
    const io = require("socket.io")(http);
    const Token = require("./model/db/token")(db.connection);
    const User = require("./model/db/user")(db.connection);

    let usersConnected = [];
    let socketsConnected = [];

    io.on("connection",(socket)=>{
        console.log("A user connected");
        socket.previousSearchResults = [];

        socket.on("disconnect",()=>{
            console.log("User disconnected");
            let userDisconnected = socketsConnected[socket];
            if(userDisconnected != null)
                io.to(userDisconnected.username).emit("userDisconnected",
                    userDisconnected.username);

            delete usersConnected[userDisconnected];
            delete socketsConnected[socket];
        });
        socket.on("login", async (tokenValue) => {
            let token = new Token(tokenValue);
            let resultMessage;
            let username = "";
            try {
                if(!token.isValid()) {
                    throw "Token non valido";
                }
                await token.load();
                let connectedUser = await token.getUser();

                usersConnected[connectedUser] = socket;
                socketsConnected[socket] = connectedUser;
                username = connectedUser.username;
                resultMessage = messages.success(connectedUser.username);
            }
            catch(e) {
                resultMessage = messages.error(e.toString());
                console.log(e);
            }
            socket.emit("loginResponse",resultMessage);
            if(username.length > 0)
                io.to(username).emit("userConnected",username);
        });
        socket.on("search", async (searchParameter) => {
            console.log("Risultati ricerca: ");
            try {
                for(let i=0;i<socket.previousSearchResults.length;i++) {
                    let x = socket.previousSearchResults[i];
                    socket.leave(x.username,null);
                    console.log("Lascio stanza "+x.username);
                }
                let users = await User.query(searchParameter);
                for(let i=0;i<users.length;i++) {
                    if(users[i] in usersConnected) {
                        users[i]["online"] = true;
                    }
                    else {
                        users[i]["online"] = false;
                    }
                }
                console.log(users);
                socket.emit("searchResult",
                    messages.success("Ricerca completata",{
                        users: users
                    }));
                //Emit prima di questo ciclo così intanto mando avanti i risultati
                for(let i=0;i<users.length;i++) {
                    socket.join(users[i].username);
                    console.log("Joino stanza "+users[i].username);
                    console.log(socket.rooms);
                }
                socket.previousSearchResults = users;
            }
            catch(e) {
                console.log(e);
            }
        });
        socket.on("leaveUsersRoom", async (roomsToLeave) => {
            socket.isLeavingRooms = true;
            roomsToLeave = JSON.parse(roomsToLeave);
            for(let i=0;i<roomsToLeave.length;i++) {
                socket.leave(roomsToLeave[i],()=>{
                   console.log("Room left: "+roomsToLeave);
                });
            }
            socket.isLeavingRooms = false;
        });
    });
};