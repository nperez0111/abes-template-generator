const ofEachType = utils.pick( constants.columnsToInput, 'type' ).map( cur => {
        if ( cur == 'text' ) {
            return ''
        }
        if ( cur == 'number' ) {
            return 0
        }
        return false
    } ),
    getItem = name => JSON.parse( localStorage.getItem( name ) ),
    setItem = ( name, obj ) => localStorage.setItem( name, JSON.stringify( obj ) )

var Main = Ractive.extend( {
    keys: [ 'inputs', 'disabled', 'toAdd', 'possibles' ],
    invoice: function ( ev ) {
        //figure out data schema
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

        makeFile( utils.Generator( {
            client: 'Nick The Sick',
            fees: 100,
            profit: 10,
            cost: 23,
            total: 1090
        }, items ) )
    },
    moveTo: function ( fro, to ) {
        if ( fro !== parseInt( fro, 10 ) || to !== parseInt( to, 10 ) ) {
            return false;
        }
        if ( fro > to ) {
            fro = fro + to;
            to = fro - to;
            fro = fro - to;
        }
        var data = this.get( "inputs." + index ),
            x = data.splice( fro, 1 ),
            y = data.splice( to - 1, 1 );
        data.splice( fro, 0, y[ 0 ] );
        data.splice( to, 0, x[ 0 ] );
        return true;
    },
    add: function ( ev ) {
        const index = ev.index.r
        this.set( 'unfilled.' + index, ofEachType.slice( 0 ).fill( false ) )
        console.log( index )
        const cur = 'inputs.' + index
        const toAdd = this.get( 'toAdd.' + index )
        if ( toAdd.some( ( cur, i ) => cur === ofEachType[ i ] ) ) {
            const unfilled = toAdd.map( ( c, i ) => i ).map( ( c, i ) => toAdd[ i ] === ofEachType[ i ] )
            this.set( 'unfilled.' + index, unfilled )
            return;
        }
        this.push( cur, toAdd );

        this.set( 'toAdd.' + index, ofEachType.slice( 0 ) )
    },
    delete: function ( ev ) {
        console.log( ev )
        this.splice( 'inputs.' + ev.index.r, ev.index.c, 1 )
    },
    save: utils.throttle( 300, function () {

        this.keys.forEach( key => {

            setItem( key, this.get( key ) )

        } )

    } ),
    oninit: function () {
        this.on( {
            invoice: this.invoice,
            add: this.add,
            delete: this.delete,
            openSettings: function () {
                this.toggle( 'settings' )
            },
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
                        description: 'thing2khjkhk',
                        amount: 1000,
                        div: 123
                    } ],
                    [ {
                        description: 'thing1',
                        amount: 100,
                        div: 123
                    }, {
                        description: 'thing2',
                        amount: 10,
                        div: 1230
                    } ]
                ] ) )
            }
        } )



        this.observe( 'inputs disabled toAdd', this.save )

    },
    data: function () {
        let items = this.keys.slice( 0 ).fill( false )
        if ( 'localStorage' in window ) {

            var inputs = getItem( 'inputs' )
            if ( !!inputs ) {

                items = this.keys.map( key => getItem( key ) )
            }
        }
        return {
            data: {},
            toAdd: items[ 2 ] || constants.labels.map( c => ofEachType.slice( 0 ) ),
            disabled: items[ 1 ] || constants.labels.map( c => false ),
            inputs: items[ 0 ] || constants.labels.map( c => [ /*ofEachType.slice( 0 )*/] ),
            unfilled: constants.labels.map( c => ofEachType.slice( 0 ).fill( false ) ),
            columns: constants.columnsToInput.slice( 0 ),
            labels: constants.labels.slice( 0 ),
            possibles: items[ 3 ] || utils.possibles.slice( 0 ),
            settings: false
        };
    },
    partials: {
        input: `<div class="input-group {{unfilled[r][c]?'has-error':''}}">
            <label for='{{r}}{{c}}' class="input-group-addon" id="label{{r}}{{c}}">{{columns[c].label}} :</label>
            <input type="{{columns[c].type}}" id="{{r}}{{c}}" value="{{toAdd[r][c]}}" tabindex="{{r+c}}" class="form-control" aria-describedby="label{{r}}{{c}}" required>
        </div>`
    }
} )



var ractive = new Main( {
    el: '#container',
    template: '#template'
} );
