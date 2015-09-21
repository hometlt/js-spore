
var RELATIONS = require('./relations.js');
var _ = require('lodash-compat');


var TYPES ={
    DEFAULT:{
        name: "DEFAULT",
        data:{
            minimun_size : 12,
            defecate_chance : 0.001,
            max_shit : 3,
            size : 25,
            max_size : 100,
            color: "#FFFFFF",
            eye_distance : 200,
            max_speed: 1,
            cb: true,
            lifetime:  100
        },
        relations: {
            KILLER:     {type: RELATIONS.NONE, distance: 0},
            DRAGON:     {type: RELATIONS.NONE, distance: 0},
            MOB:        {type: RELATIONS.NONE, distance: 0},
            FOOD:       {type: RELATIONS.NONE, distance: 0},
            SHIT:       {type: RELATIONS.NONE, distance: 0},
            CORPSE:     {type: RELATIONS.NONE, distance: 0},
            SCAVENGER:  {type: RELATIONS.NONE, distance: 0}
        }
    },
    KILLER: {
        name: "KILLER",
        data:{
            minimun_size : [10,20],
            defecate_chance : 0.0025,
            max_shit : [2,3],
            size : 30,
            max_size : [75,125],
            color: "#AAAA00",
            eye_distance :[100,200],
            max_speed: [0.7, 1.2] ,
            cb: true
        },
        relations: {
            KILLER:     {type: RELATIONS.SURROUND, distance: 50},
            DRAGON:     {type: RELATIONS.RESCUE  , distance: 300},
            MOB:        {type: RELATIONS.ATTACK  , distance: 200}
        }
    },
    DRAGON: {
        name: "DRAGON",
        data:{
            minimun_size : 40,
            defecate_chance : 0.01,
            max_shit : 3,
            size : 50,
            max_size : 1000,
            color: "#FFFFFF",
            eye_distance : 250,
            max_speed: 2
        },
        relations: {
            KILLER:     {type: RELATIONS.ATTACK,    distance: 100},
            DRAGON:     {type: RELATIONS.SURROUND,  distance: 100},
            MOB:        {type: RELATIONS.ATTACK,    distance: 100},
            SCAVENGER:  {type: RELATIONS.ATTACK,    distance: 100}
        }
    },
    MOB: {
        name: "MOB",
        data: {
            minimun_size : [1,2],
            defecate_chance : 0.00025,
            max_shit : [0.25,1],
            size : 4,
            max_size : [6,12],
            color: "#CC0099",
            eye_distance :[100,200],
            max_speed: [0.5, 1] ,
            lifetime: [10,100]
        },
        relations: {
            KILLER:     {type: RELATIONS.RESCUE, distance: 200},
            DRAGON:     {type: RELATIONS.RESCUE, distance: 300},
            MOB:        {type: RELATIONS.SURROUND, distance: 50},
            FOOD:       {type: RELATIONS.ATTACK, distance: 150}
        }
    },
    FOOD: {
        name: "FOOD",
        data:{
            size: 1,
            color: "#00BBBB",
            cb: true
        },
        passive: true
    },
    SHIT: {
        name: "SHIT",
        data:{
            size: 1,
            lifetime : 100,
            color: "#AAAAAA",
            cb: true
        },
        passive: true
    },
    CORPSE:  {
        name: "CORPSE",
        data:{
            size: 1,
            color: "#BB2222",
            cb: true
        },
        passive: true
    },
    SCAVENGER: {
        name: "SCAVENGER",
        data:{
            max_speed: 0.5 + Math.random() * 0.5,
            color: "#BB2222",
            eye_distance : 50+ Math.random() * 50,
            size : 15,
            max_shit : 3,
            minimun_size : 5,
            max_size : 100,
            defecate_chance : 0.00025,
            cb: true
        },
        relations: {
            DRAGON:     {type: RELATIONS.RESCUE, distance: 300},
            CORPSE:     {type: RELATIONS.ATTACK, distance: 200},
            SCAVENGER:  {type: RELATIONS.SURROUND, distance: 50}
        }
    }
};


for(var i in TYPES){
    if(i == "DEFAULT") continue;
    if(TYPES[i].relations){
        _.defaults (TYPES[i].relations,TYPES.DEFAULT.relations);
    }else{
        TYPES[i].relations = TYPES.DEFAULT.relations;
    }
    _.defaults (TYPES[i].data,TYPES.DEFAULT.data);
}

module.exports = TYPES;