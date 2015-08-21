(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* Chèch Lajan
 *
 * /app.js - admin entry point
 *
 * started @ 03/12/14
 */

"use strict";

var $ = require( "jquery" ),
    FastClick = require( "fastclick" ),
    router = require( "./router" );

window.app.now = new Date();

$( function() {
    FastClick( document.body );

    window.app.router = new router();
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
},{"./collections/terminals":2,"./models/terminal":3,"./views/header":5,"./views/main":6,"./views/terminal-details":7,"./views/terminals-list":9,"backbone":"backbone","jeolok":"jeolok","jquery":"jquery","underscore":"underscore"}],5:[function(require,module,exports){
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

},{"backbone":"backbone","jquery":"jquery","underscore":"underscore"}],7:[function(require,module,exports){
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

        if( !_tpl ) {
            _tpl = $( "#tpl-list-terminals" ).remove().text();
        }
    },

    "events": {
        "click a": "showTerminal"
    },

    "render": function() {
        var oBank = this.model.get( "bank" );

        this.$el
            .html( _tpl )
            .find( ".details" )
                .css("border-left", "solid 6px #" + ( oBank && oBank.color ? oBank.color : "333" ))
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
        window.app.router.navigate( "admin/details/" + this.model.get( "id" ), { trigger: true } );
    }

} );
},{"backbone":"backbone","jquery":"jquery","underscore":"underscore"}],9:[function(require,module,exports){
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
},{"./terminals-list-element":8,"backbone":"backbone","jquery":"jquery","underscore":"underscore"}]},{},[1]);
