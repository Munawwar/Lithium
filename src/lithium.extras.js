/*
 * Lithium JS version 0.2.0
 * Browser detection.
 */

/**
 * @class Li
 */

/**
 * Extra utility methods
 */
(function (Li) {
    $.extend(Li, {
        /**
         * Move properties from one object to another.
         * Property is only moved if source.hasOwnProperty(property).
         * @param {Object} target Object to which properties are to be moved
         * @param {Object} source Object from which properties are to moved.
         * @param {Array[string]} props Array of properties to move.
         * @returns {Object} target Returns target object
         * @method move
         */
        move: function (target, source, props) {
            props.forEach(function (prop) {
                if (source.hasOwnProperty(prop)) {
                    target[prop] = source[prop];
                    delete source[prop];
                }
            });
            return target;
        },

        /**
         * Delete undefined properties from object
         * @param {Object} obj
         */
        compact: function (obj) {
            Object.keys(obj).forEach(function(key) {
                if (!Li.isDefined(obj[key])) {
                    delete obj[key];
                }
            });
            return obj;
        },

        /**
         * Checks if 'ancestor' is ancestor of 'descendent'.
         * This is still needed because IE10's element.contains is buggy sometimes.
         *
         * @param {HTMLElement} ancestor
         * @param {HTMLElement} descendent
         * @return {Boolean} Returns true if 'ancestor' is indeed the ancestor of 'descendent'.
         * Also returns true if ancestor == descendent.
         * @method contains
         */
        contains: function (ancestor, descendent) {
            while (descendent) {
                if (descendent === ancestor) {
                    return true;
                }
                descendent = descendent.parentNode;
            }
            return false;
        }
    });
}(window.Li));
