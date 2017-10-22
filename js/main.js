(function($) {
	var svgs = [];
	var timer, mins, secs, counter = 0, moves = 0, matches = 0;
	var gridCards = 16;
	var finished = false;
	var started = false;
	/* Shuffling the array in random order */
	Array.prototype.shuffle = function() {
		return this.sort( function() {
			return Math.random() - 0.5;
		});
	}

	window.startGame = function(e) {
		started = true;
		if ( timer !== undefined ) {
			alert('First Finish The Game');
			return;
		}
		timer = setInterval(function(){
			++counter;
			mins = Math.floor( counter / 60);
			mins = mins < 10 ? "0" + mins : mins;
			secs = counter % 60;
			secs = secs < 10 ? "0" + secs : secs;
			$("#mins").text(mins);
			$("#secs").text(secs);
			// console.log( counter, mins, secs );
		}, 1000);
	}

	window.startNewGame = function(e) {
		/* Refreshing all vars */
		if ( ! finished ) {
			alert('First Finish The Game!');
			return;
		}
		clearInterval(timer);
		timer = undefined;
		counter = 0, moves = 0, matches  = 0;
		$("#mins").text('00');
		$("#secs").text('00');
		svgs = fillSvgsArray();
		var svgReturn = shuffleSVGS( svgs, '' );
		$(".grid .svg-wrapper").fadeOut().remove();
		$("#result").css('visibility','hidden');
		$(".grid").append(svgReturn);
		finished = false;
		startGame();
	}


	/* Get the SVG Sprite and Append to HTML in random order */
	$.get('img/game-elements.svg', function( svg ) {
		onSVGget( svg );
	}, 'text');

	function onSVGget( svg ) {
		var svgReturn = '';
		$(".grid").append(svg);
		svgs = fillSvgsArray();
		/* First random append */
		svgReturn = shuffleSVGS( svgs, svgReturn );

		$(".grid").append(svgReturn).addClass('show');
	}

	/* Randomizing the keys */
	function shuffleSVGS( svgs, svgReturn ) {
		for ( var i = 0; i < 2; i++ ) {
			svgs.shuffle();
			$.each( svgs, function(i, svg) {
				svgReturn += '<div class="svg-wrapper" data-svg="'+ svg +'">\
				<svg class="svg-icon">\
				<use xlink:href="#'+ svg +'" />\
				</svg>\
				</div>';
			});
		}		
		return svgReturn;
	}

	/* Filling the svgs array with random keys */
	function fillSvgsArray( ) {
		svgs = [];
		$(".grid > svg").find('symbol[id]').each(function(index, svg) {
				svgs.push( svg.getAttribute('id') )
				svgs.shuffle();
		});		
		/* Slicing the svgs array in order to have necessery amount of cards */
		return svgs.slice(0, gridCards / 2);
	}

	$(".grid").on('click', '.svg-wrapper', function() {
		if ( !started ) {
			alert('Start the game first!');
			return;
		}
		var SVG = $(this);
		/* do nothing when clicked on on of the paired card */
		if ( SVG.hasClass('matched') ) return;

		var svgID = SVG.data('svg');
		var svgFlipped = $(".svg-wrapper.flipped");
		/*important to exclude itself, because it may contain class flipped already but not matched.*/
		var svgMatched = svgFlipped.filter(function(){
			return $(this).data('svg') == svgID;
		});
		if ( svgMatched.length ) {
			SVG.add(svgMatched).addClass('matched').delay(600).queue(function(){
				$(this).css('visibility', 'hidden').dequeue();
			});
			// svgMatched.remove();
			$(".svg-wrapper").not( svgMatched ).removeClass('flipped');
			matches++;
		} else {
			// $(".svg-wrapper").removeClass('flipped');
			if ( svgFlipped.length ) {
				$(".svg-wrapper").delay(500).queue(function(next){
					$(this).stop().removeClass("flipped");
					next();
				});
			}
			
		}
		$(this).addClass('flipped');
		moves++;
		/* Game was successfully finished! */
		if ( matches == gridCards / 2 ) {
			finished = true;
			clearInterval(timer);
			setTimeout(function() {
				$('.button#start-game').text('Start New Game').attr('onclick', 'startNewGame(event)');
				var congrats = '<p>Congratulations! You have successfully finsihed the game in <strong>' + mins + " : " + secs  + '</strong> seconds! You have made <strong>' + moves + '</strong> moves to finish the game</p>';
				$('#result').css('visibility', 'visible').html(congrats);
				scrollToTarget($('#result'), 0, -50);
			}, 1000)
			
		} 
	});


	$("a[href^='#']")
	.not('[href="#"]')
	.not('[href="#0"]')
	.on('click', function ( event ) {
		event.preventDefault();
		var $scrollTarget = $( $(this).attr('href') );
		$scrollTarget = $scrollTarget.length ? $scrollTarget : $('[name=' + $(this).attr('href').slice(1) + ']');
		/* If not found stop execution */
		if ( !$scrollTarget.length ) return;
		scrollToTarget($scrollTarget, 0, -20);
	});
	if ( location.hash.length && $(location.hash).length ) {
		scrollToTarget( $(location.hash), 1000, -20 );
	}
	function scrollToTarget(scrollTarget, delay, offset) {
		$('html,body').not(":animated").delay(delay).animate({
			scrollTop: scrollTarget.offset().top + offset
		}, 400);
	}


})(jQuery);