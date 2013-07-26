// zerocomplete

// Copyright 2013 Moshe Kolodny
// Released under the MIT license

(function($) {
	var pluginName = 'zerocomplete',
		events = ['select', 'open', 'search'];
		
	$.fn[pluginName] = function(options) {
		var $wrappedSet = this,
			source = [],
			copyOfOptions = $.extend({}, options),
			cleanItem = function(item) { return !isObjects ? item : item.replace(/^<!-- \d+ -->/, ''); },
			getObjFromRawItem = function(item) { return !isObjects ? item : arrayOfObjects[item.match(/^<!-- (\d+) -->/)[1]]; },
			usingAjax,
			pendingUrl,
			cache = options.cache || $.cache.ajax,
			isObjects,
			arrayOfObjects,
			lastSelectedItem,			
			proccessStringsOrObjects = function(something, cachedSource) {
				if ($.isPlainObject(something[0])) {
					if (cachedSource) {
						source = cachedSource;
					} else {
						source = [];
						for (var i = 0; i < something.length; i++) {
							source.push( '<!-- ' + i + ' -->' + ($.isFunction(options.display) ? options.display(something[i], something) : something[i][options.display]) );
						}
					}
					arrayOfObjects = something;
					isObjects = true;
				} else {
					source = something;
					arrayOfObjects = null;
					isObjects = false;
				}
			};
			
		delete copyOfOptions.source;

		options = $.extend({
			display: 'label',
			getPath: function(res) { return res.data || res; },
			delay: 300
		}, options);
		
		
		if (typeof options.source === 'string') {
			if (/^[^[]/.test(options.source)) {
				usingAjax = true;
			} else {
				options.source = JSON.parse(options.source);
				proccessStringsOrObjects(options.source);
			}
		} else {
			proccessStringsOrObjects(options.source);
		}
		
		$.each(events, function(i, event) {
			if (options[event]) {
				$wrappedSet.on(pluginName + event, function() { options[event].apply($wrappedSet, arguments); });
			}
		});

		return this.each(function() {
			var $this = $(this),
				debouncedGet;
			
			$this.on('input', function() {
				lastSelectedItem = undefined;
				$this.off('blur.' + pluginName).one('blur.' + pluginName, function() {
					if (!lastSelectedItem && !$this.data().typeahead.shown) {
						$this.trigger(pluginName + 'select', { item: lastSelectedItem });
					}
				});
			});
			
			$this.typeahead($.extend(copyOfOptions, {
				source: function(query, process) {
					var processWapper = function(source) {
						if ($this.triggerHandler(pluginName + 'search', { query : query }) !== false) {
							process(source);
							$this.trigger(pluginName + 'open', { query : query });
						}
					};
					
					if (!usingAjax) {
						processWapper(source);
					} else {
						var url = options.source + (options.source.indexOf('?') === -1 ? '?' : '&') + 'term=' + query;
						
						if (!cache || !cache[url]) {							
							pendingUrl = url;
							if (!debouncedGet) {
								debouncedGet = $.fn[pluginName].debounce(options.get || $.get, options.delay)
							}
							debouncedGet.call(query, url, function(res) {
								var something;
								
								if (cache) {
									cache[url] = { res: res };
								}
								if (pendingUrl === url) {
									something = options.getPath(res);
									if (options.response) {
										something = options.response(something)
									}
									proccessStringsOrObjects(something);
									if (cache) {
										cache[url] = { res: res, source: source, arrayOfObjects: arrayOfObjects };
									}
									processWapper(source);
								}
							});
						} else {
							pendingUrl = false;
							proccessStringsOrObjects( options.getPath( cache[url].res ) );
							if (cache && !cache[url].source) {
								cache[url] = { res: cache[url].res, source: source, arrayOfObjects: arrayOfObjects };
							}
							processWapper(source);
						}
					}
				},
				updater: function(item) {
					$this.data(pluginName)
					lastSelectedItem = getObjFromRawItem(item);
					$this.trigger(pluginName + 'select', { item: lastSelectedItem });
					return cleanItem(item);
				},
				highlighter: function(item) {
					if (options.highlighter) {
						return options.highlighter.call(this, cleanItem(item), getObjFromRawItem(item), arrayOfObjects);
					} else {
						return $.fn.typeahead.Constructor.prototype.highlighter.call(this, cleanItem(item));						
					}
				},
				matcher: function(item) {
					return $.fn.typeahead.Constructor.prototype.matcher.call(this, cleanItem(item));
				}
			}));
		});
	};
	
	$.cache.ajax = {};
	
	$(document).on('focus.zerocomplete.data-api', '[data-provide="zerocomplete"]', function(e) {
		var $this = $(this);
		
		if ($this.data('zerocomplete')) { return }
		$this.zerocomplete($this.data());
		$this.data('zerocomplete', true);
	});
	
	$.fn[pluginName].debounce = function(fn, ms) {
		var timer;
		
		return function() {
			var ctx = this, args = arguments;
			
			clearTimeout(timer);
			timer = setTimeout(function() { fn.apply(ctx, args); }, ms);
		}
	}
})(jQuery);
