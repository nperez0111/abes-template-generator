const ofCorrectType = type => type == 'text' ? '' : type == 'number' ? 0 : false,
    ofEachType = utils.pick( constants.columnsToInput, 'type' ).map( ofCorrectType ),
    getItem = name => JSON.parse( localStorage.getItem( name ) ),
    setItem = ( name, obj ) => localStorage.setItem( name, JSON.stringify( obj ) )

var Main = Ractive.extend( {
    keys: [ 'inputs', 'disabled', 'toAdd', 'suggestions', 'data', 'extras' ],
    invoice: function ( ev ) {
        const items = this.get( 'inputs' ).map( input => input.map( cur => cur.reduce( ( p, c, i ) => {
            p[ constants.columnsToInput[ i ].id ] = c
            return p
        }, {} ) ) )

        makeFile( utils.Generator( this.get( 'data' ), items ) )
    },
    moveTo: function ( fro, to ) {
        if ( fro !== parseInt( fro, 10 ) || to !== parseInt( to, 10 ) ) {
            return false;
        }
        if ( fro > to ) {
            fro = fro + to
            to = fro - to
            fro = fro - to
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
        new Clipboard( '.clippy' );
        this.on( {
            invoice: this.invoice,
            add: this.add,
            delete: this.delete,
            clearStorage: () => {
                localStorage.clear()
            },
            addS: function ( ev ) {
                const index = ev.index.r,
                    text = this.get( 'toAddS.' + index )
                this.push( 'suggestions.' + index, text )
                this.set( 'toAddS.' + index )
            },
            deleteS: function ( ev ) {
                const r = ev.index.r,
                    c = ev.index.c
                this.splice( 'suggestions.' + r, c, 1 )
            },
            openSettings: function () {
                this.toggle( 'settings' )
            },
            disable: function ( ev ) {
                this.toggle( 'disabled.' + ev.index.r )
            },
            editSuggestions: function ( ev ) {
                this.toggle( 'collapsed' )
            },
            export: function () {
                this.toggle( 'startExport' )
            },
            import: function () {
                this.toggle( 'startImport' )
            },
            doImport: function () {
                try {
                    var obj = JSON.parse( this.get( 'import' ) )
                    if ( this.keys.every( cur => cur in obj ) ) {
                        this.keys.forEach( key => {
                            this.set( key, obj[ key ] )
                        } )
                    }
                } catch ( e ) {
                    alert( "Couldn't import" )
                }
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



        this.observe( this.keys.join( " " ), this.save )

    },
    data: function () {
        let items = this.keys.slice( 0 ).fill( false )
        if ( 'localStorage' in window ) {

            var inputs = getItem( 'inputs' )
            if ( !!inputs ) {

                items = this.keys.map( key => getItem( key ) )
            }
        }
        const sugs = items[ 3 ] || utils.possibles.map( c => utils.pick( c, 'name' ) )
        return {
            extras: items[ 5 ] || constants.needed,
            data: items[ 4 ] || utils.pick( constants.needed, 'id' ).reduce( ( p, c, i ) => {
                p[ c ] = ofCorrectType( constants.needed[ i ].type )
                return p
            }, {} ),
            toAdd: items[ 2 ] || constants.labels.map( c => ofEachType.slice( 0 ) ),
            disabled: items[ 1 ] || constants.labels.map( c => false ),
            inputs: items[ 0 ] || constants.labels.map( c => [ /*ofEachType.slice( 0 )*/] ),
            unfilled: constants.labels.map( c => ofEachType.slice( 0 ).fill( false ) ),
            columns: constants.columnsToInput.slice( 0 ),
            labels: constants.labels.slice( 0 ),
            suggestions: sugs,
            toAddS: sugs.map( c => '' ),
            settings: false,
            collapsed: true,
            startExport: false,
            startImport: false,
            import: '',
            combined: function () {
                return JSON.stringify( this.keys.map( key => this.get( key ) ).reduce( ( p, c, i ) => {
                    p[ this.keys[ i ] ] = c;
                    return p
                }, {} ) )
            },
            getTabIndex: function ( r, c ) {
                const items = this.get( 'inputs' )
                const sum = ( utils.sum( items.filter( ( c, i ) => i >= r ).map( c => c.length ) ) )
                return r * items[ r ].length + c
            }
        };
    }
} )



var ractive = new Main( {
    el: '#container',
    template: '#template',
    components: { select: RactiveSelect }
} );
