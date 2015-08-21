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
