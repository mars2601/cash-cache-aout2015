/* Chèch Lajan
 *
 * /views/terminals-list.js - backbone terminals list view
 *
 * started @ 12/12/14
 */

"use strict";

var _ = require( "underscore" ),
    Backbone = require( "backbone" ),
    $ = require( "jquery" );



Backbone.$ = require( "jquery" );

var TerminalElementView = require( "./terminals-list-element" );
/*
var mapView = require( "./map" );
*/

var _tpl;

module.exports = Backbone.View.extend( {

    "el": "<section />",

    "constructor": function( oTerminalsCollection ) {
        Backbone.View.apply( this, arguments );

        this.collection = oTerminalsCollection;

        console.log( "TerminalsListView:init()" );

        if( !_tpl ) {
            _tpl  = $( "#tpl-result-list" ).remove().text();
        }
    },

    "events": {
      "click a#see-all": "showMap"
    },

    "render": function( map, oPosition ) {
      var mapOptions = {
        center: {
          lat: oPosition.latitude,
          lng: oPosition.longitude
        },
        zoom: 16,
        mapTypeControl: false,
        panControl: false,
        zoomControl: false,
        streetViewControl: false,
        scaleControl: true,
        styles: [{featureType:"landscape",stylers:[{saturation:-100},{lightness:65},{visibility:"on"}]},{featureType:"poi",stylers:[{saturation:-100},{lightness:51},{visibility:"simplified"}]},{featureType:"road.highway",stylers:[{saturation:-100},{visibility:"simplified"}]},{featureType:"road.arterial",stylers:[{saturation:-100},{lightness:30},{visibility:"on"}]},{featureType:"road.local",stylers:[{saturation:-100},{lightness:40},{visibility:"on"}]},{featureType:"transit",stylers:[{saturation:-100},{visibility:"simplified"}]},{featureType:"administrative.province",stylers:[{visibility:"off"}]/**/},{featureType:"administrative.locality",stylers:[{visibility:"off"}]},{featureType:"administrative.neighborhood",stylers:[{visibility:"on"}]/**/},{featureType:"water",elementType:"labels",stylers:[{visibility:"on"},{lightness:-25},{saturation:-100}]},{featureType:"water",elementType:"geometry",stylers:[{hue:"#ffff00"},{lightness:-25},{saturation:-97}]}]
      };

      map = new google.maps.Map(document.getElementById('gmap'), mapOptions);

        // hide back button
        $("#header")
        .find("#back")
        .css("display", "none")
        .end();

        $("#gmap")
        .attr("class", "blured")
        .end();

        // hide the problem buttons
        $("#header")
          .find("#problems")
            .css("display", "none")
            .end();

        this.$el
            .attr( "id", "result" )
            .html( _tpl )
            .find('#see-all')
            .css('display', 'block');

        var $list = this.$el.find( "ul" );

        this.collection.each( function( oTerminalModel ) {
            ( new TerminalElementView( oTerminalModel ) ).render().$el.appendTo( $list );
        } );

        return this;
    },

    "showMap": function( e ) {
      console.log('showMapClick');
      e.preventDefault();
      window.app.router.navigate( "terminals/map", { trigger: true } );
    }

} );
