var concentrationGame = ( function( $, window ) {
  var DOMStrings = {
    grid: ".grid",
    svgWrapper: '.svg-wrapper'
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
    $( DOMStrings.svgWrapper ).addClass( 'flipped' );
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
      if ( !game.status.started ) {
        alert( "Start the game first!" );
        return;
      }
      var SVG = $( this );

      /* do nothing when clicked on on of the paired card */
      if ( SVG.hasClass( "matched" ) ) {
        return;
      }

      var svgID = SVG.data( "svg" );
      var svgFlipped = $( ".svg-wrapper.flipped" );

      /* Prevent to fast clicking. TODO: Consider another decision */
      // if ( svgFlipped.length >= 3 ) {
      //   alert( "not so fast" );
      //   return;
      // }

      console.log(game.svgsFlipped);

      /*important to exclude itself, because it may contain class flipped already but not matched.*/
      var svgMatched = svgFlipped.filter( function() {
        return $( this ).data( "svg" ) === svgID;
      } );

      if ( svgMatched.length ) {
        SVG.add( svgMatched )
          .addClass( "matched" )
          .delay( 600 )
          .queue( function() {
            $( this )
              .css( "visibility", "hidden" )
              .dequeue();
          } );

        // svgMatched.remove();
        $( ".svg-wrapper" )
          .not( svgMatched )
          .removeClass( "flipped" );
        game.matches++;
      } else {

        // $(".svg-wrapper").removeClass('flipped');
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
      $( this ).addClass( "flipped" );
      game.svgsFlipped.push( $( this ).data('svg') );
      /* Counting game moves */
      game.moves++;

      /* Game was successfully finished! */
      if ( game.matches === game.gridCards / 2 ) {
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
          scrollToTarget( $( "#result" ), 0, -50 );
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
    game.svgs = [];
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
    console.log( "the game has started!" );

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
  } );
} )( jQuery );
