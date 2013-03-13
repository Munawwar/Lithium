# Ion Plugins for jQuery

Ion adds the following useful APIs to jQuery:

1. Data related methods. isDefined,isElement...
2. Things like fbind,inherit,namepsace,augment...
3. Observable (Publisher-subscriber pattern) that can be used to communicate between loosly coupled modules/components.
3. IE8 JS 1.6 and JS 1.8 polyfills, like string trim, array forEach,lastIndexOf,filter,reduce...
4. Browser detection (which is still useful is rare cases..like for statistics).

Plugins are seperated into modules, so you can use only what you need.

## Browser support

Latest Chrome,Firefox,Safari,Opera and IE8+.

## API

### Lang

$.isDefined(val) - Returns true if val isn't undefined.

$.isElement(o) - Returns true if o is an instance of HTMLElement

$.isNaN(val) - Returns true if val is NaN.

### Patterns

* $.namepsace(string) - Creates a global namespace.

  ``$.namespace('app.utils');``

* $.inherit(base, obj) - Classical inheritence

    <pre><code>var myClass = $.inherit(Object, {
        constructor: function (cfg) {
            $.extend(this, cfg);
        },
        prop: "Ion",
        method: function () {/*...*/},
        statics: { //Special property to defined static methods/properties
            staticProp: "prop"
        }
  });</code></pre>

* Observable

    <pre><code>var Restaurant = $.inherit(Object, {
            //Methods
            salesOffer: function () {
                this.fireEvent('freefood', '1.00 PM');
            }
        });
    $.observable(Restaurant, ['freefood']); //Make class a publisher
    
    /*Subscriber/Listener*/
    var HungryMan = $.inherit(Object, {
        constructor: function (name, restaurant) {
            this.name = name;
            //Add listener
            restaurant.on('freefood', function (time) {
                console.log(name + ' says: Yay! free food!');
            }, this);
        }
    });
    /*----------------------------------*/
    
    /*Demonstration*/
    /*----------------------------------*/
    var someRestaurant = new Restaurant();
    var a = new HungryMan('man1', someRestaurant),
        b = new HungryMan('man2', someRestaurant);
    
    //Somewhere in a onclick event we execute...
    someRestaurant.salesOffer(); //...this would call all listeners. In this case it will display..
    //man1 says: Yay! free food!
    //man2 says: Yay! free food!</code></pre>

* $.lbind(fn [, context, args...]) - Binds context and arguments to a function (like the [JS.1.8.1 Function.bind](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind)). Argument list is prepended to fn.

    <pre><code>element.onclick = $.rbind(function (val, e) {
      console.log(this ===  element); //true
      console.log(val); //10
      console.log(e); //If IE9+, you'll get event.
    }, element, 10);</code></pre>

* $.rbind - Same as lbind, except that arguments are appended to fn arugment list.

* $.forEach(obj [, callback, context]) - forEach on any object. For arrays, Array.forEach is called internally.
* $.uuid([len=10, hypenate=false]) - Returns a random UID with length 'len' and hyphenated if hypenate=true, as string.
* $.object.value(obj) - Returns all values of an object. Object.keys(obj) would return keys of an object.
* $.object.size(obj) - Returns the number of enumerable properties of the object.
* $.string.htmlEncode and $.string.htmlDecode - Encodes/DEcodes >,<," and &.

### Browser Detection

Note: ion.browser.js will override the default jQuery $.browser object. So add it *only* if you need it and *only* if you know whats happening.
Also note ion's $.browser isn't having the same API as jQuery's default $.browser.

<pre><code>$.browser.isIE - will be set when browser is MS IE.
$.browser.isIE9 - will be set when browser is MS IE.
$.browser.isChrome
$.browser.isWebKit
...similar for other browsers and versions
Additionally:
$.browser.name - e.g. 'IE'
$.browser.version - e.g. '9'
$.browser.OS - e.g. 'Windows'
$.browser.OSVersion (set if available) - e.g. '6.1'
</code></pre>
