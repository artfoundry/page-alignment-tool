let lastLineId = 0,
	lastHandleId = 0;

function getPage(url, type) {
	let el = $('#' + type);

	$(el).attr('src', url);
}

function addLine(type) {
	let lineType = type,
		alignLineNum = '',
		alignLineId = '',
		alignLineTwin = '',
		alignLineTwinId = '',
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
		alignLineNum = type;
		distanceLineId = 'distance-line-' + lastLineId;
		alignLineId = type + '-' + lastLineId;
		if (alignLineNum.slice(-1) === '2') {
			alignLineTwin = type.replace('2', '1');
			alignLineTwinId = alignLineTwin + '-' + lastLineId;
			lastLineId += 1;
			$('#' + type).attr('disabled', true);
			$('#' + alignLineTwin).attr('disabled', false);
		} else {
			alignLineTwin = type.replace('1', '2');
			alignLineTwinId = alignLineTwin + '-' + lastLineId;
			$('#' + type).attr('disabled', true);
			$('#' + alignLineTwin).attr('disabled', false);
		}
	}
	direction = lineType === 'vert-line' ? 'left' : 'top';
	if ($('.' + lineType).length > 0)
		lastLinePos = +$('.' + lineType).last().css(direction).slice(0, -2);

	$('#frame-container').append('<div id="' + alignLineId + '" class="' + lineType + ' ' + alignLineNum + '"><span id="' + lineType + lastHandleId + '-handle" class="line-handle ' + lineType + '-handle"></span></div>');
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
  				redrawDistanceLine(alignLineId, alignLineTwinId, distanceLineId);
  			}
  		}
	});
	$('#' + lineType + lastHandleId + '-handle').draggable({
		axis: lineType === 'vert-line' ? 'y' : 'x',
		disabled: true,
		drag: function(event, ui) {
			let handleParent = ui.helper.parent();
			if (handleParent.hasClass('horiz-measure-line1') ||
  				handleParent.hasClass('horiz-measure-line2') ||
  				handleParent.hasClass('vert-measure-line1') ||
  				handleParent.hasClass('vert-measure-line2')
			) {
				moveDistanceTool(ui.helper, alignLineId, alignLineTwinId, distanceLineId);
			}
		}
	});
	lastHandleId += 1;

	// if drawing the second measuring line, draw the distance line between the two measuring lines
	if (alignLineNum.slice(-1) === '2') {
		$('#frame-container').append('<div id="' + distanceLineId + '" class="distance-line ' + distanceLineDir + ' ' + lineType + 's-distance"><span class="value ' + lineType + 's-distance-value">20</span></div>');
		redrawDistanceLine(alignLineId, alignLineTwinId, distanceLineId);
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

function moveDistanceTool($draggedHandle, firstLine, secondLine, distanceLine) {
	let draggedHandlePos = 0,
		$secondLineHandle = $draggedHandle.parent().attr('id') === firstLine ? $('#' + secondLine).children('.line-handle') : $('#' + firstLine).children('.line-handle'),
		$distanceLine = $('#' + distanceLine);

	draggedHandlePos = $draggedHandle.position();
	firstLine.slice(0, -3) === 'horiz-measure-line' ? draggedHandlePos.left += 25 : draggedHandlePos.top += 25;
	$secondLineHandle.css({'left' : '+' + draggedHandlePos.left + 'px', 'top' : '+' + draggedHandlePos.top + 'px'});
	$distanceLine.css({'left' : '+' + draggedHandlePos.left + 'px', 'top' : '+' + draggedHandlePos.top + 'px'});

	redrawDistanceLine(firstLine, secondLine, distanceLine);
}

function changeColor(color) {
	if (color === 'black' || color === 'white') {
		$('.vert-line, .horiz-line').not('.distance-line').css('border-color', color);
		$('.value').css('color', color);
	}
	else
		$('.line-handle').css('background-color', color);
}

function switchDragTarget(targetType) {
	let nonTargetType = '',
		target = ''
		nonTarget = '';

	if (targetType === 'drag-line-select') {
		nonTargetType = 'drag-handle-select';
		target = '.vert-line .horiz-line';
		nonTarget = '.line-handle';
	} else {
		nonTargetType = 'drag-line-select';
		target = '.line-handle';
		nonTarget = '.vert-line .horiz-line';
	}

	$(target).draggable('enable');
	$(nonTarget).draggable('disable');

	$('#' + targetType).addClass('active');
	$('#' + nonTargetType).removeClass('active');
}

function listen() {
	let sliderValue = 0,
		$overlaySlider = $('#overlay-slider'),
		file;

	$('#browse-files').change(function(event) {
		event.preventDefault();
		let reader = new FileReader(),
			overlay = false;

		file = document.querySelector('#browse-files[type=file]').files[0];
		reader.addEventListener("load", function () {
			getPage(reader.result, 'file');
		}, false);
		if (file) {
			reader.readAsDataURL(file);
		}
	});

	$('#delete-file').click(function(event) {
		event.preventDefault();
		getPage('', 'file');
	});

	$overlaySlider.slider({
		value: 100,
		slide: function() {
			if (file) {
				sliderValue = $overlaySlider.slider('value');
				$('#file').css('opacity', sliderValue * .01);
			}
		}
	});

	$('#submit-url').click(function(event) {
		event.preventDefault();
		getPage($('#url').val(), 'page');
	});

	$('.line-button').click(function(event) {
		event.preventDefault();
		switchDragTarget('drag-line-select');
		addLine(event.currentTarget.id);
	});

	$('#drag-line-select, #drag-handle-select').click(function(event) {
		event.preventDefault();
		switchDragTarget(event.currentTarget.id);
	});

	$('#remove').click(function(event) {
		event.preventDefault();
		$('.horiz-line, .vert-line').remove();
	})

	$('.change-color').click(function(event) {
		event.preventDefault();
		changeColor(event.currentTarget.id);
	});

	$('form, #file-container').draggable({
  		cursor: "crosshair",
  		opacity: 0.20,
  		scroll: true,
  		cancel: '.titlebar, #url'
	});

	$('#titlebar-tools, #titlebar-file').click(function() {
		$(this).siblings('.content').toggle();
		$(this).children('.menu-icon').toggleClass('ui-icon-circle-triangle-n ui-icon-circle-triangle-s');
	});
}

listen();
