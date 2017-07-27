let lastLineId = 0;

function getPage(url) {
	$('#page').attr('src', url);
}

function addLine(type) {
	let lineType = type,
		measureLineNum = '',
		measureLineId = '',
		measureLineTwin = '',
		measureLineTwinId = '',
		distanceLineId = '',
		distanceLineDir = '',
		lastLinePos = 0,
		direction = '';

	if (type !== 'horiz-line' && type !== 'vert-line') {
		if (type.slice(0, -1) === 'horiz-measure-line') {
			lineType = 'horiz-line';
			distanceLineDir = 'vert-line';
		} else {
			lineType = 'vert-line';
			distanceLineDir = 'horiz-line';
		}
		measureLineNum = type;
		distanceLineId = 'distance-line-' + lastLineId;
		measureLineId = type + '-' + lastLineId;
		if (measureLineNum.slice(-1) === '2') {
			measureLineTwin = type.replace('2', '1');
			measureLineTwinId = measureLineTwin + '-' + lastLineId;
			lastLineId += 1;
			$('#' + type).attr('disabled', true);
			$('#' + measureLineTwin).attr('disabled', false);
		} else {
			measureLineTwin = type.replace('1', '2');
			measureLineTwinId = measureLineTwin + '-' + lastLineId;
			$('#' + type).attr('disabled', true);
			$('#' + measureLineTwin).attr('disabled', false);
		}
	}
	direction = lineType === 'vert-line' ? 'left' : 'top';
	if ($('.' + lineType).length > 0)
		lastLinePos = +$('.' + lineType).last().css(direction).slice(0, -2);

	$('#frame-container').append('<div id="' + measureLineId + '" class="' + lineType + ' ' + measureLineNum + '"><span class="line-handle ' + lineType + '-handle"></span></div>');
	$('.' + lineType).last().css(direction, function(i) {
		return i + lastLinePos + 20;
	}).draggable({
  		cursor: "crosshair",
  		containment: "parent",
  		opacity: 0.20,
  		scroll: true,
  		zIndex: 10100,
  		drag: function(event, ui) {
  			if (ui.helper.hasClass('horiz-measure-line1') ||
  				ui.helper.hasClass('horiz-measure-line2') ||
  				ui.helper.hasClass('vert-measure-line1') ||
  				ui.helper.hasClass('vert-measure-line2')
  			) {
  				redrawDistanceLine(measureLineId, measureLineTwinId, distanceLineId);
  			}
  		}
	});

	// if drawing the second measuring line, draw the distance line between the two measuring lines
	if (measureLineNum.slice(-1) === '2') {
		$('#frame-container').append('<div id="' + distanceLineId + '" class="distance-line ' + distanceLineDir + ' ' + lineType + 's-distance"><span class="value ' + lineType + 's-distance-value">20</span></div>');
		redrawDistanceLine(measureLineId, measureLineTwinId, distanceLineId);
	}
}

function redrawDistanceLine(firstLine, secondLine, distanceLine) {
	let distance = 0,
		firstLinePosition = 0,
		secondLinePosition = 0,
		higherPosition = 0;

	if (firstLine.slice(0, -3) === 'horiz-measure-line') {
		firstLinePosition = $('#' + firstLine).position().top;
		secondLinePosition = $('#' + secondLine).position().top;
		higherPosition = firstLinePosition < secondLinePosition ? firstLinePosition : secondLinePosition;
		distance = Math.abs(firstLinePosition - secondLinePosition);
		$('#' + distanceLine).css('height', distance).css('top', higherPosition).children().text(distance);
	}
	else {
		firstLinePosition = $('#' + firstLine).position().left;
		secondLinePosition = $('#' + secondLine).position().left;
		higherPosition = firstLinePosition < secondLinePosition ? firstLinePosition : secondLinePosition;
		distance = Math.abs(firstLinePosition - secondLinePosition);
		$('#' + distanceLine).css('width', distance).css('left', higherPosition).children().text(distance);
	}
}

function changeColor(color) {
	if (color === 'black' || color === 'white') {
		$('.vert-line, .horiz-line').not('.distance-line').css('border-color', color);
		$('.value').css('color', color);
	}
	else
		$('.line-handle').css('background-color', color);
}

function listen() {
	$('#browse-files').change(function(event) {
		event.preventDefault();
		let file = document.querySelector('#browse-files[type=file]').files[0],
			reader = new FileReader();

		reader.addEventListener("load", function () {
			getPage(reader.result);
		}, false);
		if (file) {
			reader.readAsDataURL(file);
		}
	});

	$('#submit-url').click(function(event) {
		event.preventDefault();
		if ($('#browse-files'))
		getPage($('#url').val());
	});

	$('.line-button').click(function(event) {
		event.preventDefault();
		addLine(event.target.id);
	});

	$('#remove').click(function(event) {
		event.preventDefault();
		$('.horiz-line, .vert-line').remove();
	})

	$('.change-color').click(function(event) {
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
