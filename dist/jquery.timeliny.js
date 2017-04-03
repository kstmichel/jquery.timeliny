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

			// _reorderElems();
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

			$('.originalFrame').removeClass('originalFrame').addClass('visibleEvent');


			var currYear = $el.find('.' + options.className + '-timeblock.active').first().attr('data-year');
      var currMonth = $el.find('.' + options.className + '-timeblock.active').first().attr('data-month');
      var currWeek = $el.find('.' + options.className + '-timeblock.active').first().attr('data-week');


      console.log('curr mark', currYear, currMonth, currWeek);
			hook('afterLoad', [currYear, currMonth, currWeek]);
            _updateTimelinePos();

		}



        /**
         * Set Granularity for Timeline
         * @private
         */

        var yearsView = true;
        var monthsView = false;
        var weeksView = false;
        var daysView = false;

        function _granularity(  ) {
            console.debug('_granularity ENTER');


            var yearsBtn = $('.granularity-years');
            var monthsBtn = $('.granularity-months');
            var weeksBtn = $('.granularity-weeks');
            var daysBtn = $('.granularity-days');

            $(yearsBtn).click( function(){
                var timeline = $('.timeliny-timeline');
                var timeblock = $('.timeliny-timeblock');
                var dot = $('.timeliny-dot');
                var month = $('.inactive-month');
                var week = $('.inactive-week');
                var year = $('.timeliny-timeblock:not(.active)');
                var visibleYears = $('.timeliny-timeblock:not(.inactive-year)');

                console.debug('years button clicked ~!~!~!~!~!~!~!~!~!~!~!~');

                monthsView = false;
                weeksView = false;
                yearsView = true;

                //Switch timeline classes
                $(timeline).addClass('year-view');
                $(timeline).removeClass('month-view weeks-view days-view');

                //Reset classes, markings for extra and initial events
                $(timeblock).removeClass(' only_event initial_events extra_events');
                $(dot).removeClass('clicked');

                //disable the other buttons
                $(monthsBtn).attr("disabled", false);
                $(weeksBtn).attr("disabled", false);

                //Hide all months/weeks
                $(month).remove();
                $(week).remove();
                $(year).show();

                $(visibleYears).addClass('visibleEvent');

                _addGhostElems();
                _updateTimelinePos();
                _clickBehavior();
            });

            $(monthsBtn).click(function(){
                var timeline = $('.timeliny-timeline');
                var timeblock = $('.timeliny-timeblock');
                var dataYear = $('.timeliny-timeblock.active').attr('data-year');
                var extraEvents = $('.extra_events');
                var dot = $('.timeliny-dot');
                var week = $('.inactive-week');
                var year = $('.timeliny-timeblock:not(.active)');

                yearsView = false;
                weeksView = false;
                monthsView = true;

                console.debug('months button clicked ~!~!~!~!~!~!~!~!~!~!~!~');

                //disable the other buttons
                $(yearsBtn).attr("disabled", false);
                $(weeksBtn).attr("disabled", false);

                $(timeline).removeClass('year-view weeks-view days-view');
                $(timeline).addClass('month-view');
                $(extraEvents).removeClass('active');

                //Reset classes, markings for extra and initial events
                $(timeblock).removeClass(' only_event initial_events extra_events');

                $(dot).remove();
                $(year).hide();
                $(week).remove();

                $( timeblock ).each(function(  ) {

                    //Hide all inactive years
                    if( $(this).attr('data-year') !== dataYear){
                        $(this).removeClass('visibleEvent');
                        $(this).hide();
                          console.log('remove visible from hidden years', dataYear);

                    }
                    else{

                      //Check if this month value is equal to previous month values...
                      //If so, hide this frame. We only show the first event per month.

                        if($(this).attr('data-month') == $('.visibleEvent').attr('data-month')){
                          console.log('remove extra months');
                          $(this).last().hide();
                        }
                        else{
                          //Add class to current events
                          $(this).addClass('visibleEvent');
                        }
                    }

                });

                _addGhostElems();
                _updateTimelinePos();
                _clickBehavior();

            });

            $(weeksBtn).click(function(){
                var timeline = $('.timeliny-timeline');
                var timeblock = $('.timeliny-timeblock');
                var active =  $('.timeliny-timeblock.active');
                var activeYear = $(active).attr('data-year');
                var activeMonth = $(active).attr('data-month');
                var month = $('.inactive-month');

                console.log('weeks btn clicked ~!~!~!~!~!~!~!~!~!~!~!~');

                yearsView = false;
                monthsView = false;
                weeksView = true;

                //disable the other buttons
                $(yearsBtn).attr("disabled", false);
                $(monthsBtn).attr("disabled", false);
                $(weeksBtn).attr("disabled", true);

                $(timeline).removeClass('year-view month-view days-view');
                $(timeline).addClass('weeks-view');

                //Reset classes, markings for extra and initial events
                $(timeblock).removeClass(' only_event initial_events extra_events');

                //Hide all months
                $(month).remove();

                $( timeblock ).each(function(  ) {
                  var thisYear = $(this).attr('data-year');
                  var thisMonth = $(this).attr('data-month');

                  //Reinitializing visibleEvents
                  if( $(thisMonth) == activeMonth  ){
                    // console.log('remove this unneeded month',  $(thisMonth), activeMonth);
                    $(this).removeClass('visibleEvent');
                  }

                    //Hide all inactive months
                    if( $(thisMonth) !== activeMonth){
                      // console.log('hide inactive months...');
                        $(this).hide();
                    }
                    if( $(thisYear) == activeYear && $(thisMonth) == activeMonth){
                      //Add class to current events
                      // console.log('add visible events to visible weeks...');
                      $(this).addClass('visibleEvent');
                    }

                });

                _addGhostElems();
                _updateTimelinePos();
                _clickBehavior();
            });


            $(daysBtn).click(function(){
                var timeline = $('.timeliny-timeline');
                var timeblock = $('.timeliny-timeblock');
                var active =  $('.timeliny-timeblock.active');
                var activeYear = $(active).attr('data-year');
                var activeMonth = $(active).attr('data-month');
                var activeWeek =  $(active).attr('data-week');
                var week = $('.inactive-week');
                var visibleDays = $('.timeliny-timeblock[data-year='+ activeYear +'][data-month='+ activeMonth +'][data-week=' + activeWeek +']');

                console.log('days btn clicked ~!~!~!~!~!~!~!~!~!~!~!~');

                yearsView = false;
                monthsView = false;
                weeksView = false;
                daysView = true;

                //disable the other buttons
                $(yearsBtn).attr("disabled", false);
                $(monthsBtn).attr("disabled", false);
                $(weeksBtn).attr("disabled", false);
                $(daysBtn).attr("disabled", true);

                $(timeline).removeClass('year-view month-view weeks-view');
                $(timeline).addClass('days-view');

                //Reset classes, markings for extra and initial events
                $(timeblock).removeClass(' only_event initial_events extra_events');

                //Hide all months
                $(week).remove();

                $(visibleDays).addClass('visibleEvent');

                console.log('actives', activeYear, activeMonth,  activeWeek);

                // $( timeblock ).each(function(  ) {
                //     var thisYear = $(this).attr('data-year');
                //     var thisMonth = $(this).attr('data-month');
                //
                //     console.log('ActiveMonth and this Month',  activeMonth,  $(thisMonth));
                //
                //     // //Reinitializing visibleEvents
                //     if( $(thisMonth) == activeMonth && $(thisMonth) == activeYear  ){
                //         // console.log('remove this unneeded month',  $(thisMonth), activeMonth);
                //         $(this).removeClass('visibleEvent');
                //     }
                //
                //     //Hide all inactive months
                //     if( $(thisMonth) !== activeMonth){
                //         // console.log('hide inactive months...');
                //         $(this).hide();
                //     }
                //     if( $(thisYear) == activeYear && $(thisMonth) == activeMonth){
                //         //Add class to current events
                //         // console.log('add visible events to visible weeks...');
                //         $(this).addClass('visibleEvent');
                //     }
                //
                // });

                _addGhostElems();
                _updateTimelinePos();
                _clickBehavior();
            });

        }

		/**
		 * Add ghost disabled elements for missing years/months
		 * @private
		 */
		function _addGhostElems() {
            var yearsBtn = 		$('.granularity-years');
            var monthsBtn = 	$('.granularity-months');
            var weeksBtn = 		$('.granularity-weeks');
            var daysBtn =   	$('.granularity-days');
            var timeline  = 	$('.timeliny-timeline');
            var timeblock  =	$('.timeliny-timeblock');
            var dot  = 			$('.timeliny-dot');
            var active =    	$('.timeliny-timeblock.active');


            var dataYear = $(active).attr('data-year');
            var dataMonth = $(active).attr('data-month');
            var dataWeek = $(active).attr('data-month');
            var dataDay = $(active).attr('data-day');

            var index;
            var frameType;
			var firstFrame;
            var lastFrame;
            var thisFrame;
            var eventsLog;
            var prevFrame;
            var nextFrame;
            var ghostFrame;
            var toggleVisible;
            var visibleEvents;
            var hiddenEvents;
            var search;

            if(yearsView === true){
                var firstYear = 	2008;
                var lastYear = 		2020;
                firstFrame = firstYear;
                lastFrame =  lastYear;
                index = 0;

                eventsLog = [];
                visibleEvents = $('.visibleEvent');
                index = 0;

                //disable the years button
                $(yearsBtn).attr("disabled", true);

                console.debug('Setting up years datalog');

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

                index = 0;

                console.debug('eventsLog for Years', eventsLog, firstFrame, lastFrame);

            }

            if(monthsView === true){
                var firstMonth = 	1;
                var lastMonth = 	12;
                firstFrame = firstMonth;
                lastFrame = lastMonth;
                visibleEvents = $('.timeliny-timeblock[data-year='+ dataYear +']');
                index = 0;
                dataYear = $(active).attr('data-year');
                eventsLog = [];

                eventsLog.length = 0;

                //disable the years button
                $(monthsBtn).attr("disabled", true);

                console.debug('Setting up months datalog');

                console.log('clear log', eventsLog);

                var month = $(active).attr('data-month');

                $(visibleEvents).each(function(){

                  var month = $(this).attr('data-month');

                    //Don't add repeating event months to Months Timeline.
                    if( $.inArray(month, eventsLog) == -1 ){
                        eventsLog.push(month);
                        index++;
                    }
                });

                index = 0;

                console.debug('eventsLog for Months', eventsLog);
            }

            if(weeksView === true){
                var firstWeek = 1;
                var lastWeek =  4;
                firstFrame = firstWeek;
                lastFrame = lastWeek;
                index = 0;
                visibleEvents = $('.timeliny-timeblock[data-year='+ dataYear +'][data-month='+ dataMonth +']');
                console.debug('Setting up weeks datalog');

                //disable the years button
                $(weeksBtn).attr("disabled", true);

                eventsLog = [];

                eventsLog.length = 0;
                console.log('clear log', eventsLog, dataYear, dataMonth);

                var week = $(active).attr('data-week');

                $(visibleEvents).each(function(){
                  var week = $(this).attr('data-week');

                    console.log('weeks log');

                    //Don't add repeating event months to Months Timeline.
                    if( $.inArray(week, eventsLog) == -1 ){
                        console.log('push weeks to log');

                        eventsLog.push(week);
                        index++;
                    }

                });

                index= 0;

                console.debug('eventsLog for Weeks', eventsLog);

            }

            if(daysView === true){
                var firstDay;
                var lastDay;
                index = 0;
                dataYear = $(active).attr('data-year');
                dataMonth = $(active).attr('data-month');
                dataWeek = $(active).attr('data-week');
                dataDay = $(active).attr('data-day');
                var timestamp = dataDay + '-' + dataMonth + '-' + dataYear;
                toggleVisible = $('.visibleEvent');
                visibleEvents = $('.timeliny-timeblock[data-year='+ dataYear +'][data-month='+ dataMonth +'][data-week='+ dataWeek +']');
                hiddenEvents = $('.timeliny-timeblock:not([data-year='+ dataYear +'][data-month='+ dataMonth +'][data-week='+ dataWeek +'])');
                console.debug('Setting up days datalog');


                //Find out how many days are in this month
                var getDaysInMonth = function(month,year) {
                    return new Date(year, month, 0).getDate();
                };

                var totalDays = getDaysInMonth(dataMonth, dataYear);

                var curr = new Date(dataDay + '-' + dataMonth + '-' + dataYear ); // get current date
                var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
                var last = first + 6; // last day is the first day + 6
                firstDay = new Date(curr.setDate(first)); // 06-Jul-2014
                lastDay = new Date(curr.setDate(last)); //12-Jul-2014


                // if( dataWeek === 1){
                //     firstDay = 1;
                //     lastDay =  7;
                // }
                // if( dataWeek === 2){
                //     firstDay = 8;
                //     lastDay =  14;
                // }
                // if( dataWeek === 3){
                //     firstDay = 15;
                //     lastDay =  21;
                // }
                // if( dataWeek === 4){
                //     firstDay = 21;
                //     lastDay =  totalDays;
                // }
                //
                // firstDay = 1;
                // lastDay =  7;

                firstFrame = firstDay;
                lastFrame = lastDay;


                console.debug('Amount of Days in Month:',  totalDays, 'year/month', dataYear, dataMonth , 'FIRST LAST', firstDay, lastDay, 'TIMESTAMP',timestamp );


                //disable the years button
                $(daysBtn).attr("disabled", true);

                eventsLog = [];

                eventsLog.length = 0;
                console.log('clear log', eventsLog, active, dataYear, dataMonth, dataWeek, dataDay);

                $(toggleVisible).removeClass('visibleEvent');

                // Hide other weeks
                $(hiddenEvents).hide();


                $(visibleEvents).each(function(){
                    $(this).addClass('visibleEvent');
                    var day = $(this).attr('data-day');

                    console.log('days log');

                    //Don't add repeating event months to Months Timeline.
                    if( $.inArray(day, eventsLog) == -1 ){
                        console.log('push day to log');

                        eventsLog.push(day);
                        index++;
                    }

                });

                index= 0;

                console.debug('eventsLog for Days', eventsLog);

            }

                if (options.order === 'asc') {
                    console.debug('ascending list---STATS', firstFrame, lastFrame);

                    var begin = firstFrame;
                    var end = lastFrame;

                    // Variable y is the granularity timeframe (years, months, weeks, days, hours), continue up through.
                    for (var y = (('0' + begin).slice(-2)); y < ('0' + end).slice(-2) + 1; y++) {
                        dataYear = $(active).attr('data-year');
                        dataMonth = $(active).attr('data-month');

                        console.debug('dataMonth',dataMonth, 'y', y );

                        if(yearsView === true){
                            console.log('Adding yearsView ghost frames');

                            frameType = 'timeliny-year';
                            prevFrame = children.parent().parent().find('[data-year='+ (y - 1) +']').not(dot);
                            nextFrame = children.parent().parent().find('[data-year='+ (y + 1) +']').not(dot);
                            thisFrame = children.parent().parent().find('[data-year='+ y +']').not(dot);

                            ghostFrame = '<div data-year="' + y + '" data-month="1" class="inactive inactive-year">'+y+' ghost frame</div>';

                            children = $el.children();
                        }

                        if(monthsView === true){
                            console.log('Adding monthsView ghost frames');

                            frameType = 'timeliny-month';
                            firstFrame = firstMonth;
                            lastFrame = lastMonth;

                            search = '[data-year="' + dataYear + '"]';
                            prevFrame = children.parent().parent().find('[data-year='+ dataYear +'][data-month='+ (y - 1) +']').not(dot);
                            thisFrame = children.parent().parent().find('[data-year='+ dataYear +'][data-month='+ y +']').not(dot);
                            ghostFrame = '<div data-year="' + dataYear + '" data-month="' + ('0' + y).slice(-2) + '" class="inactive inactive-month">'+y+' ghost frame</div>';

                        }

                        if(weeksView === true){
                            console.debug('Adding weeksView ghost frames');

                            frameType = 'timeliny-week';
                            firstFrame = firstWeek;
                            lastFrame = lastWeek;

                            search = '[data-year="' + dataYear + '"][data-month="' + dataMonth + '"]';
                            prevFrame = children.parent().parent().find('[data-year='+ dataYear +'][data-month='+ dataMonth +'][data-week='+ (y - 1) +']').not(dot);
                            thisFrame = children.parent().parent().find('[data-year='+ dataYear +'][data-month='+ dataMonth +'][data-week='+ y +']').not(dot);
                            ghostFrame = '<div data-year="' + dataYear + '" data-month="' + dataMonth + '" data-week="' + y + '" class="inactive inactive-week">'+y+' ghost frame</div>';

                        }

                        if(daysView === true){
                            console.debug('Adding daysView ghost frames');

                            frameType = 'timeliny-day';
                            firstFrame = firstDay;
                            lastFrame = lastDay;

                            search = '[data-year="' + dataYear + '"][data-month="' + dataMonth + '"][data-week="' + dataWeek + '"]';
                            prevFrame = children.parent().parent().find('[data-year='+ dataYear +'][data-month='+ dataMonth +'][data-week='+ dataWeek +'][data-day='+ (y - 1) +']').not(dot);
                            thisFrame = children.parent().parent().find('[data-year='+ dataYear +'][data-month='+ dataMonth +'][data-week='+ dataWeek +'][data-day='+ y +']').not(dot);
                            ghostFrame = '<div data-year="' + dataYear + '" data-month="' + dataMonth + '" data-week="' + dataWeek + '" data-day="' + y + '" class="inactive inactive-day">'+y+' ghost frame</div>';

                        }

                        //if the event doesn't exist...
                        if ( $(thisFrame).length <= 0 ) {
                            console.log('not detecting event...');

                            // if y is greater than firstFrame, place ghost item after event
                            if (y > firstFrame) {
                                console.log('y is > than firstFrame', y, firstFrame);
                               $(prevFrame).last().after(ghostFrame);

                                //if y is less than firstFrame, place ghost frame as first item
                            } else {
                                console.log('y is firstFrame', y, firstFrame);
                                //add class to ghost events

                                console.debug('PLACEMENT...');

                                    if(yearsView == true){
                                        console.debug('Years configuration');

                                        children.first().before(ghostFrame);
                                    }
                                    else{
                                        console.debug('not years configuration');
                                        $(timeline).find(search).first().not(dot).before(ghostFrame);
                                    }

                            }
                        }
                        else{
                            console.debug('event exists...', y);

                            $(thisFrame).show();

                            //If y is equal to event, don't print ghost frame
                            if (y == eventsLog[index]) {

                                $(thisFrame).addClass('visibleEvent');

                                console.debug('y Equal to EventLog, print no frame', y, '===', eventsLog[index], index);

                                //Change link to event attribute instead of data-year
                                console.debug('Mark extra events');

                                if( $(thisFrame).length >= 2){
                                    $(thisFrame).first().addClass("initial_events");
                                    $(thisFrame).not(":first").addClass("extra_events");
                                }
                                if( $(thisFrame).length === 1){
                                    $(thisFrame).first().addClass("only_event").removeClass("initial_events");
                                }


                                if( $(thisFrame).hasClass('only_event') || $(thisFrame).hasClass('initial_events') ){
                                    index++;
                                    console.debug('not Only Event: add to index:', index, eventsLog[index]);
                                }
                                else{
                                    console.debug('has only_event');
                                }
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


                // Timeline Cleanup
                var activeExtra =   $('.timeliny-timeblock.extra_events.active');
                var activeYear =   $(activeExtra).attr('data-year');

                console.debug("timeline cleanup");

                 //Reset active class
                $('.initial_events[data-year=' + activeYear +']').addClass('active');
                $(activeExtra).removeClass('active');


                _createDots();
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
		    console.debug('initialize dots...' );

            children = $('.timeliny-timeline').children();

			children.each(function(  ) {
				var text =      $(this).html();
				var year =      $(this).attr('data-year');
                var month =     $(this).attr('data-month');
                var week =      $(this).attr('data-week');
                var day =       $(this).attr('data-day');
                var dot =       $(this).find('.timeliny-dot');
                var dotHtml;
                var current =   year + month + week + day;

                if( $(text).length ){
                    console.debug('text has length');
                    dotHtml = '<a href="#' + current +'" class="' + options.className + '-dot" data-year="' + year + '" data-month="' + month + '" data-week="' + week + '" data-day="' + day + '" data-text="  "></a>';
                }
                else{
                    console.debug('text has NO length');
                    dotHtml = '<a href="#' + current +'" class="' + options.className + '-dot" data-year="' + year + '" data-month="' + month + '" data-week="' + week + '" data-day="' + day + '" data-text="' + text + '"></a>';
                }

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
                        var currWeek = $el.find('.' + options.className + '-timeblock.active').first().attr('data-week');
                        var currDay = $el.find('.' + options.className + '-timeblock.active').first().attr('data-day');
                        var current = currYear + currMonth + currWeek + currDay;

                        console.debug('CLICKEDDDDDDDDD', 'years', yearsView, 'months', monthsView,'weeks', weeksView, 'current',current);

                        hook('afterChange', [current]);

                        console.log(hook, [current])
					}
					else if (callEvent === 'resize') hook('afterResize');
				}
			});
		}

		/**
		 * Listen for click event
		 * @private
		 */

 function _clickBehavior() {
    children.parent().find('.' + options.className + '-timeblock:not(.inactive) .' + options.className + '-dot').on('click', function (e) {
        e.preventDefault();

        var active = $(this).parent().parent().find('.' + options.className + '-timeblock.active');
        var currYear = $(this).parent().parent().find('.' + options.className + '-timeblock.active').attr('data-year');
        var currMonth = $(this).parent().parent().find('.' + options.className + '-timeblock.active').attr('data-month');
        var currWeek = $(this).parent().parent().find('.' + options.className + '-timeblock.active').attr('data-week');
        var currDay = $(this).parent().parent().find('.' + options.className + '-timeblock.active').attr('data-day');

        var nextYear = $(this).attr('data-year');
        var nextMonth = $(this).attr('data-month');
        var nextWeek = $(this).attr('data-week');
        var nextDay = $(this).attr('data-day');

        $(this).toggleClass('clicked');


        var currTarget = currYear + currMonth + currWeek + currDay;
        var nextTarget = nextYear + nextMonth + nextWeek + nextDay;

        if (currTarget != nextTarget) {
                hook('onLeave', [currTarget, nextTarget]);


            $(active).removeClass('active');
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
		afterLoad: function(currYear, currMonth, currWeek) {},
		onLeave: function(currYear, nextYear) {},
		afterChange: function(currYear) {},
		afterResize: function() {}
	};

})( jQuery, window, document );
