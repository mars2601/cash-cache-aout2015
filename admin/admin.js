/* Chèch Lajan
 *
 * /app.js - admin entry point
 *
 * started @ 03/12/14
 */

"use strict";

var $ = require( "jquery" ),
    FastClick = require( "fastclick" ),
    router = require( "./router" );

window.app.now = new Date();

$( function() {
    FastClick( document.body );

    window.app.router = new router();
    window.app.router.start();
} );
