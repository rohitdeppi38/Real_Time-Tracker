const express = require('express');
const http = require('http');
const path = require('path')
const socketio = require('socket.io');

const app = express();

const server = http.createServer(app);
const io = socketio(server);

app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')))


io.on("connection",function(socket){
    socket.on("send-location",function(data){
        io.emit("receive-location",{id:socket.id,...data});
    });

    socket.on("disconnect",function(){
        io.emit("user-disconnected",socket.id);
    })
})


app.get('/',function(req,res){
    res.render("index")
})

const DEFAULT_PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

function startServer(port){
    server.listen(port, function(){
        console.log(`server started on PORT ${port}`);
    });

    server.once('error', function(err){
        if(err && err.code === 'EADDRINUSE'){
            console.warn(`Port ${port} in use, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error(err);
            process.exit(1);
        }
    });
}

startServer(DEFAULT_PORT);