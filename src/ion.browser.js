/**
 * @class jQuery
 */

/**
 * Browser information. This object has 3 sub-properties: name, version and OS.<br/>
 * Overrides jQuery.browser.
 * You also get three 'is' prefixed boolean properties attached to Cu:<br/>
 * 1. for OS (e.g Cu.isWindows), 2. for browser vendor (e.g Cu.isIE), and 3. vendor+version (e.g Cu.isIE8).
 * @property browser
 * @type Object
 * @final
 * @credits Modified code from from http://www.quirksmode.org/js/detect.html.
 */
(function ($) {
    var agent = navigator.userAgent.toLowerCase(),
        it, match,
        name, version, OS, OSVersion,
        browserList = [
            [/iemobile.([\d\.]+)/, 'IEMobile'],
            [/msie.([\d\.]+)/, 'IE'],
            [/chrome.([\d\.]+)/, 'Chrome'],
            [/firefox.([\d\.]+)/, 'Firefox'],
            [/version\/([\d\.]+).+?safari/, 'Safari'],
            [/opera.+?version\/([\d\.]+)/, 'Opera'],
            [/rv.([\d\.]+).+?gecko/, 'Gecko'],
            [/applewebkit.([\d\.]+)/, 'WebKit']
        ],
        OSList = [
            [/windows phone os ([\d\.]+)/, "WindowsPhone"],
            [/windows (nt [\d\.]+)/, "Windows"],
            [/mac os x ([\d_]+)/, "Mac"],
            [/linux/, "Linux"],
            [/android ([\d\.]+)/, "Android"],
            [/iphone os ([\d_]+)/, "IPhone"],
            [/ipad.+?os ([\d_]+)/, "IPad"],
            [/blackberry (\d+)/, "BlackBerry"],
            [/symbianos.([\d\.]+)/, "Symbian"]
        ];

    while ((it = browserList.shift())) {
        match = agent.match(it[0]);
        if (match) {
            name = it[1];
            version = match[1];
            break;
        }
    }

    if (name) {
        Cu["is" + name] = true;
        if (version) {
            Cu["is" + name + parseInt(version, 10)] = true;
        }
    }

    Cu.isWebKit = Cu.isChrome || Cu.isSafari || Cu.isWebKit;
    Cu.isGecko = Cu.isFirefox || Cu.isGecko;
    Cu.isIOS = Cu.isIPhone || Cu.isIPad;

    //TODO: Detect IE compatibility mode

    while ((it = OSList.shift())) {
        match = agent.match(it[0]);
        if (match) {
            OS = it[1];
            if ((OSVersion = match[1])) {
                OSVersion = OSVersion.replace('_', '.');
            }
            break;
        }
    }
    if (OS) {
        Cu["is" + OS] = true;
    }

    //Bug that WebKit is being detected as Safari on non-iOS phones/tablets
    if (Cu.isSafari && (Cu.isAndroid || Cu.isBlackBerry || Cu.isSymbian)) {
        delete Cu.isSafari;
        delete Cu["is" + name + parseInt(version, 10)];
        name = 'WebKit';
        version = agent.match(/applewebkit.([\d\.]+)/)[1];
        Cu["is" + name + parseInt(version, 10)] = true;
    }

    Cu.browser = {
        name: name,
        version: version,
        OS: OS,
        OSVersion: OSVersion
    };
}(jQuery));
