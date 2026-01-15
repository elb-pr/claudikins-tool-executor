/* eslint no-console: 0 */
// Load Jaro Distance Function
var jaro = require( 'wink-jaro-distance' );

console.log( jaro( 'father', 'farther') );

console.log( jaro( 'Angelina', 'Angelica') );

console.log( jaro( 'Flikr', 'Flicker' ) );

console.log( jaro( 'abcdef', 'fedcba'  ) );
