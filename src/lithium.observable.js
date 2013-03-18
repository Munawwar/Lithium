/**
 * Publisher-Subscriber pattern utility class
 * @module observable
 * @requires core
 * @title CopperJS Observable
 */

(function (Li) {
    /**
     * Makes a constructor or object an event 'publisher'. Hence all instances created from this constructor ('class' in C++ terms),
     * will follow the Observer (also known as publisher-subscriber) design pattern.<br/>
     *
     * @class jQuery.observable
     * @static
     */
    var methods = {
        /**
         * Call all events listeners for the given event name.<br/>
         * @param {String} eventType
         * @param {Any} ... n number of arguments. These shall be directly passed onto the event listeners.
         * @method fireEvent
         */
        fireEvent: function (eventType) {
            eventType = eventType.toLowerCase();
            this._eventMap = this._eventMap || {};
            //TODO: Think of a way to enable debugging on development mode
            //if ((!this._eventTypes || !this._eventTypes[eventType])) {
                //console.warn(eventType + "? This event type has not been registered.");
            //}
            if (!this._suspendEvents && this._eventMap[eventType]) {
                var i, len,
                    events = this._eventMap[eventType];
                for (i = 0, len = events.length; i < len; i += 1) {
                    events[i].fn.apply(events[i].scope, Li.slice(arguments, 1));
                }
            }
        },

        /**
         * Adds a listener.
         * @param {Object} object The object which you want to listen to.
         * This object's constructor (or any ancestor) must have been initialized with {{#crossLink "Li.observable"}}{{/crossLink}}.<br/>
         * You can also subscribe for an event that has not yet been registered as an event. Hence the order of registeration is not a concern.
         * @method on
         * @alias addListener
         * @return A UUID which can be used to remove the event when required.
         */
        on: (function () {
            var uuidGen = 1;
            //TODO: Also set config like onetime = true etc
            return function (eventType, handler, scope) {
                this._eventMap = this._eventMap || {};
                var events = this._eventMap,
                    id = 'ls' + (uuidGen++);
                events[eventType] = events[eventType] || [];
                events[eventType].push({
                    uuid: id,
                    fn: handler,
                    scope: scope
                });
                return id;
            };
        }()),

        /**
         * Disables firing of events. Calls to fireEvent method will return silently without doing anything (until you call resumeEvents method).
         * @method suspendEvents
         */
        suspendEvents: function () {
            this._suspendEvents = true;
        },

        /**
         * Resumes event firing (that you disabled through the suspendEvents method).
         * @method resumeEvents
         */
        resumeEvents: function () {
            this._suspendEvents = false;
        },

        /**
         * This function listens to a given publisher on the given event types,
         * and refires the events from itself (scope of the event fired would be this object).
         * This useful for chaining events.
         * @param {observable} observable An observable object.
         * @param {Array|null} eventTypes Event types to listen on. If eventType is null, it listens to all events of the publisher.
         * @method relayEvents
         */
        relayEvents: (function () {
            var relayThis = function (eventType) {
                var args = Li.slice(arguments, 1);
                this.fireEvent.apply(this, ([eventType]).join(args));
            };
            return function (observable, eventTypes) {
                if (!observable._eventTypes) {
                    throw new Error('Object passed is not a publisher');
                }
                eventTypes = eventTypes || Object.keys(observable._eventTypes);
                var i, len = eventTypes.length, eventType;
                for (i = 0; i < len; i += 1) {
                    eventType = eventTypes[i];
                    observable.on(eventType, Li.bind(relayThis, null, false, eventType), this);
                }
            };
        }()),

        /**
         * Remove an event listener.
         * @param {String|Function} uuidORfunc Can be the event listener as a Function object,
         * OR the UUID returned by 'on' function can also be used.
         * @return {Boolean} Returns true if listener was successfully removed.
         * @method off
         * @alias removeListener
         */
        off: function (eventType, uuidORfunc) {
            eventType = eventType.toLowerCase();
            var found = false;
            if (this._eventMap) {
                var events = this._eventMap[eventType], i, len,
                    type = typeof uuidORfunc === 'string' ? "uuid" : "fn",
                    value = uuidORfunc;
                if (events) {
                    for (i = 0, len = events.length; i < len; i++) {
                        if (events[i][type] === value) {
                            events.splice(i, 1);
                            found = true;
                            break;
                        }
                    }
                }
            }
            return found;
        }
    };

    /**
     * When Li.observable() is called on a function or object, methods are added to that function/object to make it an observable/publisher.<br/>
     * All the other methods listed here are methods that are added to the object.<br/>
     * <br/>
     * If you dislike this idea of dynamically adding methods to an object, then you could create an observable base class for yourself.
     * @param {Function | Object} constructorFuncOrObj A constructor to augment, or an object to which methods will be added.
     * @param {Array} eventTypes A list of event types that the publisher will fire.
     * @method observable
     * @example
     *      obj = {}, myClass = function() {};
     *      Li.observable(obj, ['hide']);
     *      Li.observable(myClass, ['show']);
     *
     * @example
     *      Create an observable base class:
     *      this.Observable = Li.extend(Object, {});
     *      Li.observable(this.Observable, []);
     */
    //TODO: Update tests on case when constructorFuncOrObj is an object instance.
    Li.observable = (function () {
        var P = function () {}; //Proxy
        return function (constructorFuncOrObj, eventTypes) {
            var c = constructorFuncOrObj, x, i, len;
            if (typeof constructorFuncOrObj === 'function') {
                //Make a copy of event types from prototype chain
                P.prototype = constructorFuncOrObj.prototype;
                var types = (new P())._eventTypes;
                if (types) {
                    for (x in types) {
                        if (types.hasOwnProperty(x)) {
                            types[x] = true;
                        }
                    }
                    constructorFuncOrObj.prototype._eventTypes = types;
                }
                c = constructorFuncOrObj.prototype;
            }
            c._eventTypes = c._eventTypes || {};
            var temp;
            for (i = 0, len = eventTypes.length; i < len; i += 1) {
                temp = eventTypes[i].toLowerCase();
                c._eventTypes[temp] = true;
            }
            c.fireEvent = methods.fireEvent;
            c.on = methods.on;
            c.off = methods.off;
            c.addListener = methods.on;
            c.removeListener = methods.off;
            c.suspendEvents = methods.suspendEvents;
            c.resumeEvents = methods.resumeEvents;
            c.relayEvents = methods.relayEvents;
        };
    }());

    /**
     * @class jQuery
     * @static
     */

    /**
     * A quick way of adding a listener (This API might remind you of Qt (C++) connect function).<br/>
     * @param {Object} publisher Must be an observable
     * @param {String} eventType Event to listen to
     * @param {Object} scope The scope in which the listener will be called. Generally this would be the instance of a class
     * @param {Function} handler Function that does something when event gets fired. Generally this would be a method of a class instance.
     * I advise not to use anonymous function here, as a convention. If you need to use anonymous function, then use publisher.on method directly.<br/>
     * Example: Li.connect(obj1, 'save', obj2, obj2.onSave);
     * @method connect
     */
    Li.connect = function (publisher, eventType, scope, handler) {
        publisher.on(eventType, handler, scope);
    };
}(window.Li));
