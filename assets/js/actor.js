


// ACTOR Object

function Actor(data) {

    data = data || {};

    this.x = data.x || (Math.random() * this.game.width);
    this.y =  data.y || (Math.random() * this.game.height);


    this.actorType = data.actorType;

    for(var i in TYPES.DEFAULT.data){
        if(data[i] != undefined){

            //новый может отличать на 10% от родителя
            if(this.actorType.data[i] != undefined && this.actorType.data[i].constructor === Array){
                var diff = this.actorType.data[i][1] - this.actorType.data[i][0];
                this[i] = data[i] + Math.random() * diff * 0.1;
            }else{

                this[i] = data[i];
            }

        } else if(this.actorType.data[i] != undefined){
            if(this.actorType.data[i].constructor === Array){
                this[i] = Math.getRandomArbitrary(this.actorType.data[i][0],this.actorType.data[i][1]);
            }else{
                this[i] = this.actorType.data[i]
            }
        }else{
            this[i] = TYPES.DEFAULT.data[i];
        }
    }
    this._acc_power = 0.7;



    this.a =  Math.random();
    this.setSize(this.size);
    this.speed = this.max_speed;
    this.ab = Math.random() > 0.5;
    this.af = 0.05;
    this.c = 0;
    this.vx = Math.random() - 0.5; // velocity x
    this.vy = Math.random() - 0.5; // velocity y

    this.tail = [];
}


