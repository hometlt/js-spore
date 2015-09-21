
var GAMEMODES = {
    WRAPPED: 0,
    CONTINOUS: 1
};


var Game = function(options){

    var parameters = {
        width: 800,
        height: 800,
        gamemode: GAMEMODES.CONTINOUS,
        actorsSettings: {
            KILLER: 5,
            MOB: 100,
            SCAVENGER: 6,
            FOOD: 100,
            SHIT: 50,
            CORPSE: 30,
            DRAGON: 1
        }
    }

    mixin(parameters,options);
    mixin(this,parameters);

    mixin(this,{
        actors  : [],
        stage   : {},
        playing : true,
        target  : null,
        moveMode: false
    });

    Actor.prototype.game = this;


    //this.chart = new Chart(this);
    this.stage = new Stage(this);

    this.createActors();
};


Game.prototype = {
    createActors: function(){


        // create pool of actors
        for (var actorType in this.actorsSettings) {

            for (var i = 0; i < this.actorsSettings[actorType]; i++) {
                this.actors.push(new Actor({actorType: TYPES[actorType]}));
            }

        }


        // create pool of actors
        for (var actorType in this.actorsSettings) {

            for (var i = 0; i < this.actorsSettings[actorType]; i++) {
                this.actors.push(new Actor({actorType: TYPES[actorType]}));
            }

        }
    },
    getActor: function(x,y){

        var closest_actor = null;
        var closest_distance = 20;

        for (var i = 0; i < this.actors.length; i++) {
            this.actors[i].selected = false;
            var distance = Math.distance(this.actors[i].x,this.actors[i].y,x,y);
            if(closest_distance > distance ){
                closest_distance = distance;
                closest_actor = this.actors[i];
            }
        }

        return closest_actor;
    }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  Stage  /////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function Stage(game) {

    this.game = game;

    mixin(this, {
        canvas: document.getElementById('kannwas'),
        FPS: 30
    });

    this.canvas.width = this.game.width;
    this.canvas.height = this.game.height;
    this.context = this.canvas.getContext("2d");

    this.c = "rgba(0, 0, 0, 1   )"; // color

    this.scale = 1;




    this.controls();
// STAGE Object

    this.fps_meter = new FPSMeter( {
        bottom:   0,
        heat:  1,
        graph:   1,
        top: "auto"
    });

    var __self = this;
    setInterval(function tick() {
        __self.clear();
        __self.render();
        __self.fps_meter.tick();
    }, 1000 / this.FPS);
}

Stage.prototype = {

    controls: function(){
        var __self = this;

        this.canvas.oncontextmenu = function (e) {
            e.preventDefault();
        };

        this.mouseTarget = null;

        this.canvas.addEventListener('mousemove', function (e){
            __self.mouseTarget = e;
//            if(__self.moveMode && e.button == 2){
            __self.game.target = {x :( e.x + __self.x )/ __self.scale,y:  ( e.y + __self.y ) / __self.scale};
//            }
        });
        this.selectedActor = null;
        this.canvas.addEventListener('mouseup', function (e){
            __self.mouseTarget = e;
//            if(e.button == 2){
//                __self.moveMode = false;
//                __self.game.target = null;
//            }else{
            var _actor = __self.game.getActor((e.x + __self.x)/ __self.scale,(e.y + __self.y) / __self.scale);

            if(_actor){
                _actor.selected = true;
                __self.selectedActor = _actor;
                __self.moveMode = true;
                __self.game.target = {x : ( e.x + __self.x ) / __self.scale,y:  ( e.y + __self.y ) / __self.scale}
                __self.scale = 4;

            }else{

                __self.scale = 1;
            }
//            }

        }, false);

    },
    killingControl: function(){
        var _a = this.game.actors,_ai, i;

        for (i = _a.length; _ai = _a[--i];) {
            if(_ai.killed){
                if(_a.selected){
                    this.selectedActor = null;
                }
                _a.splice(i,1);
            }
        }
    },

    feedingControl: function(){
        var _a = this.game.actors,_ai, i;

        for (i = _a.length; _ai = _a[--i];) {
            if(_ai.fed){

                if(_ai.size > _ai.max_size){
                    _ai.setSize(_ai.size /2);


                    _a.push(new Actor(_ai));
                }

                _ai.fed = false;
            }
        }


    },
    render: function() {

        this.killingControl();
        this.feedingControl();



        var _a = this.game.actors,_ai, i;
        // draw each actor
        for (i = _a.length; _ai = _a[--i];) {
            _ai.calc();
            this.draw(_ai);
        }

    },
    x : 0,
    y: 0,
    draw: function(_ai) {
        var s = this.scale;
        if(this.selectedActor){

            var p = this.selectedActor.getCoordinate(_ai.x , _ai.y);

            if((p.x > this.selectedActor.x && (p.x - this.selectedActor.x) * s > window.innerWidth/2 )||
               (p.x < this.selectedActor.x && (this.selectedActor.x  - p.x ) * s > window.innerWidth/2 )||
               (p.y > this.selectedActor.y && (p.y - this.selectedActor.y) * s > window.innerHeight/2 )||
               (p.y < this.selectedActor.y && (this.selectedActor.y  - p.y ) * s > window.innerHeight/2 )){
                _ai.tail = [];
                _ai.lastpos = null;
                return;
            }

            this.x = this.selectedActor.x * s - window.innerWidth/2;
            this.y = this.selectedActor.y * s - window.innerHeight/2;
        }else{

            var p = _ai;
        }

        var r, g, b, c;


        if(_ai.selected) {
            c = "#00FF00";
        }else {
            if (_ai.cb) {
                c = _ai.color;
            } else {
                r = Math.round(255 - _ai.c);
                g = Math.round(_ai.c);
                b = 255;
                c = "rgba(" + r + ", " + g + ", " + b + " , " + _ai.a + ")";
            }
        }

        this.context.fillStyle = c;



        //хвост
        if(!_ai.actorType.passive){

            if(_ai.lastpos){
                _ai.tail.push({x:(_ai.x - _ai.lastpos.x)* s, y:(_ai.y - _ai.lastpos.y)* s});
                if(_ai.tail.length > 10){
                    _ai.tail.splice(0,1);
                }
            }

            var x = p.x * s- this.x;
            var y = p.y * s- this.y;
            for(var i = _ai.tail.length;i--;){
                x -=_ai.tail[i].x;
                y -=_ai.tail[i].y;
                this.context.globalAlpha*=0.75 ;
                this.context.beginPath();
                this.context.arc(x , y , _ai.radius* s, 0, Math.PI * 2, true);
                this.context.closePath();
                this.context.fill();
            }
            this.context.globalAlpha= 1;
        }


        this.context.beginPath();
        this.context.arc(p.x * s- this.x, p.y* s- this.y, _ai.radius* s, 0, Math.PI * 2, true);
        this.context.closePath();
        this.context.fill();
        _ai.lastpos =({x:_ai.x , y:_ai.y});



        if(this.mouseTarget){
            this.game.target = {x :( this.mouseTarget.x + this.x )/ this.scale,y:  ( this.mouseTarget.y + this.y ) / this.scale};
        }
    },
    clear: function() {
        this.context.fillStyle = this.c;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
};










