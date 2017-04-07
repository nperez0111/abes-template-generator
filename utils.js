const makeNewProxy = require( 'proxify-objects' )
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
