const messages = require("./communications/message");

module.exports = class Game {
    constructor(io,firstPlayer,secondPlayer) {
        this.io = io;
        this.players = [
            firstPlayer,
            secondPlayer
        ];
        this.room = "game-"+this.players[0].username+"-"
            +this.players[1].username;
        this.cards = null;
    }

    begin() {
        this.cards = this.generateRandomCards();
        this.players[0].socket.join(this.room,async ()=>{
            this.players[1].socket.join(this.room,()=>{
                let playersArrayToSend = [];

                for(let i=0;i<this.players.length;i++) {
                    this.players[i].score=0;
                    playersArrayToSend.push(this.players[i].username);
                }

                this.io.in(this.room).emit("beginGame",messages.success(
                    this.room.substr(5),
                    {
                        players: playersArrayToSend,
                        cards: this.cards
                    }
                ));
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

    generateRandomCards() {
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
}