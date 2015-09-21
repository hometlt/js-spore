

/*global  window,document,setInterval */
(function(global, document) {


    var fps_meter2 = new FPSMeter( {
        heat:  1,
        graph:   1,
        top: 0
    });

    var GameOnline = function(){

        this.width = 1000;
        this.height = 1000;
        this.actors = [];

        var __self = this;

        this.socket = io();

        this.socket.on('chat message', function(data){
            __self.actors = data;
            fps_meter2.tick();
        });
    };

    var game = new GameOnline();

    global.onload = function(){
       // new Game({width: global.innerWidth,height: global.innerHeight})
        new Stage(game,{width: global.innerWidth,height: global.innerHeight})
    };

}(this, document));