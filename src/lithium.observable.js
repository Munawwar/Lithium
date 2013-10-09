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
     * @class Li.observable
     * @static
     */
    var methods = {
        /**
         * Call all events listeners for the given event name.<br/>
         * @param {String} eventType
         * @param {Any} ... n number of arguments. These shall be directly passed onto the event listeners.
         * @method trigger
         */
        trigger: function (eventType) {
            eventType = eventType.toLowerCase();
            this._eventMap_ = this._eventMap_ || {};
            if ((!this._eventTypes_ || !this._eventTypes_[eventType]) && Li.warnings) {
                console.warn(eventType + "? This event type has not been registered.");
            }
            if (!this._suspendEvents_ && this._eventMap_[eventType]) {
                var i, len,
                    events = this._eventMap_[eventType];
                for (i = 0, len = events.length; i < len; i += 1) {
                    events[i].fn.apply(events[i].scope, Li.slice(arguments, 1));
                }
            }
        },

        /**
         * Adds a listener.
         * If no parameters are specified, then this would re-enable events that were switched off by observable.off();
         * @param {String|Object} object The event type that you want to listen to as string.
         * Or an object with event types and handlers as key-value pairs (with event type as the keys).
         * You can also subscribe for an event that has not yet been registered as an event. Hence the order of registeration is not a concern.
         * @param {Function} handler Function that gets notfied when a event of 'eventType' gets fired. This param is used only when eventType is a string.
         * @param {Object} scope The context in which the function should be called.
         * @method on
         * @alias addListener
         * @return A UUID which can be used to remove the event when required.
         */
        //TODO: Add option to bind arguments
        on: (function () {
            var uuidGen = 1;
            //TODO: Also set config like onetime = true etc
            return function (eventType, handler, scope) {
                if (!Li.isDefined(eventType)) {
                    this._suspendEvents_ = false;
                } else if (Li.isObject(eventType)) {
                    var ret = {};
                    Li.forEach(eventType, function (handler, type) {
                        ret[type] = this.on(type, handler, scope);
                    }, this);
                    return ret;
                } else {
                    this._eventMap_ = this._eventMap_ || {};
                    var events = this._eventMap_,
                        id = 'ls' + (uuidGen++);
                    events[eventType] = events[eventType] || [];
                    events[eventType].push({
                        uuid: id,
                        fn: handler,
                        scope: scope
                    });
                    return id;
                }
            };
        }()),

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
                this.trigger.apply(this, ([eventType]).join(args));
            };
            return function (observable, eventTypes) {
                if (!observable._eventTypes_) {
                    throw new Error('Object passed is not a publisher');
                }
                eventTypes = eventTypes || Object.keys(observable._eventTypes_);
                var i, len = eventTypes.length, eventType;
                for (i = 0; i < len; i += 1) {
                    eventType = eventTypes[i];
                    observable.on(eventType, Li.bind(relayThis, null, false, eventType), this);
                }
            };
        }()),

        /**
         * Remove an event listener.
         * If no parameters are specified, then all events are switched off till you call observable.on().
         * @param {String|Function} uuidORfunc Can be the event listener as a Function object,
         * OR the UUID returned by 'on' function can also be used.
         * @return {Boolean} Returns true if listener was successfully removed.
         * @method off
         * @alias removeListener
         */
        off: function (eventType, uuidORfunc) {
            if (!Li.isDefined(eventType)) {
                this._suspendEvents_ = true;
                return;
            }
            eventType = eventType.toLowerCase();
            var found = false;
            if (this._eventMap_) {
                var events = this._eventMap_[eventType], i, len,
                    type = Li.isString(uuidORfunc) ? "uuid" : "fn",
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
     * @method Li.observable
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
            eventTypes = eventTypes || [];
            var c = constructorFuncOrObj, x, i, len;
            if (typeof constructorFuncOrObj === 'function') {
                //Make a copy of event types from prototype chain
                P.prototype = constructorFuncOrObj.prototype;
                var types = (new P())._eventTypes_;
                if (types) {
                    for (x in types) {
                        if (types.hasOwnProperty(x)) {
                            types[x] = true;
                        }
                    }
                    constructorFuncOrObj.prototype._eventTypes_ = types;
                }
                c = constructorFuncOrObj.prototype;
            }
            c._eventTypes_ = c._eventTypes_ || {};
            var temp;
            for (i = 0, len = eventTypes.length; i < len; i += 1) {
                temp = eventTypes[i].toLowerCase();
                c._eventTypes_[temp] = true;
            }
            c.trigger = methods.trigger;
            c.on = methods.on;
            c.off = methods.off;
            c.relayEvents = methods.relayEvents;
        };
    }());
}(window.Li));
