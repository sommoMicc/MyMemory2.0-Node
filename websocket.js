module.exports = (http) => {
    var io = require("socket.io")(http);

    io.on("connection",(socket)=>{
        console.log("A user connected");
        socket.on("disconnect",()=>{
            console.log("User disconnected")
        })
    });
}