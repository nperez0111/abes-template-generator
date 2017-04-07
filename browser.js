const ofEachType = utils.pick( constants.columnsToInput, 'type' ).map( cur => {
    if ( cur == 'text' ) {
        return ''
    }
    if ( cur == 'number' ) {
        return 0
    }
    return false
} )

var Main = Ractive.extend( {
    invoice: function ( ev ) {
        //figure out data schema
        //makeFile( Generator( this.get( 'data' ) ) )
        const items = this.get( 'inputs' ).map( input => input.map( cur => cur.reduce( ( p, c, i ) => {
            if ( i == 0 ) {
                p.description = c
            } else if ( i == 1 ) {
                p.amount = c
            } else if ( i == 2 ) {
                p.div = c
            }
            return p
        }, {} ) ) )
        console.log( 'inboice' )
        makeFile( utils.Generator( {
            client: 'Nick The Sick',
            fees: 100,
            profit: 10,
            cost: 23,
            total: 1090
        }, items ) )
    },
    add: function ( ev ) {
        const index = ev.index.r
        console.log( index )
        const cur = 'inputs.' + index
        const toAdd = this.get( 'toAdd.' + index )
        if ( toAdd.some( ( cur, i ) => cur === ofEachType[ i ] ) ) {
            return;
            //Dont add and throw some error or something
        }
        this.push( cur, toAdd );

        this.set( 'toAdd.' + index, ofEachType.slice( 0 ) )
    },
    delete: function ( ev ) {
        console.log( ev )
        this.splice( 'inputs.' + ev.index.r, ev.index.c, 1 )
    },
    oninit: function () {
        this.on( {
            invoice: this.invoice,
            add: this.add,
            delete: this.delete,
            disable: function ( ev ) {
                this.toggle( 'disabled.' + ev.index.r )
            },
            sanity: function () {
                console.log( 'sanity' );
                makeFile( utils.Generator( {
                    client: 'Nick The Sick',
                    fees: 100,
                    profit: 10,
                    cost: 23,
                    total: 1090
                }, [
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
                ] ) )
            }
        } )
    },
    data: function () {
        return {
            data: {},
            toAdd: constants.labels.map( c => ofEachType.slice( 0 ) ),
            disabled: constants.labels.map( c => false ),
            inputs: constants.labels.map( c => [ /*ofEachType.slice( 0 )*/] ),
            columns: constants.columnsToInput.slice( 0 ),
            selection: constants.labels.map( ( cur, i ) => {
                return { name: cur, id: i }
            } ),
            searchUsers: function ( text, callback ) {
                var error = null;
                var results = constants.labels.map( ( cur, i ) => {
                    return { name: cur, id: i }
                } );
                callback( error, results );
            },
            labels: constants.labels
        };
    }
} )



var ractive = new Main( {
    el: '#container',
    template: '#template'
} );
