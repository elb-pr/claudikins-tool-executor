
# wink-helpers
Functions for cross validation, shuffle, cartesian product and more

### [![Build Status](https://api.travis-ci.org/winkjs/wink-helpers.svg?branch=master)](https://travis-ci.org/winkjs/wink-helpers) [![Coverage Status](https://coveralls.io/repos/github/winkjs/wink-helpers/badge.svg?branch=master)](https://coveralls.io/github/winkjs/wink-helpers?branch=master) [![Inline docs](http://inch-ci.org/github/winkjs/wink-helpers.svg?branch=master)](http://inch-ci.org/github/winkjs/wink-helpers) [![devDependencies Status](https://david-dm.org/winkjs/wink-helpers/dev-status.svg)](https://david-dm.org/winkjs/wink-helpers?type=dev) [![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/winkjs/Lobby)

<img align="right" src="https://decisively.github.io/wink-logos/logo-title.png" width="100px" >

Perform cross validation for machine learning, shuffle an array randomly, remove diacritical marks from text, find cartesian product and more using **`wink-helpers`**.


## Installation
Use [npm](https://www.npmjs.com/package/wink-helpers) to install:
```
npm install wink-helpers --save
```


## Example [![Try on Runkit](https://badge.runkitcdn.com/wink-helpers.svg)](https://npm.runkit.com/wink-helpers)

```javascript
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

console.log( helpers.array.shuffle( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ] ) );
// -> [ 3, 7, 8, 9, 6, 4, 2, 1, 10, 5 ]
// Note: output will change on every call!

/* Use object helpers */
console.log( helpers.object.isObject( {} ) );
// -> true

console.log( helpers.object.isObject( new Set() ) );
// -> false

console.log( helpers.object.table( { mobile: 33, chargers: 45, usb: 27 } ) );
// -> [ [ "mobile", 33 ], [ "chargers", 45 ], [ "usb", 27 ] ]


/* Use string helper */
console.log( helpers.string.normalize( 'Résumé' ) );
// -> 'resume'
```

## API
The helper functions are classified into [array](#array), [object](#object), [string](#string) and [validate](#validate).

### array

#### isArray( value )
Tests if argument `value` is a valid JS array; returns `true` if it is, otherwise returns `false`.

#### sorting compare functions
It is a set of handy [compare functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) for handling a variety of array sorting needs.

| compareFunction | Description |
| --- | --- |
| ascending | Sorts elements in ascending order. |
| descending | Sorts elements in descending order. |
| ascendingOnKey | It works on array of arrays, where each element is in the `[ key, value ]` format. Sorts elements in ascending order on the `key`.  |
| descendingOnKey | Same as above, but sorts in descending order.  |
| ascendingOnValue | It works on array of arrays, where each element is in the `[ key, value ]` format. Sorts elements in ascending order on the `value`.  |
| descendingOnValue | Same as above, but sorts in descending order.  |
| ascendingOn( `accessor1` [,`accessor2`] ) | A higher order function that returns a compare function for the accessors — refers to a key whose value will be used to determine the sort order.<br/><br/>Can be directly used as the compare function for sort.<br/><br/>It works on array of *arrays* or *objects*. <br/><br/> When both the accessors are supplied, the combination is treated as a composite key for sort. |
| descendingOn( `accessor1` [,`accessor2`] ) | Same as above, but sorts in descending order. |



#### pluck( array, key, limit )
Plucks the values specified by the `key` from each element of the `array` of *arrays* or *objects*, and returns the resultant array. The default value of `key` is **0**. The number of elements to be plucked is defined by the `limit`, whose default value is `array.length`.

#### product( array )
Returns the *cartesian product* of the arrays present inside the `array` argument. For example, if the `array` argument is `[ [ 1, 2, 3 ], [ 4 ], [ 5, 6 ] ]`, then the return value will be:
```javascript
[
  [ 1, 4, 5 ],
  [ 1, 4, 6 ],
  [ 2, 4, 5 ],
  [ 2, 4, 6 ],
  [ 3, 4, 5 ],
  [ 3, 4, 6 ]
]
```
#### shuffle( array )
Randomly shuffles the order of the elements in the input array using algorithm described in Chapter 3 on Random Numbers of "The Art of Computer Programming Volume II" by Donald E Knuth.

### object

#### isObject( value )
Tests if argument `value` is a JS object; returns `true` if it is, otherwise returns `false`.

#### keys( obj )
Returns keys of the `obj` in an `array`.

#### size( obj )
Returns the number of *keys* in the `obj`.

#### values( obj )
Returns all the *values* from each `key: value` pair in the `obj` in form of an array.

#### valueFreq( obj )
Returns the *frequency* or *count* of every unique value from each `key: value` pair in the `obj` in form of an object.

#### table( obj [, f] )
Converts each `key: value` pair in the `obj` into an array of `[ key, value ]` pairs. Note the returned value be an array of array. Second argument - `f` is optional; it is a function, which is called with each *value*.

### string

#### normalize( str )
Normalizes the `str` by converting it to lower case and stripping the diacritical marks (if any).

### validate

#### isArray( value )
Alias for `array.isArray()`.

#### isObject( value )
Alias for `object.isObject()`.

#### isFiniteInteger( value )
Tests if argument `value` is a finite integer; returns `true` if it is, otherwise returns `false`.

#### isFiniteNumber( value )
Tests if argument `value` is a finite number; returns `true` if it is, otherwise returns `false`.

#### cross( classLabels )
Performs cross validation and generates detailed performance metrics along with the confusion matrix. It is a higher order function that returns an object containing `evaluate()`, `metrics()`,  and `reset()` functions. The `classLabels` should be an array containing all the class labels that may be predicted.

The `evaluate()` function accepts two parameters viz. `truth` — the actual label and `guess` — the predicted label. It is typically called for every row of validation dataset. The evaluation may fail if `truth` or `guess` value is not a valid `classLabels`; or if guess is equal to `unknown`.

The `metrics()` returns an object containing macro-averaged `avgPrecision`, `avgRecall`,  `avgFMeasure` values along with other details such as label-wise recall/precision/f-measure values and the confusion matrix. A value of `null` is returned if no evaluate() has been called before.

The `reset()` re-initializes the current instance for another round of evaluation; the class labels defined at instance creation time are not touched.

## Need Help?
If you spot a bug and the same has not yet been reported, raise a new [issue](https://github.com/winkjs/wink-helpers/issues) or consider fixing it and sending a pull request.

### About wink

[Wink](http://winkjs.org/) is a family of open source packages for **Statistical Analysis**, **Natural Language Processing** and **Machine Learning** in NodeJS. The code is **thoroughly documented** for easy human comprehension and has a **test coverage of ~100%** for reliability to build production grade solutions.


## Copyright & License
**wink-helpers** is copyright 2017-18 [GRAYPE Systems Private Limited](http://graype.in/).

It is licensed under the terms of the MIT License.
