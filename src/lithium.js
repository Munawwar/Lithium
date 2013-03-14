/**
 * @author Munawwar Firoz
 * @version 1.0.0
 * MIT License
 * Lithium for jQuery. Aimed at making software development easier.
 */

/**
 * Contains core utility functions and classes.
 * @module core
 */

/*global HTMLElement*/
(function ($) {
    /**
     * Contains useful and most frequently used functions.
     * @class ion
     * @static
     */

    var Li = {
        /**
         * Checks whether a variable is defined.
         * @param {Any} val
         * @method isDefined
         */
        isDefined: function (val) {
            return typeof val !== 'undefined'; //Remove this when dropping IE8 support
        },

        /**
         * Checks whether a given value is a DOM Element (Text nodes aren't included, nodeType should = 1)
         * @param {Object} obj
         * @method isElement
         */
        isElement: function (obj) {
            try {
                return (obj instanceof HTMLElement);
            } catch (e) { //IE8
                return (typeof obj === 'object' && obj.nodeType === 1);
            }
        },

        /**
         * Returns true only when value is NaN.
         * @param {Any} val
         * @method isNaN
         */
        isNaN: function (val) {
             //isNaN(undefined) is true
             //isNaN({}) is true
             //isNaN('3') is false
             //isNaN('t') is true
            return (typeof val === 'number' && isNaN(val));
        },

        /**
         * The arguments sent to this new function, followed by the optional arguments which were sent to 'bind', will be forwarded to func.<br/>
         * Similar to JS 1.8.5 bind, but with append as extra parameter.
         * @param {Function} func Function to call
         * @param {Object} context Set the value of the 'this' keyword to be within the function.
         * @param {Boolean} [append=false] If true, appends binded arguments to any call to the new (returned) function. If false, prepend arguments.
         * @param {Any} [...] Optional. Any number of arguments, which will be forwarded to func on call.
         * @return {Function} A new function which will have binded context and arguments.<br/>
         * @method bind
         */
        bind: function (func, context, append) {
            var outerArgs = Li.slice(arguments, 3);
            append = Li.isDefined(append) ? append : false;
            return function () {
                var args = Li.slice(arguments);
                args = append ? args.concat(outerArgs) : outerArgs.concat(args);
                return func.apply(context || this, args);
            };
        },

        /**
         * Classical inheritence, where only prototype is inherited.
         * @param {Function} baseC The constructor to be inherited from (the parent)
         * @param {Object} derived The object which has a constructor and methods/properties. This will be the derived class.
         * @param {Function} derived.constructor Should be a function constructor of derived class.
         * @param {Object} derived.statics An object whose properties will be added to the derived constructor as static properties/methods.
         * @return {Function} Returns the derived constructor (the same derived.constructor).
         * @method extend
         */
        //TODO: Use Object.create after dropping support for IE8.
        extend: (function () {
            var P = function () {}; //proxy
            return function (baseC, derived) {
                derived = derived || {};
                //constructor property always exists, hence the hasOwnProperty check.
                var derivedC = derived.hasOwnProperty('constructor') ? derived.constructor : function () {
                        derivedC.superclass.apply(this, arguments);
                    }, //'C' suffix is for 'Constructor'
                    statics = derived.statics;

                P.prototype = baseC.prototype;
                derivedC.prototype = new P();
                derivedC.superclass = derivedC.prototype.superclass = baseC;

                //Add/Override prototype of base constructor
                $.extend(derivedC.prototype, derived);

                //Add static properties to constructor
                if (statics) {
                    delete derived.statics;
                    $.extend(derivedC, statics);
                }

                return derivedC;
            };
        }()),

        /**
         * Iterate through an array or object.<br/>
         * Iterates through an object's properties and calls the given callback for each (enumerable) property.
         *
         * Note: For arrays, this method calls Array.forEach, so for IE8 you must include copper.ie.lang module.
         * @param {Object} obj The array/object to iterate through.
         * @param {Function} callback Callback function. Value, index/key and a reference to the array/object are sent as parameters (in order) to the callback.
         * @param {Object} [context] Optional The value of the 'this' keyword within the callback.
         * @method forEach
         */
        forEach: function (obj, callback, context) {
            if ($.isArray(obj)) {
                obj.forEach(obj, callback, context);
            } else {
                for (var x in obj) {
                    if (obj.hasOwnProperty(x)) {
                        callback.call(context, obj[x], x, obj);
                    }
                }
            }
        },

        /**
         * Adds properties (and methods) to a function's prototype.
         * @method augment
         */
        augment: function (classRef, properties, conflicts) {
            $.extend(classRef.prototype, properties, conflicts);
        },

        /**
         * @param {String} path
         * @method namespace
         */
        namespace: function (path) {
            var part = (function () {return this; }()), temp;
            path = path.split('.');
            while ((temp = path.shift())) {
                part[temp] = part[temp] || {};
                part = part[temp];
            }
        },

        /**
         * Experimental: Overrides the method with the given one. The the older function will be sent as the first argument to the given function.
         * @param {Object} instance
         * @param {String} methodName
         * @para {Function} func The function to override.
         */
        decorator: function (instance, methodName, func) {
            var old = instance[methodName] || $.noop;
            return (instance[methodName] = Li.lbind(func, instance, old));
        },

        /**
         * Same as Array.slice except that it can work on array-like data types (i.e arguments, element.childNodes, NodeList...)
         * @method slice
         */
        slice: function (array, from, end) {
            var len = array.length, i, arr;
            from = from || 0;
            end = end || len;
            try {
                return Array.prototype.slice.call(array, from, end);
            } catch (e) {
                //Array.slice don't work on NodeList on IE8.
                if (from < 0) {
                    from += len;
                }
                if (end < 0) {
                    end += len;
                }
                for (i = from, len = array.length, arr = []; i < end && i < len; i += 1) {
                    arr.push(array[i]);
                }
                return arr;
            }
        },

        /**
         * Generates an unique alpha-numeric identifier.<br/>
         * To get the same permutation as RFC-4122 use len=24.
         * @param [len=10] Length of the UUID.
         * @param [hypenate=false] When set to true, hyphens are added to the UUID.
         * @return {String} The UUID
         * @method uuid
         */
        uuid: function (len, hypenate) {
            var count = 1, id = (new Array((len || 10) + 1).join('x')).replace(/x/g, function () {
                return ((count++ % 5) ? '' : '-') + (Math.random() * 100 % 36 | 0).toString(36);
            }).toUpperCase();
            return hypenate ? id : id.replace(/-/g, '');
        }
    };

    /**
     * 'Left' bind<br/>
     * Same as bind, except that arguments are always prepended.
     * @param {Function} func Function to bind
     * @param {Object|null} [context] The context in which func is to be called. null would default to the global object.
     * @param {Any} [...] Any number of arguments to be binded to func.
     * @method lbind
     */
    Li.lbind = function (func, context) {
        return Li.bind.apply(null, ([func, context, false]).concat(Li.slice(arguments, 2)));
    };
    /**
     * 'Right' bind<br/>
     * Same as bind, except that arguments are always appended.
     * @param {Function} func Function to bind
     * @param {Object|null} [context] The context in which func is to be called. null would default to the global object.
     * @param {Any} [...] Any number of arguments to be binded to func.
     * @method rbind
     */
    Li.rbind = function (func, context) {
        return Li.bind.apply(null, ([func, context, true]).concat(Li.slice(arguments, 2)));
    };

    /**
     * JavaScript Object related functions
     * @class jQuery.object
     * @static
     */
    Li.object = {
        /**
         * Get a list of all enumerable values of the object. Doesn't include prototype's properties.
         * @param {Object} obj An object.
         * @return {Array} Array of values.
         * @method values
         */
        values: function (obj) {
            var values = [];
            Li.forEach(obj, function (value) {
                values.push(value);
            });
            return values;
        },

        /**
         * Returns the number of properties in an object
         * @param {Object} obj
         * @method size
         */
        size: function (obj) {
            var count = 0;
            Li.forEach(obj, function () {
                count += 1;
            });
            return count;
        }
    };

    /*TODO: Date formatting and convertion methods missing*/

    /**
     * String related functions
     * @class jQuery.string
     * @static
     */
    Li.string = {
        /**
         * Encodes &,<,> and ".
         * @method htmlEncode
         * @param {String} html
         * @returns {String} HTML encoded String.
         */
        htmlEncode: function (html) {
            return html.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
        },

        /**
         * Decodes string encoded by htmlEncode
         * @method htmlDecode
         * @param {String} html
         * @returns {String} HTML decoded String.
         */
        htmlDecode: function (html) {
            return html.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
        }
    };

    window.Li = Li;
}(jQuery));
