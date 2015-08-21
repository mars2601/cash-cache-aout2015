/* Chèch Lajan
 *
 * /views/terminal-details.js - backbone terminal details view
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
var aMarkers = [];
var mapOptions;
var map;
var oCurrentPosition;
var myPoints = [];
var setNewLatLng;
var oBank;

module.exports = Backbone.View.extend( {

    "el": "<section />",

    "constructor": function( oTerminalModel ) {
        Backbone.View.apply( this, arguments );

        this.model = oTerminalModel;

        console.log( "TerminalDetailsView:init()" );

        if( !_tpl ) {
            _tpl = $( "#tpl-details" ).remove().text();
        }
    },

    "events": {
        "click .problems a#empty_terminal": "toggleEmptyState",
        "click .problems a#delete_terminal": "deleteTerminal",
        "click .problems a#wrong_place_terminal": "wrongPlaceTerminal",
        "click .problems a#wrong_bank_terminal": "wrongBankTerminal",
        "click .problems a#double_terminal": "doubleTerminal",
    },

    "render": function( map, oPosition ) {

        // User current marker
        oCurrentPosition = {
          "latitude": oPosition.latitude,
          "longitude": oPosition.longitude
        };


        oBank = this.model.get( "bank" );

        // Terminal marker
        var oTerminalPosition = {
          "latitude": this.model.get( "latitude" ),
          "longitude": this.model.get( "longitude" )
        };

        // GOOLE MAP TRAITMENT
        // GOOLE MAP TRAITMENT

        var bounds = new google.maps.LatLngBounds();

        myPoints = [];
        myPoints.push( new google.maps.LatLng(oTerminalPosition.latitude, oTerminalPosition.longitude));
        myPoints.push( new google.maps.LatLng(oCurrentPosition.latitude, oCurrentPosition.longitude));

        mapOptions = {
          center: {
            lat: oTerminalPosition.latitude,
            lng: oTerminalPosition.longitude
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

        for(var i = 0; i < myPoints.length; i++){
          bounds.extend(myPoints[i]);
        };
        map.fitBounds(bounds);
        map.setZoom(map.getZoom() - 1);

        var userImage = '../../images/markers/me-marker.png';
        var CurrentLatlng = new google.maps.LatLng(oCurrentPosition.latitude,oCurrentPosition.longitude);

        // user location marker
        addMarker(CurrentLatlng, userImage);

        var image = '../../images/markers/terminal-marker.png';
        var TerminalLatlng = new google.maps.LatLng(oTerminalPosition.latitude,oTerminalPosition.longitude);

        // terminal location marker
        addMarker(TerminalLatlng, image);

        // add marker to aMarker array
        function addMarker(location, image){
          var marker = new google.maps.Marker({
            position: location,
            map: map,
            title: "My position" ,
            icon: image
          });
          aMarkers.push(marker);
        }

        var latLngTab = [ TerminalLatlng, CurrentLatlng ];

        var oTerminalPosition = {
            "latitude": this.model.get( "latitude" ),
            "longitude": this.model.get( "longitude" )
        };

        // GOOLE MAP TRAITMENT --END
        // GOOLE MAP TRAITMENT --END

        // hide the status button
        $(document).find( ".status" )
          .css( "display", "none" )
        .end();

        // blured turn off
        $("#gmap")
        .removeAttr("class")
        .end();

        // display the back buttons
        $("#header")
          .find("#back")
            .css("display", "block")
            .end()

        // display the problem buttons
        $("#header")
          .find("#problems")
            .css("display", "block")
            .end()

        this.$el
            .html( _tpl )
            .attr( "id", "details" )
            .show()
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
                .find( "#distance" )
                    .text( ( jeyodistans( oTerminalPosition, window.app.currentPosition ) * 1000 ) + "m" )
                    .end()
                .end()
            .find( ".problems" )
                .toggle( !this.model.get( "empty" ) )
                .css( "display", "none" )
                .end()
            .find( ".confirm_problem" )
                .hide();

        return this;
    },

    "toggleEmptyState": function( e ) {
        e.preventDefault();
        var that = this;
        this.model.set( "empty", false );
        this.model.save( null, {
            "url": "/api/terminals/" + this.model.get( "id" ) + "/empty",
            "success": function() {
                that.$el
                    .find( "empty" )
                        .show()
                        .end()
                    .find( ".problems" )
                        .hide();
            }
        } );
    },
    "deleteTerminal": function( e ) {
      console.log("deleteTerminal");
    },
    "wrongPlaceTerminal": function( e ) {
      console.log("wrongPlaceTerminal");

      // hide problem list and display a warning message
        $(".problems")
          .find("a")
          .css("display", "none")
          .end()
        .append("<p class=\"define_new_place\">Clickez sur la carte pour positionner la banque.");

      // GOOLE MAP TRAITMENT
      // GOOLE MAP TRAITMENT
      map = new google.maps.Map(document.getElementById('gmap'), mapOptions);

      var bounds = new google.maps.LatLngBounds();

      // var myPoints = [];
      // myPoints.push( new google.maps.LatLng(oCurrentPosition.latitude, oCurrentPosition.longitude));
      // myPoints.push( new google.maps.LatLng(oTerminalPosition.latitude, oTerminalPosition.longitude));

      for(var i = 0; i < myPoints.length; i++){
        bounds.extend(myPoints[i]);
      };
      map.fitBounds(bounds);
      map.setZoom(map.getZoom() - 1);

      var userImage = '../../images/markers/me-marker.png';
      var CurrentLatlng = new google.maps.LatLng(oCurrentPosition.latitude,oCurrentPosition.longitude);

      // user location marker
      addMarker(CurrentLatlng, userImage);

      // add marker to aMarker array
      function addMarker(location, image){
        var marker = new google.maps.Marker({
          position: location,
          map: map,
          title: "My position" ,
          icon: image
        });
        aMarkers.push(marker);
      }
      function setAllMap(map) {
        for (var i = 1; i < aMarkers.length; i++) {
          aMarkers[i].setMap(map);
        }
      }
      function clearMarkers() {
        setAllMap(null);
      }

      var that;
      that = this.model;



      // New event click -> create marker and set position
      google.maps.event.addListener(map, 'click', function( e ) {
        var image = '../../images/markers/terminal-marker.png';
        clearMarkers();
        addMarker(CurrentLatlng, "../../images/markers/me-marker.png");
        addMarker(e.latLng, image);
        setNewLatLng = e.latLng;


        // add confirm button
        if($("#confirm-button").length){
        }else{
            $("#demo")
          .append("<a href=\"#\" id=\"confirm-button\" >Confirmer la nouvelle localisatn</a>");

          // confirm the new localisation
          $("#confirm-button").click(function(){
            // store the new localisation
            that.set( "latitude", setNewLatLng.D );
            that.set( "longitude", setNewLatLng.k );
            console.log(that);
            console.log(setNewLatLng.D);
            console.log(setNewLatLng.k);
            that.save( null, {
              "url": "/api/terminals/" + that.get( "id" ) + "/reposition",
              "success": function() {
                $( ".problems" )
                .hide();
              },
              "error": function() {
                console.log("aie");
              }
            } );
          });
        }
      });
      // GOOLE MAP TRAITMENT --END
      // GOOLE MAP TRAITMENT --END


    },
    "wrongBankTerminal": function( e ) {
      console.log("wrongBankTerminal");
    },
    "doubleTerminal": function( e ) {
      console.log("doubleTerminal");
    },
} );
