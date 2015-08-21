/* Chèch Lajan
 *
 * /router.js - backbone router
 *
 * started @ 12/12/14
 */

"use strict";

var _ = require( "underscore" ),
    Backbone = require( "backbone" ),
    jeolok = require( "jeolok" );

Backbone.$ = require( "jquery" );
var MainView = require( "./views/main" );
var HeaderView = require( "./views/header" );
var TerminalsCollection = require( "./collections/terminals" );
var TerminalModel = require( "./models/terminal" );
var TerminalsListView = require( "./views/terminals-list" );
var TerminalDetailsView = require( "./views/terminal-details" );
var TerminalsMapView = require( "./views/terminals-map" );


var oPosition;
var longitude;
var latitude;
var map;

module.exports = Backbone.Router.extend( {

    "views": {},

    "routes": {
        "terminals/list": "showTerminalsList",
        "terminals/map": "showTerminalsMap",
        "terminals/details/:id": "showTerminalDetails",
        "": "showTerminalsList"
    },

    "start": function() {
        console.log( "Router:started" );

        // 1. define & init views
        ( this.views.main = new MainView() ).render();
        this.views.main.initHeader( ( this.views.header = new HeaderView() ).render() );

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
          });
        });
    },

    "showTerminalsList": function() {
        console.log( "showTerminalsList" );
        var that = this;
        this.views.main.loading( true );
        var oTerminalsCollection = new TerminalsCollection();
        ( this.views.list = new TerminalsListView( oTerminalsCollection ) )
            .collection
                .fetch( {
                    "data": {
                        "latitude": oPosition.latitude,
                        "longitude": oPosition.longitude
                    },
                    "success": function() {
                        that.views.main.clearContent();
                        that.views.main.initList( that.views.list.render( map, oPosition ) );
                        that.views.main.loading( false, oTerminalsCollection.length + " résultats" );
                    }
                } );
    },

    "showTerminalsMap": function() {
        console.log( "showTerminalsMap" );
        var that = this;
        this.views.main.loading( true );
        var oTerminalsCollection = new TerminalsCollection();
        ( this.views.map = new TerminalsMapView( oTerminalsCollection, map, oPosition ) )
        .collection
          .fetch( {
            "data": {
              "latitude": oPosition.latitude,
              "longitude": oPosition.longitude
            },
          "success": function() {
            that.views.main.clearContent();
            that.views.main.initMap( that.views.map.render( map, oPosition ) );
            that.views.main.loading( false, oTerminalsCollection.length + " résultats" );
          }
      });
    },

    "showTerminalDetails": function( sTerminalID ) {
        console.log( "showTerminalDetails:", sTerminalID );
        var that = this;
        this.views.main.loading( true );
        var oTerminal = new TerminalModel( { id: sTerminalID } );
        ( this.views.details = new TerminalDetailsView( oTerminal, map, oPosition ) )
            .model
                .fetch( {
                    "success": function() {
                        that.views.main.clearContent();
                        that.views.main.initDetails( that.views.details.render( map, oPosition ) );
                        that.views.main.loading( false );
                    }
                } );
    }

} );
