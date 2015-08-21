/* Chèch Lajan
 *
 * /views/terminals-list.js - backbone admin terminals list
 *
 * started @ 12/12/14
 */

"use strict";

var _ = require( "underscore" ),
    Backbone = require( "backbone" ),
    $ = require( "jquery" );

Backbone.$ = require( "jquery" );

var _tpl;

var TerminalElementView = require( "./terminals-list-element" );

module.exports = Backbone.View.extend( {

    "el": "<section />",

    "constructor": function( oPosition, oTerminalsCollection, oRadius ) {
        Backbone.View.apply( this, arguments );

        //console.log(latitude);


        this.collection = oTerminalsCollection;
        this.position = oPosition;
        this.radius = oRadius;

        var iGivenRadius = oRadius;
        console.log( "AdminTerminalsListView:init()" );
        console.log(this.collection);

        if( !_tpl ) {
            _tpl = $( "#tpl-list" ).remove().text();
        }
    },

    "events": {
        "click #show": "showList",
        "click #hide": "hideList",
        "change #radius": "changeRadius"
    },

    "render": function() {

        $( '#back' ).hide();

        this.$el
            .html( _tpl )
                .find( '#radius' )
                    .attr( 'value', this.radius )
                    .end()
                .find( '#radiusValue' )
                    .text( this.radius + 'km' )
                    .end()
                .find( '#hide' )
                    .hide()
                    .end();

        this.create();

        return this;
    },

    "create": function() {

        console.log( "addBounds" );


        var myLatlng = new google.maps.LatLng(this.position.latitude, this.position.longitude);

        var radiusToZoom = Math.round(14-Math.log(this.radius)/Math.LN2);

        var myOptions = {
            zoom: radiusToZoom - 1,
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
            zIndex: 2,
            draggable: true
        });

        google.maps.event.addListener( myMarker, 'dragend', function() {
            
            console.log( myMarker.getPosition() );

        });


        var myCircle = new google.maps.Circle({
            strokeColor: '#000c20',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#ffffff',
            fillOpacity: 0.4,
            map: myMap,
            center: myLatlng,
            radius: this.radius * 1000
        });

        console.log(this.collection);

        this.collection.each( function( oTerminalModel ) {

            var model = oTerminalModel;
            
            var bank = model.get( "bank" ),
                latitude = model.get( "latitude" ),
                longitude = model.get( "longitude" );

            var myMarker = new google.maps.Marker({
                position: new google.maps.LatLng( latitude, longitude ),
                map: myMap,
                icon: '/images/markers/terminal-marker.png',
                zIndex: 1
            });

        } );
        

    },

    "showList": function(e) {
        
        e.preventDefault();


        this.$el
            .html( _tpl )
                .find( '#radius' )
                    .attr( 'value', this.radius )
                    .end()
                .find( '#radiusValue' )
                    .text( this.radius + 'km' )
                    .end()
                .find( '#show' )
                    .hide()
                    .end() 
                .find( '#hide' )
                    .show()
                    .end() 
                .find( 'ul' )
                    .show()
                    .end();

        var $list = this.$el.find( "ul" );

        this.collection.each( function( oTerminalModel ) {
            ( new TerminalElementView( oTerminalModel ) ).render().$el.appendTo( $list );
        } );
    },

    "hideList": function(e) {
        e.preventDefault();

        this.$el
            .html( _tpl )
                .find( '#radius' )
                    .attr( 'value', this.radius )
                    .end()
                .find( '#radiusValue' )
                    .text( this.radius + 'km' )
                    .end()
                .find( '#show' )
                    .show()
                    .end() 
                .find( '#hide' )
                    .hide()
                    .end() 
                .find( 'ul' )
                    .hide()
                    .end()
    },

    "changeRadius": function( e ){
        e.preventDefault();

        var radius = $( '#radius' ).val(); 

        window.app.router.navigate( "admin/list/" + radius, { trigger: true } );
    },

} );