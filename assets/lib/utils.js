/**
 * Версия файла 10.11.2014
 */

// Returns a random number between min (inclusive) and max (exclusive)
Math.getRandomArbitrary = function(min, max) {
    return Math.random() * (max - min) + min;
}


/**
 * Реализует наследование
 * @param Child
 * @param Parent
 */
function extend(Child, Parent) {
    var F = function() {};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
    return Child;
}

/**
 * копирует все свойства из src в dst, включая те, что в цепочке прототипов src до Object
 * @param dst
 * @param src
 * mixin(GraphBlock.prototype, {distance: 0,} );
 */
function mixin(dst, src) {
    // tobj - вспомогательный объект для фильтрации свойств,
    // которые есть у объекта Object и его прототипа
    var tobj = {};
    for (var x in src) {
        // копируем в dst свойства src, кроме тех, которые унаследованы от Object
        if ((typeof tobj[x] == "undefined") || (tobj[x] != src[x])) {
            dst[x] = src[x];
        }
    }
    // В IE пользовательский метод toString отсутствует в for..in
    if (document.all && !document.isOpera) {
        var p = src.toString;
        if (typeof p == "function" && p != dst.toString && p != tobj.toString && p != "\nfunction toString() {\n    [native code]\n}\n") {
            dst.toString = src.toString;
        }
    }
    return dst;
}

/* Returns the class name of the argument or undefined if
 it's not a valid JavaScript object.
 */
function getObjectClass(obj) {
    if (obj && obj.constructor && obj.constructor.toString) {
        var arr = obj.constructor.toString().match(/function\s*(\w+)/);

        if (arr && arr.length == 2) {
            return arr[1];
        }
    }

    return undefined;
}


// Avoid `console` errors in browsers that lack a console.
if (!(window.console && console.log)) {
    (function() {
        var noop = function() {};
        var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
        var length = methods.length;
        var console = window.console = {};
        while (length--) {
            console[methods[length]] = noop;
        }
    }());
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
    Object.keys = (function() {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({
                toString: null
            }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function(obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [],
                prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}

if (!Array.prototype.indexOf)
{
    Array.prototype.indexOf = function(elt /*, from*/)
    {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
            ? Math.ceil(from)
            : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++)
        {
            if (from in this &&
                this[from] === elt)
                return from;
        }
        return -1;
    };
}

if (!String.prototype.trim) {
    (function(){
        // Make sure we trim BOM and NBSP
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function () {
            return this.replace(rtrim, "");
        }
    })();
}



var scriptURL = function() {
    var scripts = document.getElementsByTagName("script")
    var currentScriptPath = scripts[scripts.length - 1].src;
    return currentScriptPath.substring(0, currentScriptPath.lastIndexOf('/') + 1);
};


// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}


/**
 * Таймер
 * @param options
 * @constructor
 */
function Timer(options) {
    this.duration = options && options.duration * 1000 || 0;
    this.finish = options && options.finish; //|| function(){console.log("Таймер: время истекло");}
    this.change = options && options.change; //|| function(){console.log("Таймер: " + this.scopeTime);}
    this.passed = options && options.passed || 0; //|| function(){console.log("Таймер: " + this.scopeTime);}
    this.time = 0;
    if(options && options.start)this.start();
}
Timer.prototype.getTime = function() {
    var currentdate = new Date().getTime();
    var remain = currentdate - this.timerStart + this.passed;
    return  parseInt(this.duration ? this.duration - remain : remain);
};
Timer.prototype.start = function() {
    var self = this;
    this.timerStart = new Date().getTime();
    this.reset();
    this.interval = setInterval(function() {

        self.time =self.getTime();
        if (self.change) self.change.call(self /*,parseInt(self.time/1000),self.duration*/ );

        if (self.time <= 0) {
            self.time = 0;
            clearInterval(self.interval);
            if (self.finish) self.finish.call(self);
        }

    }, 1000);
};
Timer.prototype.reset = function() {
    this.time = this.duration || 0;

    if (this.change) this.change.call(this);
};
Timer.prototype.stop = function() {
    var timer = this.interval;
    this.interval = false;
    setTimeout(function() {
        clearInterval(timer);
    }, 500);
};



var TriggeredObject = {

    /**
     * Подписка на событие
     * @param  {[type]} eventName Имя события
     * @param  {[type]} handler   Обработчик
     * @return {[type]}           [description]
     */
    on: function(eventName, handler, caller) {
        if (handler == "") {
            console.error("Обработчик события строка");
        }
        if (!this._eventHandlers) {
            this._eventHandlers = [];
        }
        if (!this._eventHandlers[eventName]) {
            this._eventHandlers[eventName] = [];
        }
        this._eventHandlers[eventName].push({
            handler: handler,
            caller: caller
        });
    },

    /**
     * Прекращение подписки
     * @param  {[type]} eventName [description]
     * @param  {[type]} handler   [description]
     * @return {[type]}           [description]
     */
    off: function(eventName, handler) {
        var handlers = this._eventHandlers[eventName];
        if (!handlers) return;
        for (var i = 0; i < handlers.length; i++) {
            if (handlers[i].handler == handler) {
                handlers.splice(i--, 1);
            }
        }
    },

    /**
     * Запуск события
     * @param  {[type]} eventName [description]
     * @return {[type]}           [description]
     */
    trigger: function(eventName) {
        if (!this._eventHandlers || !this._eventHandlers[eventName]) {
            return;
        }

        var handlers = this._eventHandlers[eventName];
        for (var i = 0; i < handlers.length; i++) {
            handlers[i].handler.apply(handlers[i].caller || this, [].slice.call(arguments, 1));
        }
    }
};


Math.distance = function(x1,y1,x2,y2){

    return Math.pow(Math.pow(x1-  x2,2) + Math.pow(y1 - y2,2),0.5);
}

Math.generateUUID = function() {
    function _p8(s) {
        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
};

Math.generateEmptyUUID = function() {
    return '00000000-0000-0000-0000-000000000000';
};

Math.gaussRand = function() {
    var s = 2*Math.random()-1;
    var m = 2*Math.random()-1;
    var u = s*s + m*m;
    if(u == 0 || u > 1) return Math.gaussRand();
    var k = Math.sqrt(-2*Math.log(u)/u);
    return s*m;
};

