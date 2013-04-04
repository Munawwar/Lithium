# Lithium for jQuery

Lithium adds the following useful APIs to be used along with jQuery:

1. Data type assertion: isDefined,isElement...
2. Things like bind,inherit,namespace...
3. Observable (Publisher-subscriber pattern) that can be used to communicate between loosly coupled modules/components.
3. IE8 JS 1.6 and JS 1.8 polyfills, like string trim, array forEach,lastIndexOf,filter,reduce...
4. Browser detection (which is still useful in rare cases..like for statistics).

Lithium depends on jQuery. Lithium is seperated into modules, so you use only what you need.

## Browser support

Latest Chrome,Firefox,Safari,Opera and IE8+.

## API

### Data types

Li.isDefined(val) - Returns true if val isn't undefined.

Li.isElement(o) - Returns true if o is an instance of HTMLElement

Li.isNaN(val) - Returns true if val is NaN.

### Patterns

* Li.namespace(string) - Creates a global namespace.

  ``Li.namespace('app.utils');``

* Li.extend(base, obj) - Classical inheritence

    <pre><code>var myClass = Li.extend(Object, {
        constructor: function (cfg) {
            $.extend(this, cfg);
        },
        prop: "Lithium",
        method: function () {/*...*/},
        statics: { //Special property to defined static methods/properties
            staticProp: "prop"
        }
    });</code></pre>

* Observable

    <pre><code>var Restaurant = Li.extend(Object, {
        //Methods
        salesOffer: function () {
            this.fireEvent('freefood', '1.00 PM');
        }
    });
    Li.observable(Restaurant, ['freefood']); //Make class a publisher

    /*Subscriber/Listener*/
    var HungryMan = Li.extend(Object, {
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

* Li.lbind(fn [, context, args...]) - Binds context and arguments to a function (like the [JS.1.8.1 Function.bind](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind)). Argument list is prepended to fn.

    <pre><code>element.onclick = Li.lbind(function (val, e) {
      console.log(this ===  element); //true
      console.log(val); //10
      console.log(e); //If IE9+, you'll get event.
    }, element, 10);</code></pre>

* Li.rbind - Same as lbind, except that arguments are appended to fn arugment list.

* Li.forEach(obj [, callback, context]) - forEach on any object. For arrays, Array.forEach is called internally.
* Li.uuid([len=10, hypenate=false]) - Returns a random UID with length 'len' and hyphenated if hypenate=true, as string.
* Li.object.value(obj) - Returns all values of an object. Object.keys(obj) would return keys of an object.
* Li.object.size(obj) - Returns the number of enumerable properties of the object.
* Li.string.htmlEncode and Li.string.htmlDecode - Encodes/DEcodes >,<," and &.

### Browser Detection

<pre><code>Li.isIE - will be set when browser is MS IE.
Li.isIE9 - will be set when browser is MS IE.
Li.isChrome
Li.isWebKit
...similar for other browsers and versions
Li.isAndroid
Li.isIPhone
Li.isIPad
Lis.isMobile - True if iPhone, Android, BlackBerry, Windows Phone or Symbian.

Additionally:
Li.browser.name - e.g. 'IE'
Li.browser.version - e.g. '9'
Li.browser.OS - e.g. 'Windows'
Li.browser.OSVersion (set if available) - e.g. '6.1'
</code></pre>
