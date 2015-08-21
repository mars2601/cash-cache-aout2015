/* Chèch Lajan
 *
 * /routes/pages.js - express routes for static pages
 *
 * started @ 03/11/14
 */

"use strict";

var root = __dirname + "/..";

// [GET] / - homepage
var homepage = function( oRequest, oResponse ) {
    oResponse.sendFile( require( "path" ).resolve( root + "/../static/app.html" ) );
};

// [GET] /jade.test - serving jade file for test purposes
var showFirstJade = function( oRequest, oResponse ) {
    oResponse.render( "index.jade", {
        firstname: "Pierre-Antoine",
        lastname: "Delnatte",
        age: 29,
        cats: [
            { name: "Skitty", gender: "female" },
            { name: "Pixel", gender: "male" }
        ]
    } );
};

var adminpage = function( oRequest, oResponse ) {
    oResponse.sendFile( require( "path" ).resolve( root + "/../static/admin.html" ) );
};

// Declare routes
exports.init = function( oApp ) {
    oApp.get( "/", homepage );
    oApp.get( "/admin", adminpage );
    oApp.get( "/jade.test", showFirstJade );
};
