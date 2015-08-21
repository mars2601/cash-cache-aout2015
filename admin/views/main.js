/* Chèch Lajan
 *
 * /views/main.js - backbone main application view
 *
 * started @ 12/12/14
 */

"use strict";

var _ = require( "underscore" ),
    Backbone = require( "backbone" ),
    $ = require( "jquery" );

Backbone.$ = require( "jquery" );

module.exports = Backbone.View.extend( {

    "el": "body",
    "$el": $( "body" ),

    "constructor": function() {
        Backbone.View.apply( this, arguments );

        console.log( "AdminMainView:init()" );

        // TODO : define private accessors to subviews
    },

    "loading": function( bLoadingState, sNewStatus ) {
        if( bLoadingState ) {
            this._status = window.app.router.views.header.getStatus();
            window.app.router.views.header.loading( true );
            window.app.router.views.header.setStatus( sNewStatus || "chargement..." );
        } else {
            window.app.router.views.header.loading( false );
            window.app.router.views.header.setStatus( sNewStatus );
        }
    },

    "initAdminHeader": function( AdminHeaderView ) {
        this.$el.find( "#main" ).append( AdminHeaderView.$el );
    },

    "clearContent": function() {
        // cette methode sert à vider les vues avant d'en rajouter de nouvelles
        this.$el.find( "#main section:not(#status)" ).remove();

    },

    "initAdminList": function( AdminTerminalsListView ) {
        this.$el.find( "#main" ).append( AdminTerminalsListView.$el );
    },

    "initAdminDetails": function( AdminTerminalDetailsView ){
        this.$el.find( "#main" ).append( AdminTerminalDetailsView.$el );
    }

} );
