const messages = require("./communications/message");

module.exports = class Game {
    constructor(io,firstPlayer,secondPlayer) {
        this.io = io;
        this.players = [
            firstPlayer,
            secondPlayer
        ];
        this.room = "game-"+this.players[0].username+"-"
            +this.players[1].username+"-"+Math.random();
        this.cards = null;
        this.turnNumber = -1;

        for(let i=0;i<this.players.length;i++) {
            this.players[i].lastCardFlipped = null;
            this.players[i].score = 0;
        }
    }

    begin() {
        this.cards = Game.generateRandomCards();
        this.players[0].socket.join(this.room,async ()=>{
            this.players[1].socket.join(this.room,()=>{
                let playersArrayToSend = [];

                for(let i=0;i<this.players.length;i++) {
                    this.players[i].score=0;
                    playersArrayToSend.push(this.players[i].username);

                    this.players[i].socket.on("cardFlipped",(index)=>{
                        console.log("cardFlipped: "+index);
                        this.players[i].socket
                            .to(this.room).emit("adversaryCardFlipped",index);

                        if(this.players[i].lastCardFlipped == null) {
                            this.players[i].lastCardFlipped = index;
                        }
                        else {
                            if(this.players[i].lastCardFlipped !== index) {
                                let lastCardFlipped = this.cards[
                                    this.players[i].lastCardFlipped];

                                if (lastCardFlipped.letter ===
                                    this.cards[index].lastCardFlipped) {
                                    //Ha fatto punto!!
                                    this.players[i].score++;
                                    this.checkIfGameFinished();
                                }
                            }
                            setTimeout(()=> {
                                this.changeTurn();
                            },1000);
                        }
                        console.log("cardFlipped: "+index);
                    });
                    this.players[i].socket.on("cardHidden",(index)=>{
                        console.log("cardHidden: "+index);
                        this.players[i].socket
                            .to(this.room).emit("adversaryCardHidden",index);
                    });

                }

                this.io.in(this.room).emit("beginGame",messages.success(
                    this.room.substr(5),
                    {
                        players: playersArrayToSend,
                        cards: this.cards
                    }
                ));
                setTimeout(()=>{
                    this.changeTurn();
                },8500);
            });
        });
    }

    leave(socket,callback) {
        socket.leave(this.room,() => {
            this.io.to(this.room).emit("adversaryLeft");
            if(callback != null) {
                callback();
            }
        });
    }

    changeTurn() {
        console.log("Cambio turno!!");
        this.turnNumber++;
        const playerNowActive = this.players[(this.turnNumber)%2];

        for(let i=0;i<this.players.length;i++) {
            this.players[i].lastCardFlipped = null;
        }

        playerNowActive.socket.emit("myTurn");
        playerNowActive.socket.to(this.room).emit("adversaryTurn");
    }

    checkIfGameFinished() {
        let totalScore = 0;
        this.players.forEach((player)=>{
            totalScore += player.score;
        });

        if(totalScore >= 6) {
            let winner = this.players[0].score > this.players[1].score ?
                this.players[0].username : this.players[1].username;
            //Trovate 6 coppie, gioco terminato
            this.io.to(this.room).emit("gameFinished",winner);
            console.log("Game finished");
        }
    }

    static generateRandomCards() {
        const cardsNumber = 12;
        let symbols = ["a","b","c","d","e","f","g","h","i","j","k","l",
            "m","n","o","p","q","r","s","t","u","v","w","x","y","z","!","?"];

        let availableColors = [
            0x5c007a,0x280680,0xac1900,0x000000,0x01579b,
            0x004d40,0x3d5afe,0x880e4f];

        for(let i=0;i<10;i++) {
            Game.shuffleArray(symbols);
            Game.shuffleArray(availableColors);
        }

        let cards = [];
        for(let i = 0;i<cardsNumber/2; i++) {
            for(let j=0;j<2;j++) {
                cards.push({
                    letter: symbols[i].toUpperCase(),
                    color: availableColors[i]
                });
            }
        }

        for(let i=0;i<4;i++) {
            Game.shuffleArray(cards);
        }

        return cards;
    }

    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    static getGameRoom(socket) {
        for (let room in socket.rooms) {
            if (room.startsWith("game-")) {
                return room;
            }
        }
        return null;
    }

    static leaveAllGames(gamesActive,socket,callback) {
        let gameRoom = this.getGameRoom(socket);
        console.log("GAME ROOM: "+gameRoom);
        Game._leaveAllGameRecursive(gameRoom,gamesActive,socket,callback)
    }

    static _leaveAllGameRecursive(gameRoom,gamesActive,socket,callback) {
        if(gameRoom == null) {
            callback();
            return;
        }
        if(gamesActive[gameRoom] != null) {
            console.log("DENtRO IF DEL WHILE");
            gamesActive[gameRoom].leave(socket,()=> {
                console.log("Chiamato leave su room "+gameRoom);

                gamesActive[gameRoom].players.forEach((player) => {
                    player.socket.removeAllListeners("cardFlipped");
                    player.socket.removeAllListeners("cardHidden");
                });
                delete gamesActive[gameRoom];
                gameRoom = this.getGameRoom(socket);
                return Game._leaveAllGameRecursive(
                    gameRoom,gamesActive,socket,callback);
            });
        }
    }
};