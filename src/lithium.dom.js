/**
 * @class Li
 */

/**
 * DOM utility methods
 */
(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(['./lithium', 'jquery'], factory);
    } else if (typeof exports === 'object') { //For NodeJS
        module.exports = factory(require('./lithium'), require('jquery-node'));
    } else { //global
        factory(window.Li, jQuery);
    }
}(function (Li, $) {
    Li.mix(Li, {
        /**
         * Given a DOM node, this method finds the next tag/node that would appear in the dom.
         * WARNING: Do not remove or add nodes while traversing, because it could cause the traversal logic to go crazy.
         * @param node Could be a any node (element node or text node)
         * @param ancestor Node An ancestorial element that can be used to limit the search.
         * The search algorithm, while traversing the ancestorial heirarcy, will not go past/above this element.
         * @param {function} callback A callback called on each element traversed.
         *
         * callback gets following parameters:
         * node: Current node being traversed.
         * isOpenTag: boolean. On true, node would be the next open tag/node that one would find when going
         * linearly downwards through the DOM. Filtering with isOpenTag=true, one would get exactly what native TreeWalker does.
         * Similarly isOpenTag=false when a close tag is encountered when traversing the DOM. AFAIK TreeWalker doesn't give this info.
         *
         * callback can return one of the following values (with their meanings):
         * 'halt': Stops immediately and returns null.
         * 'return': Halts and returns node.
         * 'continue': Skips further traversal of current node (i.e won't traverse it's child nodes).
         * 'break': Skips all sibling elements of current node and goes to it's parent node.
         *
         * relation: The relation compared to the previously traversed node.
         * @param {Object} [scope] Value of 'this' keyword within callback
         * @method traverse
         */
        traverse: function (node, ancestor, callback, scope) {
            //if node = ancestor, we still can traverse it's child nodes
            if (!node) {
                return null;
            }
            var isOpenTag = true, ret = null;
            do {
                if (ret === 'halt') {
                    return null;
                }
                if (isOpenTag && node.firstChild && !ret) {
                    node = node.firstChild;
                    //isOpenTag = true;
                    ret = callback.call(scope, node, true, 'firstChild');
                } else {
                    if (isOpenTag) { // close open tag first
                        callback.call(scope, node, false, 'current');
                    }

    				if (node.nextSibling && node !== ancestor && ret !== 'break') {
    					node = node.nextSibling;
    					isOpenTag = true;
    					ret = callback.call(scope, node, true, 'nextSibling');
    				} else if (node.parentNode && node !== ancestor) {
    					//Traverse up the dom till you find an element with nextSibling
    					node = node.parentNode;
    					isOpenTag = false;
    					ret = callback.call(scope, node, false, 'parentNode');
    				} else {
    					node = null;
    				}
                }
            } while (node && ret !== 'return');
            return node || null;
        },

        /**
         * Converts DOM to HTML string
         * @param {DocumentFragment} frag
         * @return {String}
         * @method toHTML
         */
        toHTML: (function () {
            function unwrap(str) {
                var o = {};
                str.split(',').forEach(function (val) {
                    o[val] = true;
                });
                return o;
            }
            var voidTags = unwrap('area,base,basefont,br,col,command,embed,frame,hr,img,input,keygen,link,meta,param,source,track,wbr');

            return function (frag) {
                var html = '';
                Li.traverse(frag, frag, function (node, isOpenTag) {
                    if (node.nodeType === 1) {
                        var tag = node.nodeName.toLowerCase();
                        if (isOpenTag) {
                            html += '<' + tag;
                            Li.slice(node.attributes).forEach(function (attr) {
                                html += ' ' + attr.name + '="' + attr.value.replace(/"/g, '&quot;') + '"';
                            });
                            html += (voidTags[tag] ? '/>' : '>');
                        } else if (!voidTags[tag]) {
                            html += '</' + tag + '>';
                        }
                    }
                    if (isOpenTag && node.nodeType === 3) {
                        var text = node.nodeValue || '';
                        //escape <,> and &. Except text node inside script or style tag.
                        if (!(/^(?:script|style)$/i).test(node.parentNode.nodeName)) {
                            text = text.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;");
                        }
                        html += text;
                    }
                    if (isOpenTag && node.nodeType === 8) {
                        html += '<!-- ' + node.data.trim() + ' -->';
                    }
                }, this);
                return html;
            };
        }()),

        /**
         * jQuery's index() method doesn't return the child index properly for non-element nodes (like text node, comment).
         * @method childIndex
         */
        childIndex: function (node) {
            return Li.slice(node.parentNode.childNodes).indexOf(node);
        }
    });

    return Li;
}));
