/* Chèch Lajan
 *
 * /views/admin-header.js - backbone admin header view
 *
 * started @ 12/12/14
 */

"use strict";

var _ = require( "underscore" ),
    Backbone = require( "backbone" ),
    $ = require( "jquery" );

Backbone.$ = require( "jquery" );

var _tpl;

module.exports = Backbone.View.extend( {

    "el": "<div />",

    "constructor": function() {
        Backbone.View.apply( this, arguments );

        console.log( "AdminHeaderView:init()" );

        if( !_tpl ) {
            _tpl = $( "#tpl-header" ).remove().text();
        }
    },

    "events": {
        "click #reload": "reloadList",
        "click #back": "backList"
    },

    "render": function() {
        
        this.$el
            .html( _tpl );

        this.$status = this.$el.find( "#status h2" );

        return this;
    },

    "loading": function( bLoadingState ) {
        this.$el.find( "#status" ).toggleClass( "loading", bLoadingState );
    },

    "getStatus": function() {
        return this.$status.text();
    },

    "setStatus": function( sText ) {
        this.$status.text( sText );
    },

    "reloadList": function(e) {
        e.preventDefault();
        Backbone.history.loadUrl(Backbone.history.fragment);
    },

    "backList": function(e) {
        e.preventDefault();
        window.app.router.navigate( "admin", { trigger: true } );
    },




} );
