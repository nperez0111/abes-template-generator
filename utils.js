const makeNewProxy = require( 'proxify-objects' )
const constants = require( './constants.json' )
const sortBy = require( 'sort-by' )
const throttle = require( 'throttle-debounce/throttle' ),
    debounce = require( 'throttle-debounce/debounce' )
const divisor = constants.divisor
const lineSplitter = ( list ) => {
    let i = 0
    return list.split( '\n' ).reduce( ( p, c ) => {
        if ( c !== '' ) {
            var index = Number( c.charAt( 0 ) + '' + c.charAt( 1 ) ) - 1,
                obj = {
                    index: i++,
                    name: c.slice( 0 ).trim()
                }
            if ( !( index in p ) ) {
                p[ index ] = []
            }
            p[ index ].push( obj )
        }
        return p

    }, [] )
}
const E = {
    debounce: debounce,
    throttle: throttle,
    lineSplitter: lineSplitter,
    possibles: require( './possibles.json' ),
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
                return ( obj.amount / totalOfOtherItems*100 ).toFixed( 2 )
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
                return parseInt( obj.sum * constants.insurance, 10 )
            },
            subtotal( obj ) {
                return obj.sum + obj.insurance
            },
            profit( obj ) {
                return obj.sum * constants.profit
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
        return constants.labels.map( label => {
            return { label: label }
        } ).map( ( obj, i ) => {
            if ( items[ i ] == undefined || items[ i ] === null || items[ i ].length == 0 ) {
                return false;
            }
            return E.makeDivision( obj, i, items )
        } ).filter( a => a )
    },
    Generator: ( main, items ) => {
        return E.makeData( Object.assign( {}, main, { divisions: E.parseDivisions( E.parseItems( items.map( cur => cur.sort( sortBy( 'description', 'amount' ) ) ) ) ) } ) )
    }
}
module.exports = E
