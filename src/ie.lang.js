/**
 * IE8 polyfills for Object, Array and String.
 * @module IE Lang
 * @title  Ion IE8 Lang
 */
(function () {
    function apply(target, obj) {
        for (var x in obj) {
            if (obj.hasOwnProperty(x) && !target[x]) {
                target[x] = obj[x];
            }
        }
    }
    /**
     * @class Object
     */

    /**
     * @method keys
     * @static
     */
    apply(Object, {
        keys: function (obj) {
            var x, keys = [];
            for (x in obj) {
                if (obj.hasOwnProperty(x)) {
                    keys.push(x);
                }
            }
            return keys;
        }
    });

    /**
     * Adds a few missing standard JavaScript methods on Array for older browsers.
     * @class Array
     */
    apply(Array.prototype, {
        /**
         * Iterates through array item and calls the given callback for each item.<br/>
         * @param {Function} callback Callback function. Item, index and a reference to the array are passed as parameters (in order) to the callback.
         * @param {Object} [context] Optional The value of the 'this' keyword within the callback.
         * @method forEach
         */
        forEach: function (callback, context) {
            //ECMA implementation does Object(this) to convert string (and potentially others) to array-like objects.
            var array = this, i, len;
            for (i = 0, len = array.length; i < len; i += 1) {
                callback.call(context, array[i], i, array);
            }
        },

        /**
         * Searches an array for a given value.<br/>
         * @param {Any} value The value to find.
         * @param {Number} [from] Index to start search from
         * @return {Number} Returns the index of the found value. If not found returns -1.
         * @method indexOf
         */
        indexOf: function (value, from) {
            var array = this, i, len = array.length;
            if (!from) {
                from = 0;
            }
            if (from >= 0) {
                for (i = from; i < len; i += 1) {
                    if (array[i] === value) {
                        return i;
                    }
                }
            }
            return -1;
        },

        /**
         * Searches an array for the last occurrence of a given value.<br/>
         * @param {Any} value The value to find.
         * @param {Number} [from] Index to start search from
         * @return {Number} Returns the index of the found value. If not found returns -1.
         * @method lastIndexOf
         */
        lastIndexOf: function (value, from) {
            var array = this, i, len = array.length;
            if (typeof from === 'undefined') {
                from = len - 1;
            }
            if (from < len) {
                for (i = from; i >= 0; i -= 1) {
                    if (array[i] === value) {
                        return i;
                    }
                }
            }
            return -1;
        },

        /**
         * Create a new array after applying a transformation on each item of a given array.
         * @param {Function} transform Transform function. Must return the transformed value.<br/>
         * This function gets (value, index, array) as parameters.
         * @param {Object|null} [context=null]
         * @returns {Array} The new array.
         * @method map
         */
        map: function (transform, context) {
            var array = this, newArr = [], i, len;
            for (i = 0, len = array.length; i < len; i++) {
                newArr.push(transform.call(context || null, array[i], i, array));
            }
            return newArr;
        },

        /**
         * Create a new array from all items of an array that satisfies a given condition.
         * @param {Function} condition Function gets (value, index, array) as parameters. It should return a boolean.
         * @param {Object|null} [context=null]
         * @method filter
         */
        filter: function (condition, context) {
            var array = this, newArr = [], i, len;
            for (i = 0, len = array.length; i < len; i++) {
                if (condition.call(context || null, array[i], i, array)) {
                    newArr.push(array[i]);
                }
            }
            return newArr;
        },

        /**
         * @method reduce
         */
        reduce: function (accumulator, initval) {
            var i = 0, len = this.length, curr;
            if (typeof initval === 'number') {
                curr = initval;
            } else {
                curr = this[0];
                i = 1; // start accumulating at the second element
            }
            for (; i < len; i += 1) {
                if (i in this) {
                    curr = accumulator.call(null, curr, this[i], i, this);
                }
            }
            return curr;
        },

        /**
         * @method reduceRight
         */
        reduceRight: function (accumulator, initval) {
            var i = this.length - 1, curr;
            if (typeof initval === 'number') {
                curr = initval;
            } else {
                curr = this[0];
                i -= 1; // start accumulating at the second last element
            }
            for (; i; i -= 1) {
                if (i in this) {
                    curr = accumulator.call(null, curr, this[i], i, this);
                }
            }
            return curr;
        },

        /**
         * @method some
         */
        some: function (condition, context) {
            var array = this, i, len;
            for (i = 0, len = array.length; i < len; i++) {
                if (i in array && condition.call(context || null, array[i], i, array) === true) {
                    return true;
                }
            }
            return false;
        },

        /**
         * @method every
         */
        every: function (condition, context) {
            var array = this, i, len;
            for (i = 0, len = array.length; i < len; i++) {
                if (i in array && !condition.call(context || null, array[i], i, array)) {
                    return false;
                }
            }
            return true;
        }
    });

    /**
     * Adds a few missing standard JavaScript methods on built-in String type for older browsers.
     * @class String
     */
    apply(String.prototype, {
        /**
         * Removes trailing and leading spaces
         * @return {String} "Trimmed" string
         * @method trim
         */
        trim: function () {
            return this.match(/^\s*(.*?)\s*$/)[1];
        }
    });
}());
