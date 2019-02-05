const messages = require("./model/communications/message");
const Game = require("./model/game");

module.exports = (http,db) => {
    const io = require("socket.io")(http,{'pingInterval': 8000});
    const Token = require("./model/db/token")(db.connection);
    const User = require("./model/db/user")(db.connection);

    let usersConnected = [];
    let socketsConnected = [];
    let gamesActive = [];

    io.on("connection",(socket)=>{
        console.log("A user connected");
        socket.previousSearchResults = [];

        socket.on("disconnecting",()=>{
            console.log("User disconnected");

            let userDisconnected = socketsConnected[socket.id];
            if(userDisconnected != null) {
                io.to("user-" + userDisconnected.username).emit("userDisconnected",
                    userDisconnected.username);
                Game.leaveAllGames(gamesActive,socket);
                delete usersConnected[userDisconnected.username];
                delete socketsConnected[socket.id];
            }
            else {
                console.log("Si è disconnesso un utente non loggato");
            }
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

                usersConnected[connectedUser.username] = socket;
                socketsConnected[socket.id] = connectedUser;
                username = connectedUser.username;
                resultMessage = messages.success(connectedUser.username);
            }
            catch(e) {
                resultMessage = messages.error(e.toString());
                console.log(e);
            }
            socket.emit("loginResponse",resultMessage);
            if(username.length > 0)
                io.in("user-"+username).emit("userConnected",username);
        });
        socket.on("search", async (searchParameter) => {
            let currentUser = socketsConnected[socket.id];
            try {
                for(let i=0;i<socket.previousSearchResults.length;i++) {
                    let x = socket.previousSearchResults[i];
                    socket.leave(x.username,()=>{
                        console.log("Lascio stanza "+x.username);
                    });
                }
                let users = await User.query(searchParameter,currentUser);
                for(let i=0;i<users.length;i++) {
                    if(users[i].username in usersConnected) {
                        users[i]["online"] = true;
                    }
                    else {
                        users[i]["online"] = false;
                    }
                }
                socket.emit("searchResult",
                    messages.success("Ricerca completata",{
                        users: users
                    }));
                //Emit prima di questo ciclo così intanto mando avanti i risultati
                for(let i=0;i<users.length;i++) {
                    socket.join("user-"+users[i].username,()=>{
                        console.log(socket.rooms);
                    });
                }
                socket.previousSearchResults = users;
            }
            catch(e) {
                console.log(e);
            }
        });

        socket.on("sendChallenge",async (username)=>{
            console.log("Ricevuta challenge dal socket: "+socket.id);

            let otherUsername = socketsConnected[socket.id].username;
            let challengedUserSocket = usersConnected[username];
            challengedUserSocket.emit("wannaChallenge",otherUsername);
            console.log("Invio challenge a "+otherUsername+" col socket "+challengedUserSocket.id);
        });

        socket.on("challengeAccepted", async (username)=>{
            console.log(username+" ha accettato la sfida");
            //Inizio gioco
            let firstPlayer = {
                username: socketsConnected[socket.id].username,
                socket: socket
            };
            let secondPlayer = {
                username: username,
                socket:  usersConnected[username],
            };
            Game.leaveAllGames(gamesActive,socket,()=>{
                let newGame = new Game(io,firstPlayer,secondPlayer);
                gamesActive[newGame.room] = newGame;
                newGame.begin();
                console.log(gamesActive);
            });
        });


        socket.on("challengeDenided", async (username)=>{
            let userWhoDenidedChallenge = socketsConnected[socket.id];
            if(userWhoDenidedChallenge == null)
                return;

            console.log(userWhoDenidedChallenge.username+" ha rifiutato " +
                "la sfida di "+username);

            let userWhoSentChallengeSocket = usersConnected[username];
            userWhoSentChallengeSocket.emit("challengeDenided",
                userWhoDenidedChallenge.username)
        });

        socket.on("leaveGame",() => {
            console.log(socket.rooms);
            Game.leaveAllGames(gamesActive,socket,()=>{
                console.log(socket.rooms);
                console.log("User left game");
            })
        });
    });
};
