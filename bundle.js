/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const isFn = __webpack_require__(4),
    isArr = a => Array.isArray(a)

function makeNewProxy(obj, properties, setters = {}) {

    const keys = Object.keys(properties),
        settersKeys = Object.keys(setters),
        hasProp = (which, prop) => which.indexOf(prop) > -1

    const proxyObject = new Proxy(obj, {
        get(target, property) {
            if (!property) return noop;

            if (hasProp(keys, property)) {
                return properties[property](proxyObject)
            }
            if (!target.hasOwnProperty(property) && hasProp(keys, 'defaultCase')) {
                return properties.defaultCase(proxyObject, property)
            }

            return target[property]
        },
        set(target, property, value) {
            if (!property) return noop;
            let ret = value
            if (hasProp(settersKeys, property)) {
                let val = setters[property]
                if (isFn(val)) {
                    ret = val(proxyObject, property, value)
                }
                if (ret === undefined) {
                    return true;
                }
            } else if (hasProp(settersKeys, 'defaultCase')) {

                ret = setters.defaultCase(proxyObject, property, value, target)

                if (ret === undefined) {
                    return true
                }
            }

            target[property] = ret

            return true
        }
    })
    return proxyObject
}

module.exports = makeNewProxy


/***/ }),
/* 1 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const makeNewProxy = __webpack_require__( 0 )
const divisor = 6142
const E = {
    sum: items => {
        return items.reduce( ( p, c ) => p + c, 0 )
    },
    pick: ( obj, toPickout ) => {
        if ( Array.isArray( obj ) ) {
            return obj.map( cur => cur && cur[ toPickout ] )
        }
        return obj[ toPickout ]
    },
    concat: ( arr ) => arr.reduce( ( p, c ) => p.concat( c ), [] ),
    makeLineItem: ( obj, totalOfOtherItems ) => {
        return makeNewProxy( obj, {
            gsf( obj ) {
                return ( obj.amount / divisor ).toFixed( 2 )
            },
            perc( obj ) {
                return ( obj.amount / totalOfOtherItems ).toFixed( 4 ) * 100
            }
        } )
    },
    makeDivision: ( obj, index, allLineItems ) => {
        return makeNewProxy( obj, {
            subtotal( obj ) {
                return E.sum( E.pick( obj.lineItems, 'amount' ) )
            },
            number( obj ) {
                return index + 1
            },
            lineItems( obj ) {
                return allLineItems[ index ] || []
            }
        } )
    },
    makeData: ( obj ) => {
        return makeNewProxy( obj, {
            sum( obj ) {
                return E.sum( E.pick( obj.divisions, 'subtotal' ) )
            },
            insurance( obj ) {
                return parseInt( obj.sum * 0.0115, 10 )
            },
            subtotal( obj ) {
                return obj.sum + obj.insurance
            },
            profit( obj ) {
                return obj.sum * 0.2
            },
            cost( obj ) {
                return obj.subtotal + obj.fees
            },
            gsf( obj ) {
                return ( obj.sum / divisor ).toFixed( 2 )
            }
        } )
    },
    parseItems: items => {
        const total = E.sum( E.concat( items.map( item => item && E.pick( item, 'amount' ) ) ) )

        return items.map( bet => bet && bet.map( obj => E.makeLineItem( obj, total ) ) )
    },
    parseDivisions: ( items ) => {
        return [
            'General Requirements',
            'Site work',
            'Concrete',
            'Masonry',
            'Metals',
            'Wood and Plastics',
            'Thermal / Waterproof protection',
            'Doors and Windows',
            'Finishes',
            'Specialties',
            'Equipment',
            'Unknown',
            'Special Construction',
            'Unknown',
            'Plumbing + HVAC',
            'Electrical + Lighting'
        ].map( label => {
            return { label: label }
        } ).map( ( obj, i ) => {
            if ( items[ i ] == undefined || items[ i ] === null || items.length == 0 ) {
                return false;
            }
            return E.makeDivision( obj, i, items )
        } ).filter( a => a )
    }
}
module.exports = E


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {const makeNewProxy = __webpack_require__( 0 ),
    //Generator = require( './generator' ),
    utils = __webpack_require__( 2 )

const pick = utils.pick,
    concat = utils.concat,
    sum = utils.sum,
    makeData = utils.makeData,
    parseItems = utils.parseItems,
    parseDivisions = utils.parseDivisions


var items = parseItems( [
    [ {
        description: 'thing1',
        amount: 1000,
        div: 123
    }, {
        description: 'thing1',
        amount: 1000,
        div: 123
    } ],
    [ {
        description: 'thing1',
        amount: 1000,
        div: 123
    }, {
        description: 'thing1',
        amount: 1000,
        div: 123
    } ]
] )


var divisions = parseDivisions( items )
var Generator = ( a ) => a
global.data = Generator( makeData( {
    divisions: divisions,
    client: 'Nick The Sick',
    fees: 100,
    profit: 10,
    cost: 23,
    total: 1090
} ) )

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var toString = Object.prototype.toString;

module.exports = function (x) {
	return toString.call(x) === '[object Function]';
};


/***/ })
/******/ ]);