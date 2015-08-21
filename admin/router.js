/* Chèch Lajan
 *
 * /router.js - backbone admin router
 *
 * started @ 12/12/14
 */

"use strict";

var _ = require( "underscore" ),
    Backbone = require( "backbone" ),
    jeolok = require( "jeolok" );

Backbone.$ = require( "jquery" );

var AdminMainView = require( "./views/main" );
var AdminHeaderView = require( "./views/header" );
var AdminTerminalsListView = require ( "./views/terminals-list" );
var AdminTerminalDetailsView = require ( "./views/terminal-details" );

var TerminalsCollection = require( "./collections/terminals" );
var TerminalModel = require( "./models/terminal" );

var oPosition;

module.exports = Backbone.Router.extend( {

    "views": {},

    "routes": {
        "admin": "showAdminTerminalsList",
        "admin/list": "showAdminTerminalsList",
        "admin/list/:radius": "showAdminTerminalsList",
        "admin/details/:id": "showAdminTerminalDetails"
    },

    "start": function() {
        console.log( "AdminRouter:started" );

        // 1. define & init views
        ( this.views.main = new AdminMainView() ).render();
        this.views.main.initAdminHeader( ( this.views.header = new AdminHeaderView() ).render() );

        // 2. get geoposition of user
        jeolok.getCurrentPosition( { "enableHighAccuracy": true, "timeout": 11500 }, function( oError, oGivenPosition ) {
            if( oError || !oGivenPosition ) {
                oPosition = {
                    latitude: 50.6833,
                    longitude: 5.55
                };
            } else {
                oPosition = oGivenPosition.coords;
            }

            window.app.currentPosition = oPosition;
            // 3. launch router
            Backbone.history.start( {
                "pushState": true
            } );
        } );
    },

    "showAdminTerminalsList": function( oRadius ) {
        console.log( "showAdminTerminalsList" );

        console.log( oPosition.latitude );

        var that = this;
        this.views.main.loading( true );
        var oTerminalsCollection = new TerminalsCollection();

        if( oRadius == null ) {
            oRadius = 5;
        }

        console.log( oRadius );


        ( this.views.list = new AdminTerminalsListView( oPosition, oTerminalsCollection, oRadius ) )
            .collection
                .fetch( {
                    "data": {
                        "latitude": oPosition.latitude,
                        "longitude": oPosition.longitude,
                        "radius": oRadius
                    },
                    "success": function() {
                        that.views.main.clearContent();
                        that.views.main.initAdminList( that.views.list.render() );
                        that.views.main.loading( false, "Liste des distributeurs" );
                    }
                } );
    },

    "showAdminTerminalDetails": function( sTerminalID ) {
        console.log( "showAdminTerminalDetails" );

        var that = this;
        this.views.main.loading( true );
        var oTerminal = new TerminalModel( { id: sTerminalID } );

        ( this.views.details = new AdminTerminalDetailsView( oPosition, oTerminal ) )
            .model
                .fetch( {
                    "success": function() {
                        that.views.main.clearContent();
                        that.views.main.initAdminDetails( that.views.details.render() );
                        that.views.main.loading( false, "Détails sur le distributeur" );
                    }
                } );

    },

} );