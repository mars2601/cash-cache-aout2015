/* Chèch Lajan
 *
 * /routes/api/terminals.js - express routes for terminals api calls
 *
 * started @ 10/11/14
 */

"use strict";

var root = __dirname + "/../..";

var api = require( root + "/core/middlewares/api.js" ),
    db = require( root + "/core/db.js" );

var Terminal = db.get( "Terminal" );

var iMaxSearchRadius = 150,
    iArcKilometer = 0.009259,
    iAdminMaxSearchRadius = 350;


// [GET] /api/terminals

var list = function( oRequest, oResponse ) {
    var fLatitude = parseFloat( oRequest.query.latitude ),
        fLongitude = parseFloat( oRequest.query.longitude ),
        iGivenRadius = +oRequest.query.radius,
        iSearchRadiusSize,  // parseInt( oRequest.query.radius, 10 )
        oPosition = {
            "latitude": fLatitude,
            "longitude": fLongitude
        };
    if( !fLatitude || !fLongitude ) {
        return api.error( oRequest, oResponse, "TERMINALS_LIST_NO_POSITION_GIVEN", oRequest.query );
    }
    if( isNaN( iGivenRadius ) || iGivenRadius > iMaxSearchRadius ) {
        iGivenRadius = 5;
    }
    iSearchRadiusSize = iArcKilometer * iGivenRadius;
    Terminal
        .find( {
            "latitude": {
                "$gt": fLatitude - iSearchRadiusSize,
                "$lt": fLatitude + iSearchRadiusSize
            },
            "longitude": {
                "$gt": fLongitude - iSearchRadiusSize,
                "$lt": fLongitude + iSearchRadiusSize
            }
        } )
        .populate( "bank" )
        .exec( function( oError, aTerminals ) {
            var aCleanedTerminals = [],
                aSplicedTerminals;
            if( oError ) {
                return api.error( oRequest, oResponse, oError.type, oError );
            }
            if( !aTerminals ) {
                aTerminals = [];
            }
            aTerminals.forEach( function( oTerminal ) {
                aCleanedTerminals.push( oTerminal.clean( oPosition ) );
            } );
            aCleanedTerminals.sort( function( oOne, oTwo ) {
                return oOne.distance - oTwo.distance;
            } );
            aSplicedTerminals = aCleanedTerminals.splice( 0, 10 );
            api.send( oRequest, oResponse, aSplicedTerminals );
        } );
};

var map = function( oRequest, oResponse ) {
  var fLatitude = parseFloat( oRequest.query.latitude ),
  fLongitude = parseFloat( oRequest.query.longitude ),
  iGivenRadius = +oRequest.query.radius,
  iSearchRadiusSize,  // parseInt( oRequest.query.radius, 10 )
  oPosition = {
    "latitude": fLatitude,
    "longitude": fLongitude
  };
  if( !fLatitude || !fLongitude ) {
    return api.error( oRequest, oResponse, "TERMINALS_LIST_NO_POSITION_GIVEN", oRequest.query );
  }
  if( isNaN( iGivenRadius ) || iGivenRadius > iMaxSearchRadius ) {
    iGivenRadius = 5;
  }
  iSearchRadiusSize = iArcKilometer * iGivenRadius;
  Terminal
  .find( {
    "latitude": {
      "$gt": fLatitude - iSearchRadiusSize,
      "$lt": fLatitude + iSearchRadiusSize
    },
    "longitude": {
      "$gt": fLongitude - iSearchRadiusSize,
      "$lt": fLongitude + iSearchRadiusSize
    }
  } )
  .populate( "bank" )
  .exec( function( oError, aTerminals ) {
    var aCleanedTerminals = [],
    aSplicedTerminals;
    if( oError ) {
      return api.error( oRequest, oResponse, oError.type, oError );
    }
    if( !aTerminals ) {
      aTerminals = [];
    }
    aTerminals.forEach( function( oTerminal ) {
      aCleanedTerminals.push( oTerminal.clean( oPosition ) );
    } );
    aCleanedTerminals.sort( function( oOne, oTwo ) {
      return oOne.distance - oTwo.distance;
    } );
    aSplicedTerminals = aCleanedTerminals.splice( 0, 10 );
    api.send( oRequest, oResponse, aSplicedTerminals );
  } );
};

