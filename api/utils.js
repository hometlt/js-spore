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
    return dst;
}




var utils = {
    mixin: mixin,
    extend: extend
}
module.exports = utils;