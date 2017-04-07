const makeNewProxy = require( 'proxify-objects' ),
    //Generator = require( './generator' ),
    Generator = ( a ) => a,
    utils = require( './utils' )

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

global.data = Generator( makeData( {
    divisions: divisions,
    client: 'Nick The Sick',
    fees: 100,
    profit: 10,
    cost: 23,
    total: 1090
} ) )
