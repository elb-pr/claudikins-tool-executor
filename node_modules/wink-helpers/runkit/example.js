// Load wink helpers
var helpers = require( 'wink-helpers' );

/* Use array helpers */
console.log( helpers.array.isArray( [] ) );
// -> true

var ppl = [ { name: 'aiden', age: 42 }, { name: 'olivia', age: 37 } ];
console.log( ppl.sort( helpers.array.ascendingOn( 'age' ) ) );
// -> [ { "name": "olivia", "age": 37 }, { "name": "aiden", "age": 42 } ]

console.log( helpers.array.product( [ [ 9, 8 ], [ 1, 2 ] ] ) );
// -> [ [ 9, 1 ], [ 9, 2 ], [ 8, 1 ], [ 8, 2 ] ]


/* Use object helpers */
console.log( helpers.object.isObject( {} ) );
// -> true

console.log( helpers.object.isObject( new Set() ) );
// -> false

console.log( helpers.object.table( { mobile: 33, chargers: 45, usb: 27 } ) );
// -> [ [ "mobile", 33 ], [ "chargers", 45 ], [ "usb", 27 ] ]
