/* Chèch Lajan
*
* /models/terminal.js - backbone model for terminal
*
* started @ 12/12/14
*/

"use strict";

var _ = require( "underscore" ),
    Backbone = require( "backbone" );

Backbone.$ = require( "jquery" );

module.exports = Backbone.Model.extend( {

    "urlRoot": "/api/terminals",

    "parse": function( oResponse ) {
        // TODO handle errors
        if( oResponse.data && oResponse.url ) {
            return oResponse.data;
        } else {
            return oResponse;
        }
    }

} );
