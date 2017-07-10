function getPage(url) {
	$('#page').attr('src', url);
}

function addLine(type) {
	let lastLinePos = 0,
		direction = type === 'vertLine' ? 'left' : 'top';

	if ($('.' + type).length > 0)
		lastLinePos = +$('.' + type).last().css(direction).slice(0, -2);
	$('#frameContainer').append('<div class="' + type + '"><span class="lineHandle ' + type + '-handle"></span></div>');
	$('.' + type).last().css(direction, function(i) {
		return i + lastLinePos + 20;
	}).draggable({
  		cursor: "crosshair",
  		containment: "parent",
  		opacity: 0.20,
  		scroll: true,
  		zIndex: 10100
	});
}

function changeColor(color) {
	if (color === 'black' || color === 'white')
		$('.vertLine, .horizLine').css('border-color', color);
	else
		$('.lineHandle').css('background-color', color);
}

function listen() {
	$('#submitUrl').click(function(event) {
		event.preventDefault();
		getPage($('#url').val());
	});

	$('#vertLine, #horizLine').click(function(event) {
		event.preventDefault();
		addLine(event.target.id);
	});

	$('#remove').click(function(event) {
		event.preventDefault();
		$('.horizLine, .vertLine').remove();
	})

	$('.changeColor').click(function(event) {
		event.preventDefault();
		changeColor(event.target.id);
	});

	$('form').draggable({
  		cursor: "crosshair",
  		opacity: 0.20,
  		scroll: true,
  		cancel: '#titlebar, #url'
	});

	$('#titlebar').click(function() {
		$('#content').toggle();
		$('#menu-icon').toggleClass('ui-icon-circle-triangle-n ui-icon-circle-triangle-s');
	});
}

listen();
