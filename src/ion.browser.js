/**
 * @class jQuery
 */

/**
 * Browser information. This object has 3 sub-properties: name, version and OS.<br/>
 * Overrides jQuery.browser.
 * You also get three 'is' prefixed boolean properties attached to ion:<br/>
 * 1. for OS (e.g ion.isWindows), 2. for browser vendor (e.g ion.isIE), and 3. vendor+version (e.g ion.isIE8).
 * @property browser
 * @type Object
 * @final
 * @credits Modified code from from http://www.quirksmode.org/js/detect.html.
 */
(function (ion) {
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
        ion["is" + name] = true;
        if (version) {
            ion["is" + name + parseInt(version, 10)] = true;
        }
    }

    ion.isWebKit = ion.isChrome || ion.isSafari || ion.isWebKit;
    ion.isGecko = ion.isFirefox || ion.isGecko;
    ion.isIOS = ion.isIPhone || ion.isIPad;

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
        ion["is" + OS] = true;
    }

    //Bug that WebKit is being detected as Safari on non-iOS phones/tablets
    if (ion.isSafari && (ion.isAndroid || ion.isBlackBerry || ion.isSymbian)) {
        delete ion.isSafari;
        delete ion["is" + name + parseInt(version, 10)];
        name = 'WebKit';
        version = agent.match(/applewebkit.([\d\.]+)/)[1];
        ion["is" + name + parseInt(version, 10)] = true;
    }

    ion.browser = {
        name: name,
        version: version,
        OS: OS,
        OSVersion: OSVersion
    };
}(window.ion));
