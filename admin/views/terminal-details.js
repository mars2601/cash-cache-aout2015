/* Chèch Lajan
 *
 * /views/terminal-details.js - backbone admin terminal details view
 *
 * started @ 19/12/14
 */

"use strict";

var _ = require( "underscore" ),
    Backbone = require( "backbone" ),
    $ = require( "jquery" ),
    jeyodistans = require( "jeyo-distans" );

Backbone.$ = require( "jquery" );

var _tpl;

module.exports = Backbone.View.extend( {

    "el": "<section />",

    "constructor": function( oPosition, oTerminalModel ) {
        Backbone.View.apply( this, arguments );

        this.model = oTerminalModel;
        this.position = oPosition;

        console.log( "TerminalDetailsView:init()" );

        if( !_tpl ) {
            _tpl = $( "#tpl-details" ).remove().text();
        }
    },

    "events": {
        "click #emptyTerminal": "toggleEmptyState",
        "click #fullTerminal": "toggleFullState",
        "click #wrongAddress": "changeInfos",
        "click #wrongBank": "changeInfos",
        "submit #changeAddress": "changeAddress",
        "submit #changeBank": "changeBank"

    },

    "render": function() {

        $( '#back' ).show();

        var oBank = this.model.get( "bank" );

        var oTerminalPosition = {
            "latitude": this.model.get( "latitude" ),
            "longitude": this.model.get( "longitude" )
        };

        this.$el
            .html( _tpl )
                .find( ".details" )
                    .find( "h3" )
                        .find( "img" )
                            .attr( "src", oBank && oBank.icon ? "/images/banks/" + oBank.icon : "images/banks/unknown.png" )
                            .attr( "alt", oBank && oBank.name ? oBank.name : "Inconnu" )
                            .end()
                        .find( "span" )
                            .css( "color", "#" + ( oBank && oBank.color ? oBank.color : "333" ) )
                            .text( oBank && oBank.name ? oBank.name : "Inconnu" )
                            .end()
                        .end()
                        .find( "address" )
                            .text( this.model.get( "address" ) )
                            .end()
                        .find( ".empty" )
                            .toggle( this.model.get( "empty" ) )
                            .end()
                        .find( ".infos" )
                            .css( "position", "relative" )
                            .css( "right", "auto" )
                            .css( "top", "auto" )
                            .css( "bottom", "0" )
                            .css( "text-align", "right" )
                            .find( "> span" )
                            .text( ( jeyodistans( oTerminalPosition, window.app.currentPosition ) * 1000 ) + "m" )
                            .end()
                        .end();

        if( this.model.get( 'empty' ) == true ) {
            this.$el
                .find( '#empty' )
                    .show()
                    .end()
                .find( '#full' )
                    .hide()
                    .end()
                .find ( '#fullTerminal' )
                    .show()
                    .end()
                .find( '#emptyTerminal' )
                    .hide()
                    .end()
        }else{
            this.$el
                .find( '#empty' )
                    .hide()
                    .end()
                .find( '#full' )
                    .show()
                    .end()
                .find ( '#fullTerminal' )
                    .hide()
                    .end()
                .find( '#emptyTerminal' )
                    .show()
                    .end()
        }

        this.create();

        return this;
    },

    "create": function() {

        var myLatlng = new google.maps.LatLng(this.position.latitude, this.position.longitude);

        var myOptions = {
            zoom: 2,
            zoomControl: true,
            scrollwheel: false,
            center: myLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var myMap = new google.maps.Map( document.getElementById('gmap'), myOptions );

        var myMarker = new google.maps.Marker({
            position: myLatlng,
            title: 'Ma position',
            map: myMap,
            icon: '/images/markers/me-marker.png',
            zIndex: 2
        });
            
        var bank = this.model.get( "bank" ),
            latitude = this.model.get( "latitude" ),
            longitude = this.model.get( "longitude" );

        var bankMarker = new google.maps.Marker({
            position: new google.maps.LatLng( latitude, longitude ),
            title: this.model.get( 'bank' ).name,
            map: myMap,
            icon: '/images/markers/terminal-marker.png',
            animation: google.maps.Animation.BOUNCE,
            zIndex: 1,
            draggable: true
        });

        bankMarker.set( 'model', this.model );

        google.maps.event.addListener( bankMarker, 'dragstart', function() {
            
            bankMarker.setAnimation(null);

        });

        google.maps.event.addListener( bankMarker, 'dragend', function() {

            geocodePosition( bankMarker.getPosition() );

        });

        function geocodePosition( position ) {
            var geocoder = new google.maps.Geocoder();
            
            geocoder.geocode({ latLng: position }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {

                    var address = results[0].formatted_address,
                        latitude = position.G,
                        longitude = position.K;

                    bankMarker.get( 'model' ).save( null, {
                        'url': '/api/terminals/' + bankMarker.get( 'model' ).get( 'id' ) + '/' + address + '/' + latitude + '/' + longitude + '/changeposition',
                        'success': function() {
                            Backbone.history.loadUrl(Backbone.history.fragment);
                        }
                    } ); 

                } 
            } );
        }

    },

    "toggleEmptyState": function( e ) {
        e.preventDefault();

        this.model.set( "empty", true );

        this.model.save( null, {
            "url": "/api/terminals/" + this.model.get( "id" ) + "/empty",
            "success": function() {
                $( '#empty' ).show();
                $( '#full' ).hide();
                $( '#fullTerminal' ).css( 'display', 'block' );
                $( '#emptyTerminal' ).hide();
            }
        } );
    },

    "toggleFullState": function( e ) {
        e.preventDefault();

        this.model.set( "empty", false );
        console.log(this.model);

        this.model.save( null, {
            "url": "/api/terminals/"+this.model.get( "id" )+"/full",
            "success": function() {
                $( '#empty' ).hide();
                $( '#full' ).show();
                $( '#fullTerminal' ).hide();
                $( '#emptyTerminal' ).show();
            },"error": function(model, response) {
                console.log('Error!');
                console.log(response);
            }
        } );
    },

    "changeInfos": function( e ) {
        e.preventDefault();

        console.log(e.target.id);

        if( e.target.id == 'wrongAddress' ) {
            $( '.formulaire' ).toggle();
            $( '.changeBank' ).toggle();
        }
        else {
            $( '.formulaire' ).toggle();
            $( '.changeAddress' ).toggle();
        }
    },

    "changeAddress": function( e ){
        e.preventDefault();
        
        var address = $( '#address' ).val();

        this.model.save( null, {
            'url': '/api/terminals/' + this.model.get( 'id' ) + '/' + address + '/changeaddress',
            'success': function() {
                Backbone.history.loadUrl(Backbone.history.fragment);
            },"error": function(model, response) {
                console.log('Error!');
                console.log(response);
            }
        } );          
    },

    "changeBank": function( e ){
        e.preventDefault();
        
        var bank = $( '#bankSelect' ).val();

        this.model.save( null, {
            'url': '/api/terminals/' + this.model.get( 'id' ) + '/' + bank + '/changebank',
            'success': function() {
                Backbone.history.loadUrl(Backbone.history.fragment);
            },"error": function(model, response) {
                console.log('Error!');
                console.log(response);
            }
        } );          
    }

} );
