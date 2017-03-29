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
			_createDots();
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
            var firstYear = 	parseInt(children.first().attr('data-year'));
            var lastYear = 		parseInt(children.last().attr('data-year'));
            var timeline  = 	$('.timeliny-timeline');
            var timeblock  =	$('.timeliny-timeblock');
            var dot  = 			$('.timeliny-dot');
            var activeFrame  = 	$('.timeliny-timeblock.active');
            var activeEvents = 	$('.activeEvent');
            var data_year  = 	$(activeFrame).attr('data-year');
            var data_month = 	$(activeEvents).attr('data-month');
            var i = 0;


            //YEARS GHOST FRAMES (if yearsView = true)
            if(yearsView === true){

                //disable the years button
                $(yearsBtn).attr("disabled", true);

                console.log('Adding yearsView ghost frames');

                if (options.order === 'asc') {
                    console.log('ascending function');

                    // Variable y is firstYear (2008), continue up through years if y is less than lastYear (2019)
                    for (var y = firstYear - options.boundaries; y < lastYear + options.boundaries + 1; y++) {
                    	console.log('y', y);

                        //if the data-year doesn't exist...
                        if ( children.parent().parent().find('[data-year='+ y +']').not(dot).length <= 0 ) {
                            console.log('not found...make a ghost frame!');

                            // if data-year is greater that firstYear (2008), place ghost item after
                            if (y > firstYear - options.boundaries) {
                                console.log('y > firstYear', y, '>', firstYear);

                                children.parent().parent().find('[data-year='+ (y - 1) +']').not(dot).last().after('<div data-year="' + y + '" class="inactive "></div>');

                                //if data-year is less than firstYear (2008), place ghost frame as first item
                            } else {
                                console.log('first item: y < firstYear', y , '<', firstYear);

                                //add class to ghost events
                                children.first().before('<div data-year="' + y + '" class="inactive firstYear"></div>');
                            }


                        }
                        else{
                            console.log('hey there something there!!');

                        	if( children.parent().parent().find('[data-year='+ y +']').length >= 2){
                                children.parent().parent().find('[data-year='+ y +']').first().addClass("initial_events");
                                children.parent().parent().find('[data-year='+ y +']').not(":first").addClass("extra_events");
							}
                            if( children.parent().parent().find('[data-year='+ y +']').length === 1){
                                children.parent().parent().find('[data-year='+ y +']').first().addClass("only_event").removeClass("initial_events");
							}

						}
                    }
                    //If timeline is in decending order...
                } else {

                    // Variable y is firstYear (2008), continue down through years if y is less than lastYear (2019)
                    for (var y = firstYear + options.boundaries; y >= lastYear - options.boundaries; y--) {

                        //if the data-year doesn't exist...
                        if ( children.parent().find('[data-year='+ y +']').length <= 0 ) {

                            // if data-year is greater that firstYear (2008), place ghost item after
                            if (y < firstYear + options.boundaries) {
                                children.parent().find('[data-year=' + (y + 1) + ']').after('<div data-year="' + y + '" class="inactive"></div>');
                            }
                            //if data-year is less than firstYear (2008), place ghost frame as first item
                            else {
                                children.first().before('<div data-year="' + y + '" class="inactive"></div>');
                            }
                        }
                    }
                }

                children = $el.children();
            }


		    //MONTHS GHOST FRAMES
            if(monthsView === true) {

                console.log('Adding monthsView ghost frames');

                var firstMonth = 1;
                var lastMonth = 12;


                //disable the months button
                $(monthsBtn).attr("disabled", true);


                //Create 12 month frames, place events for active year where appropriate
                for (var y = firstMonth; y < lastMonth + 1; y++) {
                // for (var counter = 1; counter < 13; counter++) {
                    var previousFrame = children.parent().parent().find('[data-month='+ (y - 1) +']').not('.timeliny-dot');
                    var events = [];

                    $(activeEvents).each(function(){
                        events.push($(this).attr('data-month'));
                    });

                    console.log('events', events);

                    //If y is less than data-month then place before
                    if (y < events[i]) {
                        console.debug('smaller....');
                        console.log('counter < events---', y, '<', events[i]);

                        //If previous Ghost frame exists, print another right after
                        if($(previousFrame).length ){
                            console.debug('smaller....frame exists!');
                            $(previousFrame).after(' <div data-year="' + data_year + '" data-month="' + y + '" class="inactive timeliny-timeblock timeliny-month previousFrame"> '+y+' exists ghost month</div>');

                        }

                        //If previous Ghost frame
                        else{
                            console.debug('smaller....doesnt exist >> frame created!');
                            $(activeFrame).first().before(' <div data-year="' + data_year + '" data-month="' + y + '" class="inactive  timeliny-timeblock timeliny-month ">'+y+' first ghost month </div>');


                        }

                    }

                    //If y is equal to data-month, don't print ghost frame
                    if (y == events[i]) {
                        console.debug('equal.... no new frame', 'counter == events--->', y, '==', events[i]);

						//Change link to data-month attribute instead of data-year

                        var currentFrame = document.querySelectorAll('[data-month="'+ y +'"]');

                        $(currentFrame).find('.timeliny-dot').attr('href', events[i]);

                        if($(activeEvents).length > 1){
                            i++;
						}
                    }

                    //If counter is equal to data-month, don't print ghost frame
                    if (y > events[i]) {

                        console.debug('larger....', 'Place After: data-month=', y -1, previousFrame, 'counter < events', y, events[i]) ;

                        $(previousFrame).after(' <div data-year="' + data_year + '" data-month="' + y + '" class="inactive timeliny-timeblock timeliny-month afterFrame"> '+y+' larger ghost month</div>');

                    }
                }

                var activeMonth = $(activeFrame).attr('data-month');
                var activeYear = $(activeFrame).attr('data-year');

                console.log('activeYear', activeYear, 'lastMonth', lastMonth);

                //Remove all extra ghost frames that appear before first Month
                children.parent().find('[data-year='+ activeYear +'][data-month='+ firstMonth +']').not(dot).addClass('firstMonth').prevAll('[data-year='+ activeYear +']').remove();

                //Remove all extra ghost frames that appear after last Month
                children.parent().find('[data-year='+ activeYear +'][data-month='+ lastMonth +']').not(dot).addClass('lastMonth').nextAll('[data-year='+ activeYear +']').remove();




                children = $el.children();
            }





		}

        /**
         * Set Granularity
         * @private
         */

        var monthsView = false;
        var yearsView = true;

        function _granularity(  ) {
            var yearsBtn = $('.granularity-years');
            var monthsBtn = $('.granularity-months');


            $(yearsBtn).click( function(){
                	var timeline = $('.timeliny-timeline');
                    var timeblock = $('.timeliny-timeblock');
               		var activeYear = $('.timeliny-timeblock.active').attr('data-year');
               		var month = $('.timeliny-month');

                    monthsView = false;
                    yearsView = true;

					$(timeline).toggleClass('year-view');
              	    $(timeline).toggleClass('month-view');
                	$(timeblock).removeClass('lastMonth', 'firstMonth');

					//disable the submit button
					$(monthsBtn).attr("disabled", false);

					//Hide all months
					$(month).remove();

					$( timeblock ).each(function(  ) {

						//Hide all inactive years
						if( $(this).attr('data-year') !== activeYear){
							$(this).show();
						}
						else{
							//Add class to current events
							$(this).toggleClass('activeEvent');

						}

					});


                    _addGhostElems();
                    _updateTimelinePos();
                });


                $(monthsBtn).click(function(){
                    var timeline = $('.timeliny-timeline');
                    var timeblock = $('.timeliny-timeblock');
                    var activeYear = $('.timeliny-timeblock.active').attr('data-year');

                    yearsView = false;
                    monthsView = true;

                    //disable the submit button
                    $(yearsBtn).attr("disabled", false);

                    $(timeline).toggleClass('year-view');
                    $(timeline).toggleClass('month-view');

                    $( timeblock ).each(function(  ) {

                            //Hide all inactive years
                            if( $(this).attr('data-year') !== activeYear){
                                $(this).hide();
                            }
                            else{
                            	//Add class to current events
                                $(this).toggleClass('activeEvent');
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
			children.each(function( index ) {
				var text = $(this).html();
				var year = $(this).attr('data-year');
                var month = $(this).attr('data-month');

				var dotHtml = '<a href="#' + year + '" class="' + options.className + '-dot" data-year="' + year + '" data-month="' + month + '" data-text="' + text + '"></a>';

				$(this).addClass('' + options.className + '-timeblock').html(dotHtml);
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

                        console.log('updateTimeline:',currYear+currMonth);

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
            var events = [];

            $(this).toggleClass('clicked');

            console.log( currYear+currMonth, nextYear+nextMonth, $(this));


            // $('.timeliny-timeblock.extra_events').each(function(){
            //     var compare = $(this).attr('data-year');
            //
            // if( compare === nextYear){
            //         events.push($(this).attr('data-month'));
            // }
            //
            // });


            if ( current != next) {
                hook('onLeave', [currYear, nextYear]);
                console.debug('CHANGED:', currYear, currMonth, '-', nextYear, nextMonth);

                $(activeYears).removeClass('active');
                $(this).closest('.' + options.className + '-timeblock').addClass('active');
            }
            else{
                console.debug('the same?!');
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
                var events = [];

                $(this).toggleClass('clicked');

                console.log( currYear+currMonth, nextYear+nextMonth, $(this), activeParent);


                // $('.timeliny-timeblock.extra_events').each(function(){
                //     var compare = $(this).attr('data-year');
                //
					// if( compare === nextYear){
                //         events.push($(this).attr('data-month'));
					// }
                //
                // });


				if ( current != next ) {
					hook('onLeave', [currYear, nextYear]);
                    console.debug('CHANGED:', currYear, currMonth, '-', nextYear, nextMonth);

                    $(activeYears).removeClass('active');
					$(this).closest('.' + options.className + '-timeblock').addClass('active');
				}
				else{
                    console.debug('the same?!');
                }

                console.log('end');

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