var details = function( oRequest, oResponse ) {
    Terminal
        .findById( oRequest.params.id )
        .populate( "bank" )
        .exec( function( oError, oTerminal ) {
            if( oError ) {
                return api.error( oRequest, oResponse, oError.type, oError );
            }
            if( !oTerminal ) {
                return api.error( oRequest, oResponse, "TERMINAL_UNKNOWN" );
            }
            api.send( oRequest, oResponse, oTerminal.clean() );
        } );
};

var empty = function( oRequest, oResponse ) {
    Terminal
        .findById( oRequest.params.id )
        .exec( function( oError, oTerminal ) {
            if( oError ) {
                return api.error( oRequest, oResponse, oError.type, oError );
            }
            if( !oTerminal ) {
                return api.error( oRequest, oResponse, "TERMINAL_UNKNOWN" );
            }
            oTerminal.empty = true;
            oTerminal.save( function( oError, oSavedTerminal ) {
                if( oError ) {
                    return api.error( oRequest, oResponse, oError.type, oError );
                }
                api.send( oRequest, oResponse, true );
            } );
        } );
};

var full = function( oRequest, oResponse ) {
    Terminal
        .findById( oRequest.params.id )
        .exec( function( oError, oTerminal ) {
            if( oError ) {
                return api.error( oRequest, oResponse, oError.type, oError );
            }
            if( !oTerminal ) {
                return api.error( oRequest, oResponse, "TERMINAL_UNKNOWN" );
            }
            oTerminal.empty = false;
            oTerminal.save( function( oError, oSavedTerminal ) {
                if( oError ) {
                    return api.error( oRequest, oResponse, oError.type, oError );
                }
                api.send( oRequest, oResponse, true );
            } );
        } );
};


var changeAddress = function( oRequest, oResponse ) {
    Terminal
        .findById( oRequest.params.id )
        .exec( function( oError, oTerminal ) {
            if( oError ) {
                return api.error( oRequest, oResponse, oError.type, oError );
            }
            if( !oTerminal ) {
                return api.error( oRequest, oResponse, "TERMINAL_UNKNOWN" );
            }
            oTerminal.address = oRequest.params.address;
            oTerminal.save( function( oError, oSavedTerminal ) {
                if( oError ) {
                    return api.error( oRequest, oResponse, oError.type, oError );
                }
                api.send( oRequest, oResponse, true );
            } );
        } );
};

var changePosition = function( oRequest, oResponse ) {
    Terminal
        .findById( oRequest.params.id )
        .exec( function( oError, oTerminal ) {
            if( oError ) {
                return api.error( oRequest, oResponse, oError.type, oError );
            }
            if( !oTerminal ) {
                return api.error( oRequest, oResponse, "TERMINAL_UNKNOWN" );
            }
            oTerminal.address = oRequest.params.address;
            oTerminal.latitude = oRequest.params.latitude;
            oTerminal.longitude = oRequest.params.longitude;

            oTerminal.save( function( oError, oSavedTerminal ) {
                if( oError ) {
                    return api.error( oRequest, oResponse, oError.type, oError );
                }
                api.send( oRequest, oResponse, true );
            } );
        } );
};

var changeBank = function( oRequest, oResponse ) {
    Terminal
        .findById( oRequest.params.id )
        .exec( function( oError, oTerminal ) {
            if( oError ) {
                return api.error( oRequest, oResponse, oError.type, oError );
            }
            if( !oTerminal ) {
                return api.error( oRequest, oResponse, "TERMINAL_UNKNOWN" );
            }
            oTerminal.bank = oRequest.params.bank;
            oTerminal.save( function( oError, oSavedTerminal ) {
                if( oError ) {
                    return api.error( oRequest, oResponse, oError.type, oError );
                }
                api.send( oRequest, oResponse, true );
            } );
        } );
};

// Declare routes
exports.init = function( oApp ) {
    oApp.get( "/api/terminals", list );
    oApp.get( "/api/terminals/:id", details );
    oApp.put( "/api/terminals/:id/empty", empty );
    oApp.put( "/api/terminals/:id/full", full );
    oApp.put( "/api/terminals/:id/:address/changeaddress", changeAddress );
    oApp.put( "/api/terminals/:id/:address/:latitude/:longitude/changeposition", changePosition );
    oApp.put( "/api/terminals/:id/:bank/changebank", changeBank );
};
