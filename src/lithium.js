/**
 * @author Munawwar Firoz
 * @version 0.4.0
 * MIT License
 * Lithium for jQuery. Aimed at making software development easier.
 */

/**
 * Contains core utility functions and classes.
 * @module core
 */

/*global jQuery, HTMLElement*/
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') { //For NodeJS
        module.exports = factory(require('jquery'));
    } else { //global
        root.Li = factory(jQuery);
    }
}(this, function ($) {
    /**
     * Contains useful and most frequently used functions.
     * @class Li
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
         * Returns true for all values that are of type 'boolean'<br/>
         * Note that booleans declared with 'new' keyword are objects and aren't considered "boolean"s.
         * @param {Any} val
         * @method isBoolean
         */
        isBoolean: function (val) {
            return (typeof val === 'boolean');
        },

        /**
         * Any value that is an object (excluding null).<br/>
         * Note that arrays, functions and all data declared with 'new' keyword is an object.
         * @param {Any} val
         * @method isObject
         */
        isObject: function (val) {
            return val !== null && (typeof val === 'object' || $.isFunction(val));
        },

        /**
         * Checks whether a given value is a string.<br/>
         * Note that strings declared with 'new' keyword are objects and aren't considered "string"s.
         * @param {Any} val
         * @method isString
         */
        isString: function (val) {
            return (typeof val === 'string');
        },

        /**
         * Returns true for any number (including Infinity).
         * Note that numbers declared with 'new' keyword are objects and aren't considered "number"s.
         * @param {Any} val
         * @method isNumber
         */
        isNumber: function (val) {
            return (typeof val === 'number' && !isNaN(val));
        },

        /**
         * Returns true for any finite number.
         * Note that numbers declared with 'new' keyword are objects and aren't considered "number"s.
         * @param {Any} val
         * @method isFinite
         */
        isFinite: function (val) {
            return (typeof val === 'number' && isFinite(val));
        },

        /*For completeness*/
        /**
         * Same as jQuery.isArray
         * @method isArray
         */
        isArray: $.isArray,
        /**
         * Same as jQuery.isFunction
         * @method isFunction
         */
        isFunction: $.isFunction,

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
         * 'Left' bind<br/>
         * Same as bind, except that arguments are always prepended.
         * @param {Function} func Function to bind
         * @param {Object|null} [context] The context in which func is to be called. null would default to the global object.
         * @param {Any} [...] Any number of arguments to be binded to func.
         * @method lbind
         */
        lbind: function (func, context) {
            return Li.bind.apply(null, ([func, context, false]).concat(Li.slice(arguments, 2)));
        },

        /**
         * 'Right' bind<br/>
         * Same as bind, except that arguments are always appended.
         * @param {Function} func Function to bind
         * @param {Object|null} [context] The context in which func is to be called. null would default to the global object.
         * @param {Any} [...] Any number of arguments to be binded to func.
         * @method rbind
         */
        rbind: function (func, context) {
            return Li.bind.apply(null, ([func, context, true]).concat(Li.slice(arguments, 2)));
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
            function superFunc(args) {
                var fn = superFunc.caller;
                return fn._baseclass_[fn._methodName_].apply(this, args);
            }
            function superClassFunc() {
                var fn = superClassFunc.caller;
                return fn._baseclass_;
            }
            var P = function () {}; //proxy
            return function (baseC, derived) {
                derived = derived || {};
                //constructor property always exists, hence the hasOwnProperty check.
                var derivedC = derived.hasOwnProperty('constructor') ? derived.constructor : function () {
                        baseC.apply(this, arguments);
                    }, //'C' suffix is for 'Constructor'
                    statics = derived.statics;

                P.prototype = baseC.prototype;
                derivedC.prototype = new P();
                derivedC.super = baseC.prototype;
                derivedC.prototype.super = superFunc;
                derivedC.prototype.superclass = superClassFunc;

                Li.forEach(derived, function (val, prop) {
                    if ($.isFunction(val)) {
                        val._methodName_ = prop;
                        val._baseclass_ = baseC.prototype;
                    }
                    derivedC.prototype[prop] = val;
                });

                //Add static properties to constructor
                if (statics) {
                    delete derived.statics;
                    $.extend(derivedC, statics);
                }

                if (Li.Observable && derivedC.prototype instanceof Li.Observable) {
                    Li.inheritEvents(derivedC);
                }

                return derivedC;
            };
        }()),

        /**
         * Iterate through an array or object.<br/>
         * Iterates through an object's properties and calls the given callback for each (enumerable) property.
         *
         * Note: For arrays, this method calls Array.forEach, so for IE8 you must include lithium.ie.lang module.
         * @param {Object} obj The array/object to iterate through.
         * @param {Function} callback Callback function. Value, index/key and a reference to the array/object are sent as parameters (in order) to the callback.
         * @param {Object} [context] Optional The value of the 'this' keyword within the callback.
         * @return {object} obj
         * @method forEach
         */
        forEach: function (obj, callback, context) {
            if ($.isArray(obj)) {
                obj.forEach(callback, context);
            } else {
                for (var x in obj) {
                    if (obj.hasOwnProperty(x)) {
                        callback.call(context, obj[x], x, obj);
                    }
                }
            }
            return obj;
        },

        /**
         * Adds properties (and methods) to a function's prototype.
         * Note: You won't be warned if you overwrite an existing method/property.
         * @method augment
         */
        augment: function (classRef, properties) {
            Li.forEach(properties, function (val, prop) {
                if ($.isFunction(val)) {
                    val._methodName_ = prop;
                    val._baseclass_ = classRef.super;
                }
                classRef.prototype[prop] = val;
            });

            //Add static properties to constructor
            var statics = properties.statics;
            if (statics) {
                delete properties.statics;
                $.extend(classRef, statics);
            }
        },

        /**
         * @param {String} path
         * @method namespace
         * @example Li.namespace('mynamespace.ui.widgets');
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
         * String formatting
         * @param {String} str String with placeholders
         * @param {Object|...} arg If object then you can use {propertyName} as placeholder.
         * Else you can supply n number of args and use {argument index} as placholder
         * @method format
         * @example
         *
         *     Li.format('<div class="{0}">', 'box');
         *     Li.format('<div class="{cls}">', {cls: 'box'});
         *     //output of both: <div class="box">
         *
         */
        format: function (str, arg) {
            if (!Li.isObject(arg)) {
                arg = Li.slice(arguments, 1);
            }
            return str.replace(/(^|[^\\])\{(\w+)\}/g, function (m, p, index) {
                var x = arg[index];
                return (p || '') + (x !== undefined ? x : '');
            });
        },

        /**
         * Converts html string to a document fragment.<br/>
         * The html string and arguments are first sent to Li.format to get the
         * final html string.
         * @param {String} html
         * @param {...} Any number of arguments that will be passed on to Li.format. Check Li.format documentation for more information.
         * @returns {DocumentFragment}
         * @method dom
         */
        dom: function (html) {
            var frag = document.createDocumentFragment();
            $.parseHTML(Li.format.apply(this, arguments)).forEach(function (node) {
                frag.appendChild(node);
            });
            return frag;
        },

        /**
         * Same as Array.slice except that it can work on array-like data types (i.e arguments, element.childNodes, NodeList...)
         * @param {Array-like} array Array like values.
         * @method slice
         * @example var elements = Li.slice(document.body.childNodes, 3); //get first 3 nodes.
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
     * String related functions
     * @class Li.string
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

    return Li;
}));
