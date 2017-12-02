var concentrationGame = ( function( $, window ) {
  var DOMStrings = {
    grid: ".grid",
    svgWrapper: ".svg-wrapper"
  };

  var game = {
    status: {
      finished: false,
      started: false
    },
    svgs: [],
    svgsFlipped: [],
    counter: 0,
    timer: undefined,
    mins: 0,
    secs: 0,
    moves: 0,
    matches: 0,
    gridCards: 16,

    shuffle: function() {
      this.svgs = this.svgs.sort( function() {
        return Math.random() - 0.5;
      } );
    }
  };

  /* Helper Functions */

  window.onload = function() {
    if ( location.hash.length && $( location.hash ).length ) {
      scrollToTarget( $( location.hash ), 1000, -20 );
    }
  };

  var flipAll = function() {
    $( DOMStrings.svgWrapper ).addClass( "flipped" );
  };

  var scrollToTarget = function( scrollTarget, delay, offset ) {
    $( "html,body" )
      .not( ":animated" )
      .delay( delay )
      .animate( {
          scrollTop: scrollTarget.offset().top + offset
        },
        400
      );
  };

  // Array.prototype.shuffle = function( arr ) {
  //   return arr.sort( function() {
  //     return Math.random() - 0.5;
  //   } );
  // };

  var setupEventListeners = function() {
    $( "a[href^='#']" )
      .not( "[href=\"#\"]" )
      .not( "[href=\"#0\"]" )
      .on( "click", function( e ) {
        e.preventDefault();
        var $scrollTarget = $( $( this ).attr( "href" ) );
        $scrollTarget = $scrollTarget.length ?
          $scrollTarget :
          $(
            "[name=" +
            $( this )
            .attr( "href" )
            .slice( 1 ) +
            "]"
          );

        /* If not found stop execution */
        if ( !$scrollTarget.length ) {
          return;
        }
        scrollToTarget( $scrollTarget, 0, -20 );
      } );

    $( DOMStrings.grid ).on( "click", ".svg-wrapper", function() {
      var svgMatched;
      var SVG = $( this );
      var svgID = SVG.data( "svg" );

      if ( !game.status.started ) {
        alert( "Start the game first!" );
        return;
      }

      /* do nothing when clicked on on of the paired card */
      if ( SVG.hasClass( "matched" ) ) {
        return;
      }

      if ( SVG.hasClass( "flipped" ) ) {

        // console.log( game.svgsFlipped.indexOf( svgID ), "flipped!" );
        return;
      }

      // if ( game.svgsFlipped.length > 2 ) {
      //   alert( "Not so fast!" );
      //   game.svgsFlipped.length = 0;
      //   return;
      // }

      var svgFlipped = $( ".svg-wrapper" ).filter( ".flipped" );
      console.log( svgFlipped );

      /* Prevent to fast clicking. TODO: Consider another decision */
      if ( svgFlipped.length >= 3 ) {
        alert( "not so fast" );
        return;
      }

      /*important to exclude itself, because it may contain class flipped already but not matched.*/
      svgMatched = $.grep( svgFlipped, function( svg, index, svgsaArr ) {
        return svg.getAttribute( "data-svg" ) === svgID;
      } );

      if ( svgMatched.length ) {
        SVG.add( svgMatched )
          .addClass( "matched" )
          /* immediately remove unnecessary class */
          .delay( 600 )
          .queue( function() {
            $( this )
            .css( "visibility", "hidden" )
            .removeClass( "flipped" )
            .dequeue();
          } );

        game.matches++;
      } else {
        if ( svgFlipped.length ) {
          $( ".svg-wrapper" )
            .delay( 500 )
            .queue( function( next ) {
              $( this )
                .stop()
                .removeClass( "flipped" );
              next();
            } );
        }
      }

      SVG.addClass( "flipped" );

      /* Add to array in case exists */
      if ( $.inArray( svgID, game.svgsFlipped ) == -1 ) {
        game.svgsFlipped.push( svgID );
      }

      /* Counting game moves */
      game.moves++;

      /* Game was successfully finished! */
      if ( game.matches === game.gridCards / 2 ) {
        console.log( "The game was finished!" );

        game.finished = true;
        clearInterval( game.timer );
        setTimeout( function() {
          $( ".button#start-game" )
            .text( "Start New Game" )
            .attr( "onclick", "concentrationGame.startNewGame(event)" );
          var congrats =
            "<p>Congratulations! You have successfully finsihed the game in <strong>" +
            game.mins +
            " : " +
            game.secs +
            "</strong> seconds! You have made <strong>" +
            game.moves +
            "</strong> moves to finish the game</p>";
          $( "#result" )
            .css( "visibility", "visible" )
            .html( congrats );
          scrollToTarget( $( "#result" ), 0, -100 );
        }, 1000 );
      }
    } );
  };

  var onSVGget = function( svg ) {
    var svgReturn;
    $( DOMStrings.grid ).append( svg );
    game.svgs = fillSvgsArray();

    /* First random append */
    svgReturn = shuffleSVGS();

    $( DOMStrings.grid )
      .append( svgReturn )
      .addClass( "show" );
  };

  /* Randomizing the keys */
  var shuffleSVGS = function() {
    var svgReturn = "";

    function forEachSvg() {
      $.each( game.svgs, function( i, svg ) {
        svgReturn +=
          "<div class=\"svg-wrapper\" data-svg=\"" +
          svg +
          "\">\n" +
          "<svg class=\"svg-icon\">\n" +
          "<use xlink:href=\"#" +
          svg +
          "\"/>\n" +
          "</svg>\n" +
          "</div>";
      } );
      return svgReturn;
    }

    for ( var i = 0; i < 2; i++ ) {
      game.shuffle();
      svgReturn = forEachSvg();
    }

    return svgReturn;
  };

  /* Filling the svgs array with random keys */
  var fillSvgsArray = function() {
    game.svgs.length = 0;
    $( ".grid > svg" )
      .find( "symbol[id]" )
      .each( function( index, svg ) {
        game.svgs.push( svg.getAttribute( "id" ) );
      } );

    game.shuffle();

    /* Slicing the svgs array in order to have necessery amount of cards */
    return game.svgs.slice( 0, game.gridCards / 2 );
  };

  var init = function() {
    console.log( "The game was initialised!" );

    /* Get the SVG Sprite and Append to HTML in random order */
    $.get(
      "img/game-elements.svg",
      function( svg ) {
        onSVGget( svg );
      },
      "text"
    );

    /* Grid svg on click, scroll on window load, scrollto on click. */
    setupEventListeners();
  };

  var startGame = function() {
    console.log( "The game was started!" );
    game.status.started = true;

    if ( game.timer !== undefined ) {
      alert( "First Finish The Game" );
      return;
    }

    game.timer = setInterval( function() {
      ++game.counter;
      game.mins = Math.floor( game.counter / 60 );
      game.mins = game.mins < 10 ? "0" + game.mins : game.mins;
      game.secs = game.counter % 60;
      game.secs = game.secs < 10 ? "0" + game.secs : game.secs;
      $( "#mins" ).text( game.mins );
      $( "#secs" ).text( game.secs );
    }, 1000 );
  };

  var startNewGame = function() {
    var svgReturn = "";

    /* Refreshing all vars */
    if ( !game.finished ) {
      alert( "First Finish The Game!" );
      return;
    }
    clearInterval( game.timer );
    game.timer = undefined;
    game.counter = 0;
    game.moves = 0;
    game.matches = 0;
    $( "#mins" ).text( "00" );
    $( "#secs" ).text( "00" );
    game.svgs = fillSvgsArray();
    svgReturn = shuffleSVGS();
    $( ".grid .svg-wrapper" )
      .fadeOut()
      .remove();
    $( "#result" ).css( "visibility", "hidden" );
    $( ".grid" ).append( svgReturn );
    game.status.finished = false;
    console.log( "The game was restarted!" );
    window.startGame();
  };

  return {
    init: init,
    startGame: startGame,
    startNewGame: startNewGame,
    flipAll: flipAll,

    retrieveData: function() {
      return game;
    }
  };
} )( jQuery, window );

/* GLOBAL SCOPE */
( function( $ ) {

  /* DOCUMENT.READY */
  $( function() {
    concentrationGame.init();

    /* Delete after */
    concentrationGame.startGame();
  } );
} )( jQuery );
