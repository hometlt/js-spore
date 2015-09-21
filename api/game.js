

var Actor = require('./actor.js');
var utils = require('./utils.js');
var TYPES = require('./types.js');
var RELATIONS = require('./relations.js');

require('./math.utils.js');



var Game = function(options){

    var parameters = {
        width: 800,
        height: 800,
        gamemode: this.GAMEMODES.CONTINOUS,
        actorsSettings: {
            KILLER: 5,
            MOB: 100,
            SCAVENGER: 5,
            FOOD: 100,
            SHIT: 30,
            CORPSE: 30,
            DRAGON: 0
        }
    };

    utils.mixin(parameters,options);
    utils.mixin(this,parameters);

    utils.mixin(this,{
        actors  : [],
        stage   : {},
        playing : true,
        target  : null,
        moveMode: false
    });

    Actor.prototype.game = this;

    this.createActors();



    var __self = this;
    setInterval(function tick() {
        __self.calcGame();
        __self.send();
    }, 1000 / this.FPS);
};

Game.prototype = {

    GAMEMODES : {
        WRAPPED: 0,
        CONTINOUS: 1
    },
    getInfo: function(){
        return this.actors;
    },
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
    killingControl: function(){
        var _a = this.actors,_ai, i;

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
        var _a = this.actors,_ai, i;

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

    /**
     * рассчет движения моба. под управлением игрока , или под влиянием других мобов
     */
    calcRelation: function(a,b){
        if(a.actorType.passive && b.actorType.passive)return;
        //if(a.selected && b.selected) return;

        var relA = a.actorType.relations[b.actorType.name].type;
        var relB = b.actorType.relations[b.actorType.name].type;
        if(relA == RELATIONS.NONE && relB == RELATIONS.NONE )return;

        //если объекты слишком далеко друг от друга - нет взаимодейтсвия
        //danger distance
        var d_a = a.actorType.relations[b.actorType.name].distance;
        var d_b = a.actorType.relations[b.actorType.name].distance;
        var _c = a.getCoordinate(b.x,b.y);

        if(Math.abs(a.x - _c.x) > d_a || Math.abs(a.y - _c.y) > d_a){
            relA = RELATIONS.NONE;
        }
        if(Math.abs(a.x - _c.x) > d_b || Math.abs(a.y - _c.y) > d_b){
            relB = RELATIONS.NONE;
        }
        if(relA == RELATIONS.NONE && relB == RELATIONS.NONE )return;

        //определяем точное расстояние
        var d = Math.distance(a.x, a.y, _c.x, _c.y);
        if(d > d_a)relA = RELATIONS.NONE;
        if(d > d_b)relB = RELATIONS.NONE;
        if(relA == RELATIONS.NONE && relB == RELATIONS.NONE )return;

        var _accA,_accB;
        var _x = 1 - d / d_a ;
        if(d < d_a){

            switch(relA){
                case RELATIONS.SURROUND:
                    _accA =  a._acc_power / 8 * _x; break;
                case RELATIONS.RESCUE:
                    _accA =  a._acc_power * 5  * _x;  break;
                case RELATIONS.ATTACK:
                    _accA =  - a._acc_power / 2  * _x; break;
                }
        }
        if(d < d_b){

            switch(relB){
                case RELATIONS.SURROUND:
                    _accB =  a._acc_power / 8 * _x; break;
                case RELATIONS.RESCUE:
                    _accB =  a._acc_power * 5  * _x;  break;
                case RELATIONS.ATTACK:
                    _accB =  - a._acc_power / 2  * _x; break;
            }
        }

        if(d < 10 ) {
            if(relA == RELATIONS.ATTACK){
                a.attack(b);
            }
            if(relB == RELATIONS.ATTACK){
                b.attack(a);
            }
        }

        if(!a.selected) {
            a.addVelocity(_c.x, _c.y, _accA  );
        }
        if(!b.selected) {
            var _cB = b.getCoordinate(a.x,a.y);
            b.addVelocity(_cB.x, _cB.y, _accB  );
        }
        this.xx ++;

    },
    calcGame: function() {

        this.killingControl();
        this.feedingControl();



        var _a = this.actors,_ai, _aj,i, j;
        // draw each actor
        this.xx = 0;



        for (i = _a.length; _ai = _a[--i];) {
            for (j = i; _aj = _a[--j];) {


                this.calcRelation(_ai,_aj);
            }

            if(_ai.selected) {
                _ai.moveToUserTarget(this.target)
            }
            _ai.calc();
            this.draw(_ai);
        }
       // console.log(this.xx)
    },
    draw: function(_ai) {
//
//        //хвост
//        if(!_ai.actorType.passive){
//            if(_ai.lastpos){
//                _ai.tail.push({x:(_ai.x - _ai.lastpos.x)* s, y:(_ai.y - _ai.lastpos.y)* s});
//                if(_ai.tail.length > 10){
//                    _ai.tail.splice(0,1);
//                }
//            }
//            var x = p.x * s- this.x;
//            var y = p.y * s- this.y;
//            for(var i = _ai.tail.length;i--;){
//                x -=_ai.tail[i].x;
//                y -=_ai.tail[i].y;
//            }
//        }
//        _ai.lastpos =({x:_ai.x , y:_ai.y});
    }
};

module.exports = Game;









