/* Chèch Lajan
 *
 * /collections/terminals.js - backbone collections for terminals
 *
 * started @ 12/12/14
 */

"use strict";

var _ = require( "underscore" ),
    Backbone = require( "backbone" );

Backbone.$ = require( "jquery" );

module.exports = Backbone.Collection.extend( {

    "url": "/api/terminals",
    "model": require( "../models/terminal" ),

    "parse": function( oResponse ) {
        // TODO handle errors
        return oResponse.data;
    }

} );