Actor.prototype = {
    setSize: function(size){
        this.size = size;
        this.radius = Math.sqrt(this.size/ Math.PI);
    },
    game: null,
    getCoordinate: function(x,y){

            var width = this.game.width;
            var height = this.game.height;
            if(x < this.x && this.x - x > width / 2){
                x +=width;
            }else if(x > this.x && x - this.x > width / 2){
                x -=width;
            }
            if(y < this.y && this.y - y > height / 2){
                y +=height;
            }else if(y > this.y && y - this.y > height / 2){
                y -=height;
            }
            return {x: x, y: y}
    },
    //добавляем ускорение
    addVelocity: function(x,y,power){

        var controlled = this.selected && this.game.target;

        var _x_power,_y_power;
        if(controlled) {
            var x_diff = Math.abs(this.x - x), y_diff = Math.abs(this.y - y);

            var _c;
            if (x_diff > y_diff) {
                _c = y_diff / x_diff;
                _x_power = power * (1 - _c);
                _y_power = power  * _c;
            } else {
                _c = x_diff / y_diff;
                _x_power = power * _c;
                _y_power = power * (1 - _c);
            }
        }else{
            _x_power = power *Math.random() *0.7;
            _y_power = power* Math.random() *0.7;
        }


        this.vx += x < this.x? _x_power : -_x_power;
        this.vy += y < this.y? _y_power : -_y_power;
    },
    calcColor: function(){

        // alpha
        if (this.ab) {
            this.a = this.a + this.af;
            if (this.a > 1) {
                this.a = 1;
                this.ab = false;
            }
        } else {
            this.a = this.a - this.af;
            if (this.a < 0) {
                this.a = 0;
                this.ab = true;
            }
        }
    },
    //поправляем координаты (если входит за пределы поля
    fixCoordinate: function(){

        var width = this.game.width;
        var height = this.game.height;

        // screen wrapping
        if(this.game.gamemode == GAMEMODES.CONTINOUS) {
            if (this.x < 0) {
                this.x = this.x + width ;
            }else if (this.x > width) {
                this.x = this.x - width;
            }
            if (this.y < 0) {
                this.y = this.y + height ;
            }
            if (this.y > height) {
                this.y = this.y - height ;
            }
        }
        else{
            if (this.x < 0) {
                this.vx *= -1;
                this.x = 0;
//                this.cb = !this.cb;
            }
            if (this.x > width) {
                this.vx *= -1;
                this.x = width;
//                this.cb = !this.cb;
            }
            if (this.y < 0) {
                this.vy *= -1;
                this.y = 0;
//                this.cb = !this.cb;
            }
            if (this.y > height) {
                this.vy *= -1;
                this.y = height;
//                this.cb = !this.cb;
            }
        }
    },
    attack: function(a){
        var hungry = a.size;
        if(a.actorType == TYPES.MOB && Math.random() > 0.6){
            hungry = a.size  * Math.random();
            a.actorType = TYPES.CORPSE;
        }else{
            a.killed = true;
        }

        a.setSize(a.size - hungry );
        this.setSize(this.size + hungry );
        this.fed = true;
    },
    getRelation: function (a){

        var relation = {
            type: RELATIONS.NONE,
            distance: 0,
            acceleration : 0,
            danger_distance: 0
        };

        relation.type   = (this.actorType.relations[a.actorType.name] && this.actorType.relations[a.actorType.name].type )|| RELATIONS.NONE;
        relation.danger_distance = (this.actorType.relations[a.actorType.name] && this.actorType.relations[a.actorType.name].distance) || 0;

        if(relation.type != RELATIONS.NONE ) {


            var _c = relation.coordinate = this.getCoordinate(a.x,a.y);

            if(Math.abs(this.x - _c.x) > relation.danger_distance ||
                Math.abs(this.y - _c.y) > relation.danger_distance){
                relation.type = RELATIONS.NONE;
                return relation;
            }


            relation.distance = Math.distance(this.x, this.y, _c.x, _c.y);

            if(relation.distance < relation.danger_distance){
                var _x = 1 - relation.distance / relation.danger_distance ;

                switch(relation.type){
                    case RELATIONS.SURROUND:
                        relation.acceleration =  this._acc_power / 8 * _x;
                        break;
                    case RELATIONS.RESCUE:
                        relation.acceleration =  this._acc_power * 5  * _x;
                        break;
                    case RELATIONS.ATTACK:
                        relation.acceleration =  - this._acc_power / 2  * _x;
                        break;
                }
            }else{
                relation.type = RELATIONS.NONE;
            }
        }

        return relation;
    },
    move: function(){

        //выравниванием значение ускорения, чтобы моб не превысил своей скорости
        var som = Math.sqrt((this.vx * this.vx) + (this.vy * this.vy));
        this.c = Math.abs(som) * 50;
        this.vx /= som;
        this.vy /= som;
        this.x += this.vx * this.speed * 2.8;
        this.y += this.vy * this.speed * 2.8;
    },


    defecating: function(){

        if( Math.random() > this.defecate_chance)return;


        var size = Math.random() * this.max_shit;
        //оставил съедобный след
        this.setSize(this.size - size);
        this.game.actors.push(new Actor({actorType: TYPES.SHIT,size:size , x:this.x,y: this.y }));


        if(this.size < this.minimun_size){
            //потерял слишком много, просто расщепляется на куски

//
//            this.killed = true;
//            while(this.size > 0){
//                var size = Math.random() * this.max_shit;
//                if(size > this.size)size = this.size;
//                this.size -= size;
//                this.game.actors.push(new Actor({actorType: TYPES.SHIT,size: size , x:this.x + Math.random() * 5,y: this.y + Math.random() * 5 }));
//            }

            this.actorType = TYPES.CORPSE;
        }

    },
    doLifetime: function(){

        // lifetime
        if (this.lifetime < 0) {

            this.lifetime = 30;
            this.c = Math.random(255);
            this.a = Math.random(0.02);
            this.af = Math.random(0.01);
            this._acc_power = Math.random(this._acc_power);
            // this.speed = Math.random(this.speed);
            this.speed = Math.getRandomArbitrary(0.25, this.max_speed);
//            this.cb = !this.cb;

            if(this.actorType == TYPES.SHIT ){
                this.actorType = TYPES.FOOD;
            }
        }

        this.lifetime -= 1;
    },
    /**
     * рассчет движения моба. под управлением игрока , или под влиянием других мобов
     */
    calcMove: function(){


        var controlled = this.selected && this.game.target;
        //little random movement
        //if(!controlled) {
            this.vx += (Math.random() - 0.5) * this._acc_power;
            this.vy += (Math.random() - 0.5) * this._acc_power;
      //  }

        var _a = this.game.actors;

        if(controlled) {
            var p = this.getCoordinate(this.game.target.x,this.game.target.y);
            this.addVelocity(p.x,p.y,- this._acc_power / 2)
        }

        for (var i = 0; i < _a.length; i++) {
            if(_a[i] == this)continue;

            var relation = this.getRelation( _a[i]);


            if(relation.type == RELATIONS.ATTACK && relation.distance < 10 ){
                this.attack(_a[i]);
            }

            if(!controlled &&relation.type != RELATIONS.NONE) {
                var _x = (relation.distance / relation.danger_distance);
                this.addVelocity(relation.coordinate.x, relation.coordinate.y, relation.acceleration );
            }
        }
    },
    calc: function() {

        this.doLifetime();

        if(this.actorType.passive)return;

        this.calcMove();

        this.move();

        this.defecating();

        this.fixCoordinate();

        this.calcColor();


    }

};