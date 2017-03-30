/**
 * A jQuery plugin for creating interactive year based timelines.
 * Author: Sylvain Simao - https://github.com/maoosi
 */

;(function ( $, window, document, undefined ) {

    "use strict";

	/**
	 * Plugin object constructor.
	 */
	function Plugin(element, options) {

		// References to DOM and jQuery versions of element.
		var el = element;
		var $el = $(element);
		var children = $el.children();

		// Extend default options with those supplied by user.
		options = $.extend({}, $.fn['timeliny'].defaults, options);

		/**
		 * Initialize plugin.
		 * @private
		 */
		function _init() {
			hook('onInit');

			_reorderElems();
			if (options.hideBlankYears === false) {
                _addGhostElems();
            }
            _granularity();
			_createWrapper();
			// _createDots();
			_fixBlockSizes();
			_clickBehavior();
			_createVerticalLine();
			_updateTimelinePos();
			_resizeBehavior();
			_dragableTimeline();
			_loaded();
		}

		/**
		 * Reorder child elements according order option (uses data-year))
		 * @private
		 */
		function _reorderElems() {
			children.detach().sort(function(a, b) {
				return 	options.order === 'asc' ?
						$(a).data('year') - $(b).data('year') :
						$(b).data('year') - $(a).data('year');
			});

			$el.append(children);
		}

		/**
		 * Plugin is loaded
		 * @private
		 */
		function _loaded() {
			$el.addClass('loaded');

            var timeline  = $('.timeliny-timeline');
            $(timeline).addClass('year-view');

			$('.originalFrame').removeClass('originalFrame').addClass('visibleEvent');


			var currYear = $el.find('.' + options.className + '-timeblock.active').first().attr('data-year');
			hook('afterLoad', [currYear]);
            _updateTimelinePos();

		}

		/**
		 * Add ghost disabled elements for missing years/months
		 * @private
		 */
		function _addGhostElems() {
            var yearsBtn = 		$('.granularity-years');
            var monthsBtn = 	$('.granularity-months');
            var weeksBtn = 		$('.granularity-weeks');
            var timeline  = 	$('.timeliny-timeline');
            var timeblock  =	$('.timeliny-timeblock');
            var dot  = 			$('.timeliny-dot');
            var visibleEvent = 	$('.active');
            var extraEvents =   $('.timeliny-timeblock.extra_events');
            var initialEvent =  $('.timeliny-timeblock.initial_events');
            // var dataYear  = 	$(activeFrame).attr('data-year');
            // var data_month = 	$(activeFrame).attr('data-month');

            //
			var activeFrame;
            var index;
            var frameType;
			var firstFrame;
            var lastFrame;
            var thisFrame;
            var prevFrame;
            var nextFrame;
            var ghostFrame;
            var dataYear;
            var dataMonth;
            var visibleEvents;


            //YEARS GHOST FRAMES (if yearsView = true)
            // if(yearsView === true){


            if(yearsView === true){
                var firstYear = 	parseInt(children.first().attr('data-year'));
                var lastYear = 		parseInt(children.last().attr('data-year'));

                //disable the years button
                $(yearsBtn).attr("disabled", true);

                firstFrame = firstYear - options.boundaries;
                lastFrame =  lastYear + options.boundaries;
                index = 0;
                var eventsLog = [];
                visibleEvents = $('.visibleEvent');
                index = 0;

                $(visibleEvents).each(function(){

                	//Don't add repeating event years to Years Timeline.
                    if( index === 0){
                        eventsLog.push($(this).attr('data-year'));
                        index++;
                    }
                    if( $(this).attr('data-year') !== eventsLog[index - 1]){
                        eventsLog.push($(this).attr('data-year'));
                        index++;
                    }
                });

                console.debug('eventsLog for Years', eventsLog);

            }

            if(monthsView === true){
                var firstMonth = 	1;
                var lastMonth = 	12;
                index = 0;

                //disable the years button
                $(monthsBtn).attr("disabled", true);

                console.debug('month frames initialized');


                var active = $('.timeliny-timeblock.active');
                dataYear = $(active).attr('data-year');


                var monthEvents = $(timeblock).find('[data-year=' + dataYear + ']');

                eventsLog = [];

                eventsLog.length = 0;
                console.log('clear log', eventsLog);

                $(monthEvents).each(function(){

                    //Don't add repeating event months to Months Timeline.
                    if( $(this).attr('data-year') !== eventsLog[index - 1]){
                        eventsLog.push($(this).attr('data-month'));
                        index++;
                    }
                });

                console.debug('eventsLog for Months', eventsLog);

                firstFrame = firstMonth;
                lastFrame = lastMonth;


            }
            if(weeksView === true){
                var firstWeek = 1;
                var lastWeek =  4;
                index = 0;

                console.debug('Adding weeksView ghost frames');

                //disable the years button
                $(weeksBtn).attr("disabled", true);

                active = $('.timeliny-timeblock.active');
                dataYear = $(active).attr('data-year');
                dataMonth = $(active).attr('data-month');

                firstFrame = firstWeek;
                lastFrame = lastWeek;




                var weekEvents = $(timeline).find('[data-year= '+ dataYear +'][data-month=' + dataMonth + ']').not(dot);

                eventsLog = [];

                eventsLog.length = 0;
                console.log('clear log', eventsLog, weekEvents);

                $(weekEvents).each(function(){
                    console.log('setting up log', weekEvents);

                    //Don't add repeating event weeks to Weeks Timeline.
                    if( $(this).attr('data-month') !== eventsLog[index - 1]){
                        console.log('add to list');

                        eventsLog.push($(this).attr('data-week'));
                        index++;
                    }
                });

                console.debug('eventsLog for Weeks', eventsLog);

                prevFrame = children.parent().parent().find('[data-week='+ (y - 1) +']').not(dot);
                thisFrame = children.parent().parent().find('[data-week='+ y +']').not(dot);
                dataYear = $(thisFrame).attr('data-year');
                dataMonth = $(thisFrame).attr('data-month');
                ghostFrame = '<div data-year="' + dataYear + '" data-month="' + dataMonth + '" data-week="' + y + '" class="inactive"></div>';

            }

                if (options.order === 'asc') {
                    console.debug('ascending list---', 'years:', yearsView, 'months:', monthsView, 'weeks:', weeksView, firstFrame, lastFrame);

                    // Variable y is firstYear (2008), continue up through years if y is less than lastYear (2019)
                    for (var y = firstFrame; y < lastFrame + 1; y++) {
                        console.debug('INSIDE LOOP');


                        if(yearsView === true){
                            console.log('Adding yearsView ghost frames');

                            frameType = 'timeliny-year';
                            firstFrame = firstYear - options.boundaries;
                            lastFrame =  lastYear + options.boundaries;
                            activeFrame  = 	$('.timeliny-timeblock.active');
                            dataYear = $(activeFrame).attr('data-year');

                            prevFrame = children.parent().parent().find('[data-year='+ (y - 1) +']').not(dot);
                            nextFrame = children.parent().parent().find('[data-year='+ (y + 1) +']').not(dot);
                            thisFrame = children.parent().parent().find('[data-year='+ y +']').not(dot);

                            ghostFrame = '<div data-year="' + y + '" class="inactive">'+y+' ghost frame</div>';

                            children = $el.children();
                        }

                        if(monthsView === true){
                            console.log('Adding monthsView ghost frames');

                            frameType = 'timeliny-month';
                            firstFrame = firstMonth;
                            lastFrame = lastMonth;
                            activeFrame  = 	$('.timeliny-timeblock.active');
                            dataYear = $(activeFrame).attr('data-year');

                            prevFrame = children.parent().parent().find('[data-year='+ dataYear +'][data-month='+ (y - 1) +']').not(dot);
                            thisFrame = children.parent().parent().find('[data-year='+ dataYear +'][data-month='+ y +']').not(dot);
                            ghostFrame = '<div data-year="' + dataYear + '" data-month="' + y + '" class="inactive ">'+y+' ghost frame</div>';
                        }

                        if(weeksView === true){
                            console.debug('Adding weeksView ghost frames');

                            frameType = 'timeliny-week';
                            firstFrame = firstWeek;
                            lastFrame = lastWeek;

                            prevFrame = children.parent().parent().find('[data-year='+ dataYear +'][data-month='+ dataMonth +'][data-week='+ (y - 1) +']').not(dot);
                            thisFrame = children.parent().parent().find('[data-year='+ dataYear +'][data-month='+ dataMonth +'][data-week='+ y +']').not(dot);
                            dataYear = $(thisFrame).attr('data-year');
                            dataMonth = $(thisFrame).attr('data-month');
                            ghostFrame = '<div data-year="' + dataYear + '" data-month="' + dataMonth + '" data-week="' + y + '" class="inactive">'+y+' ghost frame</div>';

                        }

                        console.log('marker', y);


                        //if the event doesn't exist...
                        if ( $(thisFrame).length <= 0 ) {
                            console.log('not detecting event...', 'thisFrame', $(thisFrame), 'prev', prevFrame);

                            // if event is greater that firstFrame, place ghost item after event
                            if (y > firstFrame) {
                                console.log('if event is greater that firstFrame, place ghost item after event', y, dataYear);
                               $(prevFrame).last().after(ghostFrame);

                                //if event is less than firstFrame, place ghost frame as first item
                            } else {
                                console.log('if event is less than firstFrame, place ghost frame as first item', y, dataYear);
                                //add class to ghost events

                                children.first().before(ghostFrame).addClass('firstFrame ' + frameType );
                            }

                        }
                        else{
                            console.debug('event exists...', 'thisFrame', $(thisFrame), 'prev', prevFrame);

                            //If y is less than event then place before
                            if (y < eventsLog[index]) {
                                console.debug('LESS than data-month then place before', y, '<', eventsLog[index]);

                                //If previous Ghost frame exists, print another right after
                                if($(prevFrame).length ){
                                    $(prevFrame).after(ghostFrame).addClass(frameType);
                                }

                                //If previous Ghost frame
                                else{
                                    $(activeFrame).first().before(ghostFrame).addClass(frameType);

                                }

                            }

                            //If y is equal to event, don't print ghost frame
                            if (y == eventsLog[index]) {
                                console.debug('Equal to data-month, no frame', y, '===', eventsLog[index], index);
                                //Change link to event attribute instead of data-year

                                var currentFrame = document.querySelectorAll('[data-month="'+ y +'"]');
                                var currentEvent = $(timeline).find('[data-month='+ (y) +'][data-year='+ dataYear +']').not(dot);


                                $(currentFrame).find('.timeliny-dot').attr('href', eventsLog[index]);

                                if( !$(currentEvent).hasClass('only_event') ){
                                    index++;
                                    console.debug('add to i', index, eventsLog[index], $(currentEvent));
                                }
                                else{
                                    console.debug('has only_event');
                                }
                                console.debug('currentEvent', currentEvent);

                            }

                            //If counter is greater than event, print frame after
                            if (y > eventsLog[index]) {
                                console.debug('GREATER, dont print ghost frame', y, '>', eventsLog[index]);
                                $(prevFrame).after(' <div data-year="' + dataYear + '" data-month="' + y + '" class="inactive timeliny-timeblock timeliny-month afterFrame"> '+y+' larger ghost month</div>');
                            }


                            if( $(thisFrame).length >= 2){
                                $(thisFrame).first().addClass("initial_events");
                                $(thisFrame).not(":first").addClass("extra_events");
							}
                            if( $(thisFrame).length === 1){
                                $(thisFrame).first().addClass("only_event").removeClass("initial_events");
							}
						}

                    }
                    //If timeline is in descending order...
                } else {

                    // Variable y is firstYear (2008), continue down through years if y is less than lastYear (2019)
                    for (var y = firstFrame; y >= lastFrame; y--) {

                        //if the event doesn't exist...
                        if ( $(thisFrame).length <= 0 ) {

                            // if event is less than firstFrame, place ghost item after
                            if (y < firstYear) {
                                $(nextFrame).after(ghostFrame);
                            }
                            //if event is greater than firstFrame, place ghost frame as first item
                            else {
                                children.first().before(ghostFrame);
                            }
                        }
                    }
                }

                console.debug($('.extra_events'));


                //Remove Month Classes and reset active class
                $(extraEvents).each(function(){

                    $(this).removeClass('timeliny-month lastMonth firstMonth');

                    console.debug('each timeblock', $(this));

                    if( $(this).hasClass('extra_events') && $(this).hasClass('active')){
                        console.debug('transfer active class to initial event');
                        $(this).removeClass('active');
                        $(this).find(dot).removeClass('clicked');

                        $(thisFrame).first().not(dot).addClass('active');

                        console.debug(dataYear, initialEvent);

                    }

                    console.debug('after each ', $(this),  $(timeline).find('[data-year='+ dataYear +']').not(dot) );
				});


                console.log('children', children);

                _createDots();


		}

        /**
         * Set Granularity
         * @private
         */

        var yearsView = true;
        var monthsView = false;
        var weeksView = false;

        function _granularity(  ) {
            console.debug('_granularity ENTER');


            var yearsBtn = $('.granularity-years');
            var monthsBtn = $('.granularity-months');
            var weeksBtn = $('.granularity-weeks');

            $(yearsBtn).click( function(){
                	var timeline = $('.timeliny-timeline');
                    var timeblock = $('.timeliny-timeblock');
                    var dot = $('.timeliny-dot');
               		var activeYear = $('.timeliny-timeblock.active').attr('data-year');
               		var month = $('.timeliny-month');

              		console.debug('years button clicked ~!~!~!~!~!~!~!~!~!~!~!~');

                    monthsView = false;
                	weeksView = false;
                    yearsView = true;

					$(timeline).addClass('year-view');
           		    $(timeline).removeClass('weeks-view month-view');
                    $(timeblock).removeClass('visibleEvent');
                    $(dot).removeClass('clicked');

					//disable the other buttons
					$(monthsBtn).attr("disabled", false);
               		$(weeksBtn).attr("disabled", false);

					//Hide all months
					$(month).remove();
             	    console.log('remove ghost months from view');

					$( timeblock ).each(function(  ) {

						//Hide all inactive years
						if( $(this).attr('data-year') !== activeYear){
							$(this).show();
						}

					});


                    _addGhostElems();
                    _updateTimelinePos();

                });

            $(monthsBtn).click(function(){
				var timeline = $('.timeliny-timeline');
				var timeblock = $('.timeliny-timeblock');
				var activeYear = $('.timeliny-timeblock.active').attr('data-year');
                var dot = $('.timeliny-dot');

				yearsView = false;
                weeksView = false;
				monthsView = true;


                console.debug('months button clicked ~!~!~!~!~!~!~!~!~!~!~!~');

                //disable the other buttons
				$(yearsBtn).attr("disabled", false);
                $(weeksBtn).attr("disabled", false);

                $(timeline).removeClass('year-view weeks-view');
                $(timeline).addClass('month-view');
                $(timeblock).removeClass('visibleEvent');

                $(dot).remove();

				$( timeblock ).each(function(  ) {

						//Hide all inactive years
						if( $(this).attr('data-year') !== activeYear){
							$(this).hide();
						}
						else{
							//Add class to current events
							$(this).addClass('visibleEvent');
						}

				});


                _addGhostElems();

                _updateTimelinePos();


                });

            $(weeksBtn).click(function(){
                var timeline = $('.timeliny-timeline');
                var timeblock = $('.timeliny-timeblock');
                var active =  $('.timeliny-timeblock.active');
                var activeYear = $(active).attr('data-year');
                var activeMonth = $(active).attr('data-month');
                var weekEvents = $(timeline).find('[data-month= '+ activeMonth +']');

                console.log('weeks btn clicked ~!~!~!~!~!~!~!~!~!~!~!~');

                yearsView = false;
                monthsView = false;
                weeksView = true;

                //disable the other buttons
                $(yearsBtn).attr("disabled", false);
                $(monthsBtn).attr("disabled", false);
                $(weeksBtn).attr("disabled", true);

                $(timeline).removeClass('year-view month-view');
                $(timeline).addClass('weeks-view');

                //Reinitializing visibleEvents
                $(timeblock).removeClass('visibleEvent');
                $(weekEvents).addClass('visibleEvent');

                console.log('activeMonth', activeMonth);

                $( timeblock ).each(function(  ) {

                    //Hide all inactive years
                    if( $(this).attr('data-month') !== activeMonth){
                        $(this).hide();
                    }
                    else{
                        //Add class to current events
                        $(this).addClass('visibleEvent');
                    }

                });


                _addGhostElems();
                _updateTimelinePos();
            });

        }


        /**
		 * Create wrapper
		 * @private
		 */
		function _createWrapper() {
			return $el.addClass(options.className).children().wrapAll( options.wrapper).wrapAll( '<div class="' + options.className + '-timeline"></div>' );
		}

		/**
		 * Fix sizes of timeline and timeblocks elements
		 * @private
		 */
		function _fixBlockSizes() {
			var timeBlockSize = $el.css('padding-top').replace('px', '') * 0.8;
			$el.find('.' + options.className + '-timeline').css('width', ''+ (children.length * timeBlockSize) +'px');
			$el.find('.' + options.className + '-timeliny-timeblock').css('width', '' + timeBlockSize + 'px');
		}

		/**
		 * Create html structure
		 * @private
		 */
		function _createDots() {
		    console.debug('INSIDE CREATE DOTS', children );

		    var href;

		    if( yearsView === true ){
                children = $el.children();
                console.log('years are true, and so are children');
                href = 'data-year';
            }

            if( monthsView === true ){
                children = $('.timeliny-timeline').children();
                console.debug('years are true, and so are children');
                href = 'data-month';
            }


			children.each(function(  ) {
				var text = $(this).html();
				var year = $(this).attr('data-year');
                var month = $(this).attr('data-month');
                var week = $(this).attr('data-month');

                var current = year + month;

				var dotHtml = '<a href="'+ current +'" class="' + options.className + '-dot" data-year="' + year + '" data-month="' + month + '" data-week="' + week + '" data-text="' + text + '"></a>';

				$(this).addClass('' + options.className + '-timeblock').html(dotHtml);

				console.debug('CREATE DOTS');
			});
		}

		/**
		 * Create vertical line
		 * @private
		 */
		function _createVerticalLine() {
			$el.append('<div class="' + options.className + '-vertical-line"></div>');
		}

		/**
		 * Update the position of the timeline
		 * @private
		 */
		function _updateTimelinePos(callEvent) {
			var linePos = $el.find('.' + options.className + '-vertical-line').position().left;
			var activeDotPos = $el.find('.' + options.className + '-timeblock.active').position().left;
			var dotRadius = $el.find('.' + options.className + '-timeblock.active .' + options.className + '-dot').width() / 2;

			var diff = activeDotPos - linePos;
			var left;

			if (diff > 0) {
				left = '-' + (Math.abs(diff) + dotRadius + 1) +'';
			} else {
				left = '+' + (Math.abs(diff) - dotRadius - 1) +'';
			}

			$el.find('.' + options.className + '-timeline').animate({
				left: left
			}, options.animationSpeed, function() {
				if (typeof callEvent != 'undefined') {
					if (callEvent === 'click') {

						var currYear = $el.find('.' + options.className + '-timeblock.active').first().attr('data-year');
                        var currMonth = $el.find('.' + options.className + '-timeblock.active').first().attr('data-month');
                        var current = currYear + currMonth;

                        console.debug('CLICKEDDDDDDDDD', 'years', yearsView, 'months', monthsView, 'current',current);

                        hook('afterChange', [current]);
					}
					else if (callEvent === 'resize') hook('afterResize');
				}
			});
		}

		/**
		 * Listen for click event
		 * @private
		 */

        $('.timeliny-dot').on('click', function(e) {

            e.preventDefault();


            var activeYears = $(this).parent().parent().find('.' + options.className + '-timeblock.active');
            var currYear = $(this).parent().parent().find('.' + options.className + '-timeblock.active').attr('data-year');
            var currMonth = $(this).parent().parent().find('.' + options.className + '-timeblock.active').attr('data-month');
            var current = currYear + currMonth;
            var nextYear = $(this).attr('data-year');
            var nextMonth = $(this).attr('data-month');
            var next = nextYear + nextMonth;

            $(this).toggleClass('clicked');


            if ( current != next) {
                hook('onLeave', [currYear, nextYear]);

                $(activeYears).removeClass('active');
                $(this).closest('.' + options.className + '-timeblock').addClass('active');
            }


            _updateTimelinePos('click');

            return false;
        });

		function _clickBehavior() {

			// children.parent().find('.' + options.className + '-timeblock:not(.inactive) .' + options.className + '-dot').on('click', function(e) {
            $('.timeliny-dot').click(function(e) {

                e.preventDefault();

                var activeParent = $(this).parent();
                var activeYears = $(this).parent().parent().find('.' + options.className + '-timeblock.active');
				var currYear = $(this).parent().parent().find('.' + options.className + '-timeblock.active').attr('data-year');
                var currMonth = $(this).parent().parent().find('.' + options.className + '-timeblock.active').attr('data-month');
                var current = currYear + currMonth;
                var nextYear = $(this).attr('data-year');
                var nextMonth = $(this).attr('data-month');
                var next = nextYear + nextMonth;

                $(this).toggleClass('clicked');


				if ( current != next ) {
					hook('onLeave', [currYear, nextYear]);

                    $(activeYears).removeClass('active');
					$(this).closest('.' + options.className + '-timeblock').addClass('active');
				}

				_updateTimelinePos('click');

				return false;
			});
		}

		/**
		 * Listen resize event
		 * @private
		 */
		function _resizeBehavior() {

			function debounce(callback, delay) {
				var timer;
				return function(){
					var args = arguments;
					var context = this;
					clearTimeout(timer);
					timer = setTimeout(function(){
						callback.apply(context, args);
					}, delay)
				}
			}

			$(window).on('resize.timeliny', debounce(function() {
				_updateTimelinePos('resize');
			}, 350));
		}

		/**
		 * Make the timeline draggable
		 * @private
		 */
		function _dragableTimeline() {

			var selected = null, x_pos = 0, x_elem = 0;

			// Will be called when user starts dragging an element
			function _drag_init(elem) {
				selected = elem;
				x_elem = x_pos - selected.offsetLeft;
			}

			// Will be called when user dragging an element
			function _move_elem(e) {
				x_pos = document.all ? window.event.clientX : e.pageX;
				if (selected !== null) {
					selected.style.left = (x_pos - x_elem) + 'px';
				}
			}

			// Destroy the object when we are done
			function _stop_move() {
				if (selected) {
					// active the closest elem
					var linePos = $el.find('.' + options.className + '-vertical-line').offset().left;
					var closestDotYear = null;
					var diff = 99999999999999999999999;

				//Was Causing years with multiple events to be triggered unnecessarily
					// children.parent().find('.' + options.className + '-timeblock:not(.inactive) .' + options.className + '-dot').each(function (index) {
					// 	var currDotPos = $(this).offset().left;
					// 	var currDiff = Math.abs(currDotPos - linePos);
                    //
					// 	if (currDiff < diff) {
					// 		closestDotYear = $(this).attr('data-year');
                     //        console.log('ClosestDotYear', closestDotYear);
					// 		diff = currDiff;
					// 	}
					// });

					$el.find('.' + options.className + '-dot[data-year=' + closestDotYear + ']').trigger('click');
					selected = null;
				}
			}

			// Bind the functions...
			$el.first().on('mousedown', function() {
				_drag_init($el.find('.'+ options.className +'-timeline')[0]);
				return false;
			});

			$(document).on('mousemove.timeliny', function(e) {
				_move_elem(e);
			});

			$(document).on('mouseup.timeliny', function() {
				_stop_move();
			});
		}

		/**
		 * Go to a particular year
		 * @public
		 */
		function goToYear(year) {
			var selector = $el.find('.' + options.className + '-timeblock[data-year=' + year + ']:not(.inactive) .' + options.className + '-dot').first();
			if (selector.length > 0) {
				selector.trigger('click');
			}
		}

		/**
		 * Get/set options.
		 * Get usage: $('#el').timeliny('option', 'key');
		 * Set usage: $('#el').timeliny('option', 'key', value);
		 */
		function option (key, val) {
			if (val) {
				options[key] = val;
			} else {
				return options[key];
			}
		}

		/**
		 * Destroy plugin.
		 * Usage: $('#el').timeliny('destroy');
		 */
		function destroy() {
			// Iterate over each matching element.
			$el.each(function() {
				var el = this;
				var $el = $(this);

				// Destroy completely the element and remove event listeners
				$(window).off('resize.timeliny');
				$el.find('.' + options.className + '-timeblock:not(.inactive) .' + options.className + '-dot').off('click');
				$(document).off('mousemove.timeliny');
				$(document).off('mouseup.timeliny');
				$el.first().off('mousedown');
				$el.remove();
				hook('onDestroy');

				// Remove Plugin instance from the element.
				$el.removeData('plugin_timeliny');
			});
		}

		/**
		 * Callback hooks.
		 */
		function hook(hookName, args) {
			if (options[hookName] !== undefined) {
				// Call the user defined function.
				// Scope is set to the jQuery element we are operating on.
				options[hookName].apply(el, args);
			}
		}

		// Initialize the plugin instance.
		_init();

		// Expose methods of Plugin we wish to be public.
		return {
			option: option,
			destroy: destroy,
			goToYear: goToYear
		};
	}

	/**
	 * Plugin definition.
	 */
	$.fn['timeliny'] = function(options) {
        console.log(options);
		// If the first parameter is a string, treat this as a call to
		// a public method.
		if (typeof arguments[0] === 'string') {
			var methodName = arguments[0];
			var args = Array.prototype.slice.call(arguments, 1);
			var returnVal;
			this.each(function() {
				// Check that the element has a plugin instance, and that
				// the requested public method exists.
				if ($.data(this, 'plugin_timeliny') && typeof $.data(this, 'plugin_timeliny')[methodName] === 'function') {
					// Call the method of the Plugin instance, and Pass it
					// the supplied arguments.
					returnVal = $.data(this, 'plugin_timeliny')[methodName].apply(this, args);
				} else {
					throw new Error('Method ' +  methodName + ' does not exist on jQuery.timeliny');
				}
			});
			if (returnVal !== undefined){
				// If the method returned a value, return the value.
				return returnVal;
			} else {
				// Otherwise, returning 'this' preserves chainability.
				return this;
			}
			// If the first parameter is an object (options), or was omitted,
			// instantiate a new instance of the plugin.
		} else if (typeof options === "object" || !options) {
			return this.each(function() {
				// Only allow the plugin to be instantiated once.
				if (!$.data(this, 'plugin_timeliny')) {
					// Pass options to Plugin constructor, and store Plugin
					// instance in the elements jQuery data object.
					$.data(this, 'plugin_timeliny', new Plugin(this, options));
				}
			});
		}
	};

	// Default plugin options.
	// Options can be overwritten when initializing plugin, by
	// passing an object literal, or after initialization:
	// $('#el').timeliny('option', 'key', value);
	$.fn['timeliny'].defaults = {
		order: 'asc',
		className: 'timeliny',
		wrapper: '<div class="timeliny-wrapper"></div>',
		boundaries: 2,
		animationSpeed: 250,
        hideBlankYears: false,
		onInit: function() {},
		onDestroy: function() {},
		afterLoad: function(currYear) {},
		onLeave: function(currYear, nextYear) {},
		afterChange: function(currYear) {},
		afterResize: function() {}
	};

})( jQuery, window, document );
