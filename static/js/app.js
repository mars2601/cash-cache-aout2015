(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* Chèch Lajan
 *
 * /app.js - client entry point
 *
 * started @ 03/12/14
 */

"use strict";

var $ = require( "jquery" ),
    FastClick = require( "fastclick" ),
    Router = require( "./router" );

window.app.now = new Date();

$( function() {
    FastClick( document.body );

    console.log( window.app );
    console.log( "ready." );

    window.app.router = new Router();
    window.app.router.start();

} );

},{"./router":4,"fastclick":"fastclick","jquery":"jquery"}],2:[function(require,module,exports){
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

},{"../models/terminal":3,"backbone":"backbone","jquery":"jquery","underscore":"underscore"}],3:[function(require,module,exports){
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

},{"backbone":"backbone","jquery":"jquery","underscore":"underscore"}],4:[function(require,module,exports){
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

},{"./collections/terminals":2,"./models/terminal":3,"./views/header":5,"./views/main":6,"./views/terminal-details":7,"./views/terminals-list":9,"./views/terminals-map":11,"backbone":"backbone","jeolok":"jeolok","jquery":"jquery","underscore":"underscore"}],5:[function(require,module,exports){
/* Chèch Lajan
 *
 * /views/header.js - backbone header view
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

        console.log( "HeaderView:init()" );

        if( !_tpl ) {
            _tpl = $( "#tpl-header" ).remove().text();
        }
    },

    "events": {
        "click #reload": "reloadButtonClicked",
        "click #back": "backButtonClicked",
        "click #problems": "problemsButtonClicked"
    },

    "render": function() {
        this.$el.html( _tpl );

        this.$status = this.$el.find( "#status h3" );

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

    "reloadButtonClicked": function( e ) {
        e.preventDefault();
        console.log( "reloadButtonClicked" );
        Backbone.history.loadUrl(Backbone.history.fragment);
    },

    "backButtonClicked": function( e ) {
      e.preventDefault();
      console.log( "backButtonClicked" );
      window.app.router.navigate( "terminals/list", { trigger: true } );
    },

    "problemsButtonClicked": function( e ) {
      e.preventDefault();
      console.log( "problemsButtonClicked" );

      // display and populate the problem list
      if($("#delete_terminal").length){
        $(".problems")
          .hide();
        $(".problems")
          .children("a").remove();
      }else{
        $(".problems")
            .append("<a href=\"#\" id=\"delete_terminal\">Pas de distributeur ici</a>")
            .append("<a href=\"#\" id=\"wrong_place_terminal\">Mauvaise place sur la carte</a>")
            .append("<a href=\"#\" id=\"wrong_bank_terminal\">Mauvaise banque</a>")
            .append("<a href=\"#\" id=\"double_terminal\">Distributeur en double</a>")
            .fadeIn()
            .end();
      }
    }
} );

},{"backbone":"backbone","jquery":"jquery","underscore":"underscore"}],6:[function(require,module,exports){
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

        console.log( "MainView:init()" );

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

    "initHeader": function( HeaderView ) {
        this.$el.find( "#main" ).append( HeaderView.$el );
    },

    "clearContent": function() {
        // cette methode sert à vider les vues avant d'en rajouter de nouvelles
        this.$el.find( "#main section:not(#status)" ).remove();
    },

    "initList": function( TerminalsListView ) {
        this.$el.find( "#main" ).append( TerminalsListView.$el );
    },

    "initMap": function( TerminalsMapView ) {
      this.$el.find( "#main" ).append( TerminalsMapView.$el );
    },

    "initDetails": function( TerminalDetailsView ) {
        this.$el.find( "#main" ).append( TerminalDetailsView.$el );
    }

} );

},{"backbone":"backbone","jquery":"jquery","underscore":"underscore"}],7:[function(require,module,exports){
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

},{"backbone":"backbone","jeyo-distans":"jeyo-distans","jquery":"jquery","underscore":"underscore"}],8:[function(require,module,exports){
/* Chèch Lajan
 *
 * /views/terminals-list-element.js - backbone terminals list view
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

    "el": "<li />",

    "constructor": function( oTerminalModel ) {
        Backbone.View.apply( this, arguments );

        this.model = oTerminalModel;

        // en faisant comme ceci, on écrase le template à chaque fois, il ne faut l'affecter qu'une seule fois
        // _tpl = $( "#tpl-result-list-elt" ).remove().text();
        if( !_tpl ) {
            _tpl = $( "#tpl-result-list-elt" ).remove().text();
        }
    },

    "events": {
        "click a": "showTerminal"
    },

    "render": function() {
        var oBank = this.model.get( "bank" );

        this.$el
            .html( _tpl )
            .find( "a" )
              .css("border-left", "solid 6px #" + ( oBank && oBank.color ? oBank.color : "333" ))
              // .attr( "style", "border-left: 3px solid #" + (oBank && oBank.color ? oBank.color : "333"))
              .end()
                .find( "img" )
                    .attr( "src", oBank && oBank.icon ? "/images/banks/" + oBank.icon : "images/banks/unknown.png" )
                    .attr( "alt", oBank && oBank.name ? oBank.name : "Inconnu" )
                    .end()
                .find( "strong" )
                    .css( "color", "#" + ( oBank && oBank.color ? oBank.color : "333" ) )
                    .text( oBank && oBank.name ? oBank.name : "Inconnu" )
                    .end()
                .find( "span" )
                    .text( ( parseFloat( this.model.get( "distance" ) ) * 1000 ) + "m" );
        return this;
    },

    "showTerminal": function( e ) {
        e.preventDefault();
        window.app.router.navigate( "terminals/details/" + this.model.get( "id" ), { trigger: true } );
    }

} );

},{"backbone":"backbone","jquery":"jquery","underscore":"underscore"}],9:[function(require,module,exports){
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

},{"./terminals-list-element":8,"backbone":"backbone","jquery":"jquery","underscore":"underscore"}],10:[function(require,module,exports){
/* Chèch Lajan
*
* /views/terminal-map.js - backbone terminal map view
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

  "constructor": function( oTerminalModel ) {
    Backbone.View.apply( this, arguments );

    this.model = oTerminalModel;

    // en faisant comme ceci, on écrase le template à chaque fois, il ne faut l'affecter qu'une seule fois
    // _tpl = $( "#tpl-result-list-elt" ).remove().text();
    if( !_tpl ) {
      _tpl = $( "#tpl-map-elt" ).remove().text();
    }
  },



  "render": function( map, myPoints, aMarkers ) {
    var oBank = this.model.get( "bank" );
    var oBankId = this.model.get( "id" );

    // Terminal marker
    var oTerminalPosition = {
      "latitude": this.model.get( "latitude" ),
      "longitude": this.model.get( "longitude" )
    };

    // add markers to myPoints array
    myPoints.push( new google.maps.LatLng(oTerminalPosition.latitude, oTerminalPosition.longitude));

    var bounds = new google.maps.LatLngBounds();

    var image = '../images/markers/terminal-marker.png';
    var TerminalLatlng = new google.maps.LatLng(oTerminalPosition.latitude,oTerminalPosition.longitude);

    addMarker(TerminalLatlng, image);

    // add marker to aMarker array
    function addMarker(location, image){
      var marker = new google.maps.Marker({
        position: location,
        map: map,
        title: "My position" ,
        icon: image
      });

      // On click marker redirection -> Details Terminal
      google.maps.event.addListener(marker, 'click', function() {
        window.app.router.navigate( "terminals/details/"+oBankId, { trigger: true } );
      });

      aMarkers.push(marker);
    };

    // fix the map bounds
    for(var i = 0; i < myPoints.length; i++){
      bounds.extend(myPoints[i]);
      // var thisMarker = addThisMarker(myPoints[i],i);
      // thisMarker.setMap(map);
    };
    map.fitBounds(bounds);
    map.setZoom(map.getZoom() - 1);

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
  }

} );

},{"backbone":"backbone","jeyo-distans":"jeyo-distans","jquery":"jquery","underscore":"underscore"}],11:[function(require,module,exports){
/* Chèch Lajan
*
* /views/terminal-map.js - backbone terminal map view
*
* started @ 19/12/14
*/

"use strict";

var _ = require( "underscore" ),
Backbone = require( "backbone" ),
$ = require( "jquery" ),
jeyodistans = require( "jeyo-distans" );

Backbone.$ = require( "jquery" );

var TerminalMapView = require( "./terminals-map-element" );

var _tpl;
var myPoints = [];
var aMarkers = [];

module.exports = Backbone.View.extend( {

  "el": "<section />",

  "constructor": function( oTerminalsCollection ) {
    Backbone.View.apply( this, arguments );

    this.collection = oTerminalsCollection;

    console.log( "TerminalsMapView:init()" );

    if( !_tpl ) {
      _tpl = $( "#tpl-map" ).remove().text();
    }
  },

  "events": {},

  "render": function( map, oPosition ) {

    // display the back buttons
    $("#header")
      .find("#back")
        .css("display", "block")
        .end()

    // hide the problem buttons
    $("#header")
      .find("#problems")
        .css("display", "none")
        .end()

    // display the status button
    $(document).find( ".status" )
      .css( "display", "block" )
      .end();

    // blured turn off
    $("#gmap")
      .removeAttr("class")
      .end();

    // User current marker
    var oCurrentPosition = {
      "latitude": oPosition.latitude,
      "longitude": oPosition.longitude
    };

    var mapOptions = {
      center: {
        lat: oCurrentPosition.latitude,
        lng: oCurrentPosition.longitude
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



    var image = '../images/markers/me-marker.png';
    var CurrentLatlng = new google.maps.LatLng( oCurrentPosition.latitude, oCurrentPosition.longitude );

    addMarker(CurrentLatlng, image);

    function addMarker(location, image){
      var marker = new google.maps.Marker({
        position: location,
        map: map,
        title: "My position" ,
        icon: image
      });
      aMarkers.push(marker);
    };

    myPoints.push( new google.maps.LatLng( oCurrentPosition.latitude, oCurrentPosition.longitude ));

    this.collection.each( function( oTerminalModel ) {
      ( new TerminalMapView( oTerminalModel ) ).render( map, myPoints, aMarkers );
    } );


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
  }

} );

},{"./terminals-map-element":10,"backbone":"backbone","jeyo-distans":"jeyo-distans","jquery":"jquery","underscore":"underscore"}]},{},[1]);
