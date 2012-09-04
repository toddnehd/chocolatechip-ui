/*
ChocolateChip-UI
Version 2.0.0
This version works with ChocolateChip.js, jQuery or Zepto. 
For jQuery, ChocolateChip-UI requires as a minimum version 1.7.1
When using Zepto, make sure you have the following modules included in your build: zepto, event, detect, fx, fx_methods, ajax, form, data, selector, stack. 
*/
(function() {
	if (window.$chocolatechip) {
		var $ = window.$chocolatechip;
		var $$ = window.$$chocolatechip;
		var _cc = true;
		
		$.fn = HTMLElement.prototype;
	}
	if (window.jQuery) {
		var $ = window.jQuery;
		var _jq = true;
	}
	if (window.Zepto) {
		var $ = window.Zepto;
		var _zo = true;
	}
	UIConvertElementMethods = function(elementMethods) {
		for (var method in elementMethods) {
			if (_jq || _zo) {
				$.fn[method] = elementMethods[method];
			} else {
				if (elementMethods.hasOwnProperty(method)) {
					var obj = {};
					obj[method] = elementMethods[method];
					$.extend(HTMLElement.prototype, obj);
				}
			}
		}
	};	
	
	if (_jq || _zo) {
		$.extend($, {
			concat : function (args ) {
         		return args instanceof Array ? args.join('') : Array.prototype.slice.apply(arguments).join('');
         	}
		});
		$.fn.childElements = function() {
			return this.children();
		};
		$.fn.toggleClassName = function( firstClassName, secondClassName ) {
			if (!$(this).hasClass(firstClassName)) {
				$(this).addClass(firstClassName);
				$(this).removeClass(secondClassName);
			} else {
				$(this).removeClass(firstClassName);
				$(this).addClass(secondClassName);
			}
		};
	}
	// Define methods to extend HTML elements:
	var elementMethods = {
		UIIdentifyChildNodes : function ( ) {
			var ctx = this.nodeType === 1 ? this : this[0];
			var kids = ctx.childElementCount;
			for (var i = 0; i < kids; i++) {
				ctx.children[i].setAttribute('ui-child-position', i);
			}
		},
		
		_first : function ( ) {
			if (_cc) {
				return this.first();
			} else {
				return $(this).children().first();
			}
		},
		
		_last : function ( ) {
			if (_cc) {
				return this.last();
			} else {
				return $(this).children().last();
			}
		},
		
		UIBlock : function ( opacity ) {
			opacity = opacity ? " style='opacity:" + opacity + "'" : "";
			$(this).before("<mask" + opacity + "></mask>");
			return this;
		},
		UIUnblock : function ( ) {
			$._each($.els('mask'), function(idx, ctx) {
				$(ctx).remove();
			});
			return this;
		},
		
		UIRemovePopupBtnEvents : function(eventType, eventName) {
			this.removeEventListener(eventType, eventName, false);
		},
		
		UIToggleButtonLabel : function ( label1, label2 ) {
			if ($('label', this).text() === label1) {
				$('label', this).text(label2);
			} else {
				$('label', this).text(label1);
			}
		},
		
		UISelectionList : function ( callback ) {
			var $this = this;
			var listitems = this.childElements();
			if (_jq || _zo) {
				listitems = $(listitems);
			} 
			$._each(listitems, function(idx, node) {
				if (node.nodeName.toLowerCase() === 'tablecell') {
					var checkmark = '<checkmark>&#x2713</checkmark>';
					$(node).attr('role','radio');
					$(node).attr('aria-checked','false');
					$(node).append(checkmark);
					$(node).on($.userAction, function() {
						if ($.userAction === 'touchend') {
							$(node).removeClass('touched');
							$(node).attr('aria-checked','false');
						}
						var $this = this;
						setTimeout(function() {
							if ($.UIScrollingActive) return;
							$._each(listitems, function(idx, check) {
								$(check).removeClass('selected');
								$(check).removeClass('touched');
								$(check).attr('aria-checked','false');		
							});
							$($this).addClass('selected');
							$($this).attr('aria-checked','true');
							$($this).find('input').checked = true; 
							if (callback) {
								callback.call(callback, $($this).find('input'));
							}
						},100);
					});
					$(node).on('touchstart', function() {
						$(this).addClass('touched');
					});
					$(node).on('touchcancel', function() {
						$(this).removeClass('touched');
					});
				}
			});
		},
		
		UISwitchControl : function (callback) {
			callback = callback || function() { return false; };
			var item = _cc ? this : this[0]
			if (item.nodeName.toLowerCase()==="switchcontrol") {
			$(item).attr('role','radio');
				callback.call(callback, this);
				if ($(this).hasClass("off")) {
					$(this).toggleClassName("on", "off");
					$(this).attr('aria-checked','true');
					if (_cc) {
						$(this).find("input").checked = true;
					} else {
						$(this).find("input")[0].checked = true;
					}
					$(this).find("thumb").focus();
				} else {
					$(this).attr('aria-checked','false');
					$(this).toggleClassName("on", "off");
					if (_cc) {
						$(this).find("input").checked = false;
					} else {
						$(this).find("input")[0].checked = false;
					}
				}
			} else {
				return;
			}
		},
		
		UICreateSwitchControl : function( opts ) {
			/*
				{
					id : "anID",
					namePrefix : "customer",
					customClass : "specials",
					status : "on",
					kind : "traditional",
					labelValue : ["on","off"],
					value : "$1000",
					callback : function() {console.log('This is great!');},	
				}
			*/
			var id = opts.id;
			var namePrefix = '';
			if (opts.namePrefix) {
				namePrefix = "name='" + opts.namePrefix + "." + opts.id + "'";
			} else {
				namePrefix = "name='" + id + "'";
			}
			var customClass = " ";
			customClass += opts.customClass ? opts.customClass : "";
			var status = opts.status || "off";
			var kind = opts.kind ? " ui-kind='" + opts.kind + "'" : "";
			var label1 = "ON";
			var label2 = "OFF";
			if (opts.kind === "traditional") {
				if (!!opts.labelValue) {
					label1 = opts.labelValue[0];
					label2 = opts.labelValue[1];
				}
			}
			var value = opts.value || "";
			var callback = opts.callback || function() { return false; };
			var label = (opts.kind === "traditional") ? '<label ui-implements="on">'+ label1 + '</label><thumb></thumb><label ui-implements="off">' + label2 + '</label>' : "<thumb></thumb>";
			var uiswitch = '<switchcontrol ' + kind + ' class="' + status + " " + customClass + '" id="' + id + '"' + '>' + label + '<input type="checkbox" ' + namePrefix + ' style="display: none;" value="' + value + '"></switchcontrol>';
			if ($(this).css("position")  !== "absolute") {
				this.css("position: relative;");
			}
			$(this).append(uiswitch);
			var newSwitchID = "#" + id;
			if (_zo) {
				$(newSwitchID).find("input").attr("checked", (status === "on" ? true : false));
			} else {
				$(newSwitchID).find("input").prop("checked", (status === "on" ? true : false));
			}
			$(newSwitchID).bind("click", function() {
				$(this).UISwitchControl(callback);
			});
		},
		
		UIInitSwitchToggling : function() {
			var switches = $.els('switchcontrol', this);
			var $this = this;
			$._each(switches, function(ctx) {
				var item = ctx.nodeType === 1 ? $.ctx(ctx) : $.ctx(this);
				if ($(item).hasClass('on')) {
					$(item).checked = true;
					$(item).find("input[type='checkbox']").checked = true;
				} else {
					$(item).checked = false;
					$(item).find("input[type='checkbox']").checked = false;
				}
				$(item).on('click', function(e) {
					e.preventDefault();
					this.parentNode.style.backgroundImage = 'none';
					$(item).UISwitchControl();
				});
			});
		},
		
		UICreateSegmentedControl : function(opts) {
			position = opts.position || null;
			var segmentedControl = "<segmentedcontrol";
			if (opts.id) {
				segmentedControl += " id='" + opts.id + "'";
			}
			if (opts.placement) {
				segmentedControl += " ui-bar-align='" + opts.placement + "'";
			}
			if (opts.selectedSegment || opts.selectedSegment === 0) {
				segmentedControl += " ui-selected-index='" + opts.selectedSegment + "'";
			} else {
				segmentedControl += " ui-selected-index=''";
			}
			if (opts.container) {
				segmentedControl += " ui-segmented-container='#" + opts.container + "'";
			}
			var segClass = opts.cssClass || "";
			segmentedControl += ">";
			if (opts.numberOfSegments) {
				segments = opts.numberOfSegments;
				var count = 1;
				for (var i = 0; i < segments; i++) {
					segmentedControl += "<uibutton";
					segmentedControl += " id='" + $.UIUuid() + "'";
					segmentedControl += " class='" + segClass[count-1];
					if (opts.selectedSegment || opts.selectedSegment === 0) {
						if (opts.selectedSegment === i) {
							segmentedControl += " selected'";
						}
					}
					if (opts.disabledSegment) {
						if (opts.disabledSegment === i) {
							segmentedControl += " disabled'";
						}
					}
					segmentedControl += "'";
			
					segmentedControl += " ui-kind='segmented'";
					if (opts.placementOfIcons) {
						segmentedControl += " ui-icon-alignment='" + opts.placementOfIcons[count-1] + "'";
					}
					segmentedControl += ">";
					if (opts.iconsOfSegments) {
						if (!!opts.iconsOfSegments[i]) {
						segmentedControl += "<icon ui-implements='icon-mask' style='-webkit-mask-box-image: url(icons/" + opts.iconsOfSegments[count-1] +"." + opts.fileExtension[count-1] + ")'  ui-implements='icon-mask'></icon>";
						}
					}
					if (opts.titlesOfSegments) {
						segmentedControl += "<label>" + opts.titlesOfSegments[count-1] + "</label>";
					}
					segmentedControl += "</uibutton>";
					count++;
				}
				segmentedControl += "</segmentedcontrol>";
				$(this).append(segmentedControl);
			}
		},
		
		UISegmentedControl : function( container, callback ) {
			var that = $(this);
			var val = null;
			callback = callback || $.noop;
			if (!$(this).attr('ui-selected-segment')) {
				$(this).attr('ui-selected-segment', '');
			}
			if ($(this).attr('ui-selected-index')) {
				val = $(this).attr('ui-selected-index');
				var seg = $(this).children(val);
				try {
					seg = $(seg).attr('id');
					$(this).attr('ui-selected-segment', seg);
					$(this).children(val).addClass('selected');
				} catch(e) {}
			} else {
				$._each($(this).childElements(), function(idx, ctx) {
					if ($(ctx).hasClass('selected')) {
						if (idx === 0) {
							$(ctx).attr('ui-selected-index', '0');
						} else {
							$(ctx).attr('ui-selected-index', idx);
						}
					} 
				});
			}
			if (container) {
				$(this).attr('ui-segmented-container', container);
				container = $(container);
				if (val || val == 0) { 
					container.attr('ui-selected-index', val);
				}
				var containerChildren = _cc ? [].slice.apply(container.children) : $(container).children();
				$._each(containerChildren, function(idx, child) {
					$(child).css('display','none');
				});
				containerChildren.eq(val).css('display','block');
				that.attr('ui-segmented-container', ('#' + container.attr('id')));
				var selectedIndex = $(this).attr('ui-selected-index');
				container.closest('scrollpanel').data('ui-scroller').refresh();
				
			}
			$._each($(this).childElements(), function(idx, button) {
				if (!$(button).attr('id')) {
					$(button).attr('id', $.UIUuid());
				}
				if (!that.attr('ui-selected-segment')) {
					if ($(button).hasClass('selected')) {
						that.attr('ui-selected-segment', $(button).attr('id'));
					}
				}
				$(button).on('click', function() {
					var selectedSegment = that.attr('ui-selected-segment');
					selectedSegment = $('#'+selectedSegment);
					var selectedIndex = that.attr('ui-selected-index');
					var childPosition = null;
					var container = null;
					var ancestor = $(this).closest('segmentedcontrol');
					if (ancestor.attr('ui-segmented-container')) {
						container = ancestor.attr('ui-segmented-container');
					}
					var containerChildren = $(container).childElements();
					var oldSelection = null;
					if (ancestor.attr('ui-selected-index')) {
						oldSelection = ancestor.attr('ui-selected-index');
					}
					var uisi = null;
					if (!selectedSegment) {
						uisi = $(this).attr('ui-child-position');
						that.attr('ui-selected-index', uisi);
						that.attr('ui-selected-segment', $(this).attr('id'));
						$(this).addClass('selected');
						childPosition = $(this).attr('ui-child-position');
						containerChildren.eq(val).css('display','none');
						containerChildren.eq(childPosition).css('display','none');
					} 
					if (selectedSegment) {
						uisi = $(this).attr('ui-child-position');
						that.attr('ui-selected-index', uisi);
						selectedSegment.removeClass('selected');
						that.attr('ui-selected-segment', $(this).attr('id'));
						$(this).addClass('selected');
						childPosition = $(this).attr('ui-child-position');
						if (that.attr('ui-segmented-container')) {
							container = $(that.attr('ui-segmented-container'));
							containerChildren.eq(oldSelection).css('display','none');
							containerChildren.eq(uisi).css('display','block');
							containerChildren.eq(selectedSegment.attr('ui-child-position')).css('display','none');
							container.closest('scrollpanel').data('ui-scroller').refresh();
						}
					}
					$(this).addClass('selected');
						callback.call(callback, button);
				});
			});
			$(this).UIIdentifyChildNodes();
		},
		
		UICreateTabBar : function ( opts ) {
		/*
			id: 'mySpecialTabBar',
			imagePath: '/images/icons/',
			numberOfTabs: 4,
			tabLabels: ["Refresh", "Add", "Info", "Downloads", "Favorite"],
			iconsOfTabs: ["refresh", "add", "info", "downloads", "top_rated"],
			selectedTab: 0,
			disabledTab: 3
		*/
		var id = opts.id || $.UIUuid();
		var imagePath = opts.imagePath || 'icons\/';
		var numberOfTabs = opts.numberOfTabs || 1;
		var tabLabels = opts.tabLabels;
		var iconsOfTabs = opts.iconsOfTabs;
		var selectedTab = opts.selectedTab || 0;
		var disabledTab = opts.disabledTab || null;
		var tabbar = ["<tabbar ui-selected-tab='", selectedTab, "'>"];
		$(this).attr("ui-tabbar-id", id);
			for (var i = 0; i < numberOfTabs; i++) {
				tabbar.push("<uibutton ui-implements='tab' ");
				if (i === selectedTab || i === disabledTab) {
					tabbar.push("class='");
					if (i === selectedTab) {
						tabbar.push("selected");
					}
					if (i === disabledTab) {
						tabbar.push("disabled");
					}
					tabbar.push("'");
				}
				tabbar.push("><icon style='-webkit-mask-box-image: url(")
				tabbar.push(imagePath);
				tabbar.push(iconsOfTabs[i]);
				tabbar.push(".svg);'></icon>");
				tabbar.push("<label>");
				tabbar.push(tabLabels[i]);
				tabbar.push("</label></uibutton>");
			}
			tabbar.push("</tabbar>");
			$(this).append(tabbar.join(''));
			var subviews = $.els("subview", this);
			subviews.eq(selectedTab).addClass("selected");
			this.UITabBar();
		},
	
		UITabBar : function ( ) {
			var tabs = $.els('tabbar > uibutton[ui-implements=tab]', this);
			var tabbar = $('tabbar', this);
			tabbar.UIIdentifyChildNodes();
			var subviews = $.els('subview', this);
			$._each(subviews, function(idx, ctx) {
				$(ctx).addClass('unselected');
			});
			var selectedTab = tabbar.attr('ui-selected-tab') || 0;
			subviews.eq(selectedTab).toggleClassName('unselected','selected');
			tabs.eq(selectedTab).addClass('selected');
			$._each(tabs, function(idx, tab) {
				$(tab).on('click', function() {
					if ($(tab).hasClass('disabled') || $(tab).hasClass('selected')) {
						return;
					}
					var whichTab = $(tab).closest('tabbar').attr('ui-selected-tab');
					tabs.eq(whichTab).removeClass('selected');
					$(tab).addClass('selected');
					subviews.eq(whichTab).removeClass('selected');
					subviews.eq(whichTab).addClass('unselected');
					subviews.eq($(tab).attr('ui-child-position')).addClass('selected');
					subviews.eq(tab.getAttribute('ui-child-position')).removeClass('unselected');
					tabbar.attr('ui-selected-tab', $(tab).attr('ui-child-position'));
				});
			});
		},
		
		UITabBarForViews : function ( ) {
			var tabs = $.els('tabbar > uibutton[ui-implements=tab]', this);
			$('tabbar', this).UIIdentifyChildNodes();
			var tabbar = $('tabbar', this);
			var views = $.els('view', this);
			$._each(subviews, function(idx, subview) {
				$(subview).addClass('unselected');
			});
			var selectedTab = tabbar.attr('ui-selected-tab') || 0;
			subviews.eq(selectedTab).toggleClassName('unselected','selected');
			tabs.eq(selectedTab).addClass('selected');
			$._each(tabs, function(idx, tab) {
				tab.on('click', function() {
					if (tab.hasClass('disabled') || tab.hasClass('selected')) {
						return;
					}
				});
			});
		},
		
		UISegmentedPagingControl : function ( ) {
			var segmentedPager = $('segmentedcontrol[ui-implements="segmented-paging"]', this);
			var pagingOrientation = segmentedPager.attr('ui-paging');
			segmentedPager.attr('ui-paged-subview', '0');
			segmentedPager._first().addClass('disabled');
			var subviews = $.els('subview', this);
			segmentedPager.attr('ui-pagable-subviews', subviews.length);
			var childPosition = 0;
			$._each(subviews, function(idx, ctx) {
				$(ctx).attr('ui-navigation-status', 'upcoming');
				if (_cc && childPosition == 0) {
					$(ctx).attr('ui-child-position', 0);
				}
				$(ctx).attr('ui-child-position', childPosition);
				childPosition++;
				$(ctx).attr('ui-paging-orient', pagingOrientation);
			});
			var prevButton = $(segmentedPager._first());
			var nextButton = $(segmentedPager._last());
			subviews.eq(0).attr('ui-navigation-status', 'current');
			segmentedPager.delegate('uibutton', 'click', function(ctx) {
				var button = ctx.nodeType === 1 ? $.ctx(ctx) : $.ctx(this);
				if ($(button).hasClass('disabled')) return;
				var pager = segmentedPager; //$(button).closest('segmentedcontrol');
				// Previous Button:
				if (button.isSameNode(button.parentNode.firstElementChild)) {
					if (pager.attr('ui-paged-subview') == 1) {
						$(button).addClass('disabled');
						pager.attr('ui-paged-subview', '0');
						subviews.eq(0).attr('ui-navigation-status', 'current');
						subviews.eq(1).attr('ui-navigation-status', 'upcoming');
					} else {
						$(subviews[pager.attr('ui-paged-subview') - 1 ]).attr( 'ui-navigation-status', 'current');
						$(subviews[pager.attr('ui-paged-subview')]).attr('ui-navigation-status', 'upcoming');
						pager.attr('ui-paged-subview', pager.attr('ui-paged-subview')-1);
						$(button).next().removeClass('disabled');
						if (pager.attr('ui-paged-subview') <= 0) {
							$(button).addClass('disabled');
						}
					}
				} else {
					prevButton.removeClass('disabled');
					var pagedSubview = Number(pager.attr('ui-paged-subview'));
					if (pagedSubview === Number(segmentedPager.attr('ui-pagable-subviews'))-2){
						$(button).addClass('disabled');
					}
					$(subviews[pagedSubview]).attr('ui-navigation-status', 'traversed');
					$(subviews[pagedSubview+1]).attr('ui-navigation-status', 'current');
					pager.attr('ui-paged-subview', pagedSubview + 1);
				}
			});
		},
		
		UIExpander : function ( opts ) {
			opts = opts || {};
			var status = opts.status || 'expanded';
			var title = opts.title || 'Open';
			var altTitle = opts.altTitle || 'Close';
			var expander = $(this);
			var panel = $('panel', this);
			var header = '<header><label></label></header>';
			panel.attr('ui-height', parseInt(panel.css('height'), 10));
			$(this).prepend(header);
			if (status === 'expanded') {
				expander.toggleClassName('ui-status-expanded', 'ui-status-collapsed');
				$('label', this).text(altTitle);
				panel.style.height = panel.getAttribute('ui-height') + 'px';
				panel.css('opacity: 1;');
			} else {
				$('label', this).text(title);
				panel.css({'height': '0px', 'opacity': 0});
				expander.toggleClass('ui-status-collapsed', 'ui-status-expanded');
			}
			$('header', expander).on('click', function() {
				var $this = $(this);
				if (panel.css('height') == '10px' || panel.css('height') == '0px') {
					panel.css('height', panel.attr('ui-height') + 'px');
					panel.css('opacity', 1);
					$('label', $this).text(altTitle);
					expander.toggleClassName('ui-status-collapsed', 'ui-status-expanded');
			
				} else {
					panel.css({'height': '0px', 'opacity': 0});
					$('label', $this).text(title);
					expander.toggleClassName('ui-status-expanded', 'ui-status-collapsed');
				}
			});
		},
		
		UICalculateNumberOfLines : function () {
			var lineHeight = parseInt($(this).css('line-height'), 10);
			var height = parseInt($(this).css('height'), 10);
			var lineNums = Math.floor(height / lineHeight);
			return lineNums;
		},
		
		UIParagraphEllipsis : function () {
			var lines = $(this).UICalculateNumberOfLines();
			if (_cc) {
				$(this).css({'-webkit-line-clamp': lines});
			} else {
				$(this)[0].style.WebkitLineClamp = lines
			}
		},
		
		UIProgressBar : function ( opts ) {
			opts = opts || {};
			var className = opts.className || false;
			var width = opts.width || 100;
			var speed = opts.speed || 5;
			var position = opts.position || 'after';
			var margin = opts.margin || '10px auto';
			var class_name = className ? ' class="'+className+'"': '';
			var bar = $.concat('<progressbar', class_name, " style='width: ", width, "px;", " -webkit-animation-duration: ", speed, "s;", " margin: ", margin, ";'", "></progressbar>");
			return $(this).append(bar);
		},
		
		UIHideNavBarHeader : function ( ) {
			$(this).css({'visibility': 'hidden', 'position': 'absolute'});
		},
		
		UIShowNavBarHeader : function ( ) {
			$(this).css({'visibility': 'visible', 'position': 'static'});
		}
	};
	
	UIConvertElementMethods(elementMethods);
	$(function() {			
		/* 
		Function to iterate over node collections. This gets used by ChocolateChip.js.
		jQuery and Zepto already provide this method. It will always return the a plain DOM node so you can wrap it in $() or use $(this) to use node methods such as css(), etc.
		*/
		if (_cc) {
			$._each = function ( elements, callback ) {
				var i, key;
				if (typeof elements.length === 'number') {
					for (i = 0; i < elements.length; i++) {
						if (callback.call(elements[i], i, elements[i]) === false) {
							return elements;
						}
					}
				} else {
					for (key in elements) {
						if (callback.call(elements[key], key, elements[key]) === false) {
							return elements;
						}
					}
				}
		  	}  
		} else {
			$._each = $.each;
		}
		
		// Normalize the way to get a single node for jQuery, Zepto and ChocolateChip.
		$.el = function ( selector ) {
			if (typeof selector === 'string') {
				return document.querySelector(selector);
			}
			if (selector instanceof Object) {
				return selector[0];
			}
			if (selector.nodeType === 1) {
				return selector;
			}
		};
		
		// Normalize get node collections for jQuery, Zepto and Chocolatechip.
		$.els = function ( selector, context ) {
			if (_cc) {
				if(context) {
					return $$(selector, context);
				} else {
					return $$(selector);
				}
			} else {
				if(context) {
					return $(selector, context);
				} else {
					return $(selector);
				}
			}
		};
		
		if (!$.show) { 
			$.extend(HTMLElement.prototype, {
				show : function ( ) {
					var originalDisplay = this.attr('ui-display') || this.css('display');
					this.style.display = originalDisplay;
				},
				
				hide : function ( ) {
					var originalDisplay = this.css('display');
					this.attr('ui-display', originalDisplay);
					this.style.display = 'none';
				}
			});
		}
		$.body = $("body");
		$.app = $("app");
		$.main = $("#main");
		$.views = _cc ? $$("view") : $('view');
		$.touchEnabled = ('ontouchstart' in window);
		$.userAction = 'touchend';
		if (!$.touchEnabled) {
			var stylesheet = $('head').find('link[rel=stylesheet]').attr('href');
			var stylesheet1 = stylesheet.replace(/chui\.css/, 'chui.desktop.css');
			$('head').append(['<link rel="stylesheet" href="',stylesheet1,'">'].join(''));
			$.userAction = 'click';
		}
		if ( _jq || _zo) {
			$.fn.hasAttr = function(property) {
				return $(this).attr(property);
			};
			$.slice = Array.prototype.slice;
		}
		
		$.extend($, {
			UIUuidSeed : function ( seed ) {
				if (seed) {
					return (((1 + Math.random()) * 0x10000) | 0).toString(seed).substring(1);
				} else {
					return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
				}
			},
			
			AlphaSeed : function ( ) {
				var text = "";
				var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
				text += chars.charAt(Math.floor(Math.random() * chars.length));
				return text;
			},
			
			UIUuid : function() {
				return $.concat($.AlphaSeed(), $.UIUuidSeed(20), $.UIUuidSeed(), '-', $.UIUuidSeed(), '-', $.UIUuidSeed(), '-', $.UIUuidSeed(), '-', $.UIUuidSeed(), $.UIUuidSeed(), $.UIUuidSeed());
			},
			
			ctx : function(node) {
				try {
					return (node.nodeType !== 1 && typeof node === 'object' && !node.length) ? node[0] : node
				} catch(err) {}
			},

			UIEnableScrolling : function ( options ) {
				options = options || {};
				$._each($.els("scrollpanel"), function(idx, ctx) {
					var scroller = new iScroll(ctx, options);
					$(ctx).data("ui-scroller", scroller);
				});
			},
			
			UINavigationHistory : ['#main'],
			
			UINavigateBack : function() {
				var parent = $.UINavigationHistory[$.UINavigationHistory.length-1];
				$.UINavigationHistory.pop();
				$($.UINavigationHistory[$.UINavigationHistory.length-1])
				.attr('ui-navigation-status', 'current');
				
 				$($.UINavigationHistory[$.UINavigationHistory.length-1]).removeAttr('role');
				$($.UINavigationHistory[$.UINavigationHistory.length-1])
				.attr('aria-visibility', 'visible');
				$(parent).attr('ui-navigation-status', 'upcoming');
				$(parent).attr('aria-visibility', 'visible');
				 if ($.app.attr('ui-kind')==='navigation-with-one-navbar' && $.UINavigationHistory[$.UINavigationHistory.length-1] === '#main') {
 					$('navbar > uibutton[ui-implements=back]', $.app).css('display','none');
 				}
			},
			
			UINavigationListExits : false,

		   UINavigationEvent : false,
			
			UINavigationList : function() {
				var navigateList = function(node) {
					var currentNavigatingView = '#main';
					var node = $(node);
					var href = node.attr('href');
					try {
						if ($.app.attr('ui-kind')==='navigation-with-one-navbar') {
							$('navbar > uibutton[ui-implements=back]', $.app).css('display: block;');
						}
						$(node.attr('href')).attr('ui-navigation-status', 'current');
						$(node.attr('href')).attr('aria-visibility', 'visible');
						$($.UINavigationHistory[$.UINavigationHistory.length-1]).attr('ui-navigation-status', 'traversed');
						$($.UINavigationHistory[$.UINavigationHistory.length-1]).attr('aria-visibility', 'hidden');
						$($.UINavigationHistory[$.UINavigationHistory.length-1]).attr('role','presentation');
						if ($('#main').attr('ui-navigation-status') !== 'traversed') {
							$('#main').attr('ui-navigation-status', 'traversed');
							$('#main').attr('aria-visibility', 'hidden').attr('role','presentation');
						}
						
						$.UINavigationHistory.push(href);
						currentNavigatingView = node.closest('view');
						
						currentNavigatingView.bind('webkitTransitionEnd', function(event) {
							if (_jq) {
								if (event.type === 'webkitTransitionEnd') {
									node.removeClass('disabled');
								}
							} else {
								if (event.propertyName === '-webkit-transform') {
									node.removeClass('disabled');
								}
							}
						});
					} catch(err) {} 
					
					var tablecells = _cc ? [].slice.apply($$('tablecell[ui-implements=disclosure]:after')) : $('tablecell[ui-implements=disclosure]:after');
					$._each(tablecells ,function(idx, ctx) {
						$(ctx).attr('aria-visiblity', 'hidden');
					});
				};
				
				if ($.userAction === 'touchend') {
					$.app.delegate('tablecell', 'touchstart', function(ctx) {
						var node = ctx.nodeType === 1 ? $.ctx(ctx) : $.ctx(this);
						$(node).addClass('touched');
					});
					$.app.delegate('tablecell', 'touchcancel', function(ctx) {
						var node = ctx.nodeType === 1 ? $.ctx(ctx) : $.ctx(this);
						$(node).removeClass('touched');
					});
					$.app.delegate('tablecell', 'touchend', function(ctx) {
						var node = ctx.nodeType === 1 ? $.ctx(ctx) : $.ctx(this);
						$(node).removeClass('touched');
						try {
							if ($(node).hasAttr('href')) {
								$.UINavigationListExits = true;			
								if ($(node).hasClass('disabled')) {
									return
								} else {
									$(node).addClass('disabled');
									navigateList($(node));
								}
							}
						} catch(err) {}
					});
				} else {
					$.app.delegate('tablecell', 'click', function(ctx) {
						var node = ctx.nodeType === 1 ? $.ctx(ctx) : $.ctx(this);
						if ($(node).hasAttr('href')) {
							$.UINavigationListExits = true;				
							if ($(node).hasClass('disabled')) {
								return;
							} else {
								$(node).addClass('disabled');
								navigateList(node);
							}
						}
					});
				}
			},
			
			UINavigateToView : function(viewID) {
				$.UINavigationListExits = true;
				$($.UINavigationHistory[$.UINavigationHistory.length-1])
					.attr('ui-navigation-status','traversed');
				$($.UINavigationHistory[$.UINavigationHistory.length-1])
					.attr('aria-visibility', 'hidden');
				$(viewID).attr('ui-navigation-status','current');
				$(viewID).attr('aria-visibility', 'visible');
				$.UINavigationHistory.push(viewID);
				if ($.app.attr('ui-kind') === 'navigation-with-one-navbar') {
					$('navbar uibutton[ui-implements=back]').css({'display':'block'});
				}
			},
			
			UINavigateToNextView : function ( viewID ) {
				return $.UINavigateToView(viewID);
			},
	
			UITouchedTableCell : null,
			
			setupAriaForViews : function() {
				var views = $.els('view');
				$._each(views, function(idx, ctx) {
					if ($(ctx).attr('ui-navigation-status') !=='current') {
						$(ctx).attr('aria-visibility', 'hidden');
					} else {
						$(ctx).attr('aria-visibility', 'visible');
					}
				});
			},
			
			UIStepper : function (opts) {
				var stepper = $(opts.selector);
				var defaultValue = null;
				var range = null;
				var step = opts.step;
				if (opts.range.start >= 0) {
					var rangeStart = opts.range.start || "";
					var rangeEnd = opts.range.end || "";
					var tempNum = rangeEnd - rangeStart;
					tempNum++;
					range = [];
					if (step) {
						var mod = ((rangeEnd-rangeStart)/step);
						if (opts.range.start === 0) {
							range.push(0);
						} else {
							range.push(rangeStart);
						}
						for (var i = 1; i < mod; i++) {
							range.push(range[i-1] + step);
						}
						range.push(range[range.length-1] + step);
					} else {
						for (var j = 0; j < tempNum; j++) {
							range.push(rangeStart + j);				
						}
					}
				}
				var icon = (opts.indicator === "plus") ? "<icon class='indicator'></icon>" : "<icon></icon>";
				var buttonClass = opts.buttonClass ? " class='" + opts.buttonClass + "' " : "";
				var decreaseButton = "<uibutton " + buttonClass + "ui-implements='icon'>" + icon + "</uibutton>";
				var increaseButton = "<uibutton " + buttonClass + "ui-implements='icon'>" + icon + "</uibutton>";
				var stepperTemp = decreaseButton + "<label ui-kind='stepper-label'></label><input type='text'/>" + increaseButton;
				stepper.append(stepperTemp);
				if (opts.range.values) {
					stepper.data('range-value', opts.range.values.join(','));
				}
				if (!opts.defaultValue) {
					if (!!opts.range.start || opts.range.start === 0) {
						defaultValue = opts.range.start === 0 ? '0': opts.range.start;
					} else if (opts.range.values instanceof Array) {
						defaultValue = opts.range.values[0];
						$('uibutton:first-of-type', opts.selector).addClass('disabled');
					}
				} else {
					defaultValue = opts.defaultValue;
				}
				if (range) {
					stepper.data('range-value', range.join(','));
				}
				$('label[ui-kind=stepper-label]', stepper).text(defaultValue);
				$('input', stepper).value = defaultValue;
				if (opts.namePrefix) {
					var namePrefix = opts.namePrefix + '.' + stepper.id;
					$('input', stepper).attr('name', namePrefix);
				} else {
					$('input', stepper).attr('name', stepper.id);
				}
				if (defaultValue === opts.range.start) {
					$('uibutton:first-of-type', stepper).addClass('disabled');
				}
				if (defaultValue == opts.range.end) {
					$('uibutton:last-of-type', stepper).addClass('disabled');
				}
				$('uibutton:first-of-type', opts.selector).bind('click', function(button) {
					$.decreaseStepperValue.call(this, opts.selector);
				});
				$('uibutton:last-of-type', opts.selector).bind('click', function(button) {
					$.increaseStepperValue.call(this, opts.selector);
				});
			},
			
			decreaseStepperValue : function(selector) {
				var values = $(selector).data('range-value');
				values = values.split(',');
				var defaultValue = $('label', selector).text().trim();
				var idx = values.indexOf(defaultValue);
				if (idx !== -1) {
					$('uibutton:last-of-type', selector).removeClass('disabled');
					$('[ui-kind=stepper-label]', selector).text(values[idx-1]);
					$('input', selector).val(values[idx-1]);
					if (idx === 1) {
						$(this).addClass('disabled');
					} 
				}	
			},	
			
			increaseStepperValue : function(selector) {
				var values = $(selector).data('range-value');
				values = values.split(',');
				var defaultValue = $('label', selector).text().trim();
				var idx = values.indexOf(defaultValue);
				if (idx !== -1) {
					$('uibutton:first-of-type', selector).removeClass('disabled');
					$('label[ui-kind=stepper-label]', selector).text(values[idx+1]);
					$('input', selector).val(values[idx+1]);
					if (idx === values.length-2) {
						$(this).addClass('disabled');
					}
				}
			},
			
			resetSpinner : function(selector) {
				var value = $(selector).data('range-value');
				value = value.split(',')[0];
				$(selector).find('label').text(value);
				$(selector).find('uibutton:first-of-type').addClass('disabled');
				$(selector).find('uibutton:last-of-type').removeClass('disabled');
			}
		});
		
		$.app.delegate('view','webkitTransitionEnd', function() {
			if (!$('view[ui-navigation-status=current]')) {
				$($.UINavigationHistory[$.UINavigationHistory.length-2])	 
					.attr('ui-navigation-status', 'current');
				$.UINavigationHistory.pop(); 
			}	
			$.UINavigationEvent = false;
		});
		
		$.UINavigationList();
		
		if ($.userAction === 'touchend') {
			$.app.delegate('uibutton', 'touchstart', function(ctx) {
				var node = ctx.nodeType === 1 ? $.ctx(ctx) : $.ctx(this);
				$(node).addClass('touched');
			});
			$.app.delegate('uibutton', 'touchend', function(ctx) {
				var node = ctx.nodeType === 1 ? $.ctx(ctx) : $.ctx(this);
				$(node).removeClass('touched');
				if ($(node).attr('ui-implements') === 'back') {
					if ($.UINavigationListExits) {
						$.UINavigateBack();
						$.UINavigationEvent = false;
					}
				}
			});
			$.app.delegate('uibutton', 'touchcancel', function(ctx) {
				var node = ctx.nodeType === 1 ? $.ctx(ctx) : $.ctx(this);
				$(node).removeClass('touched');
			});
		} else {
			$.app.delegate('uibutton', $.userAction, function(ctx) {
				var node = ctx.nodeType === 1 ? $.ctx(ctx) : $.ctx(this);
				if ($(node).attr('ui-implements') === 'back') {
					if ($.UINavigationListExits) {
						$.UINavigateBack();
						$.UINavigationEvent = false;
					}
				}
			});	
		};
		
		$.UIEnableScrolling();
		
		$.setupAriaForViews();
		
		$.app.UIInitSwitchToggling();
		
		$.extend($, {
			UIPaging : function( selector, opts ) {
				var myPager = new iScroll( selector.firstElementChild, opts );
				var stack = null;
				stack = $('stack', selector);
				var scrollerPanels = stack.childElements();
				$(selector).parent().attr('ui-scroller', 'myPager');
				var indicatorsWidth = $(selector).parent().css('width');
				var guid = $.UIUuid();
				var indicators = '<stack id="' + guid + '" ui-implements="indicators" style="width:"' + indicatorsWidth + ';">';
				scrollerPanels.eq(0).addClass('active');
				$._each([].slice.apply(stack.childElements()), function(idx, ctx) {
					if (idx === 0) {
						indicators += '<indicator class="active"></indicator>';
					} else {
						indicators += "<indicator></indicator>";
					}
				});
				indicators += "</stack>";
				// The maximum number of indicators in portrait view is 17.
				$(selector).parent().append(indicators);
				var indicatorBase = $('#'+guid);
				indicatorBase.UIIdentifyChildNodes();
				var indics = indicatorBase.childElements();
				$(indicatorBase).on('click', 'indicator', function(ctx) {
					var item = ctx.nodeType === 1 ? $.ctx(ctx) : $.ctx(this);
					var whichPanel = $(item).attr('ui-child-position');
					myPager.scrollToPage(whichPanel,0);
					$._each(indics, function(idx, ctx) {
						$(ctx).removeClass('active');
						scrollerPanels.eq(idx).removeClass('active'); 
					});
					$(item).addClass('active');
					scrollerPanels.eq($(item).attr('ui-child-position')).addClass('active');
				});
				
			},
			
			UISetupPaging : function() {
				if ($("stack[ui-implements=paging]")) {
					var pagingStacks = $.els("stack[ui-implements=paging]");
					$._each(pagingStacks, function(idx, stack) {
						var indicatorStack = stack.nextElementSibling;
						$.UIPaging(stack, {
							snap: true,
							momentum: false,
							hScrollbar: false,
							onScrollEnd: function () {
							var ps = stack.nextElementSibling;
							$(ps).find('indicator.active').removeClass('active');
							$(ps).find('indicator:nth-child(' + (Number(this.currPageX)+1) + ')').addClass('active');
							}
						});
					});
				}
			}
		});
		
		$(function() {
			$.UISetupPaging();
		});
		
		$.extend($, {
			
			UIDeleteTableCell : function( options ) {
				/* options = {
					selector: selector,
					editButton: [label1, label2],
					deleteButton: label3,
					toolbar: toolbar,
					callback: callback
				} */
				var label1;
				if (options.editButton) {
					label1 = options.editButton[0];
				} else {
					label1 = 'Edit';
				}
				var label2;
				if (options.editButton) {
					label2 = options.editButton[1];
				} else {
					label2 = 'Done';
				}
				var label3;
				if (options.deleteButton) {
					label3 = options.deleteButton;
				} else {
					label3 = 'Delete';
				}
				var callback = options.callback || function() {};
				this.deletionList = [];
				var listEl = $(options.selector);
				var toolbarEl = $(options.toolbar);
				if (_cc) {
					if ((toolbarEl.first().nodeName) === 'UIBUTTON') {
						toolbarEl.first().setAttribute('ui-contains','uibutton');
					}
				} else {
					if (toolbarEl.children().eq(0)[0].nodeName === 'UIBUTTON') {
						toolbarEl.children().eq(0).attr('ui-contains', 'uibutton');
					}
				}
				var deleteButtonTmpl = $.concat('<uibutton role="button" ui-kind="deletionListDeleteButton" ui-bar-align="left" ui-implements="delete" class="disabled" style="display: none;"><label>', label3, '</label></uibutton>');
				var editButtonTmpl = $.concat('<uibutton role="button" ui-kind="deletionListEditButton" ui-bar-align="right"  ui-implements="edit"',' ui-button-labels="',label1,' ',label2,'"><label>', label1, '</label></uibutton>');
				$(toolbarEl).prepend(deleteButtonTmpl);
				$(toolbarEl).append(editButtonTmpl);
				var deleteDisclosure = '<deletedisclosure><span><svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20" viewBox="0 0 56 56" id="svg4441" xml:space="preserve"><metadata id="metadata8"><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" /><dc:title></dc:title></cc:Work></rdf:RDF></metadata><defs id="defs4443" /><g transform="matrix(3.627675,0,0,4.1708195,-0.38756952,2.0459536)" id="layer1"><path d="m 11.593506,0.85181027 c 0,0 -2.8782812,1.78368203 -4.3315408,3.46282313 C 5.8087055,5.9937746 5.2466215,6.7535798 5.2466215,6.7535798 4.5883903,5.9988655 4.4131283,5.7074764 3.5602554,4.9454794 L 1.6930171,6.6720302 c 0.8705482,0.5389683 1.1118812,0.5228901 1.6820456,0.9472989 0.6284449,0.4677906 1.6685596,1.2039011 2.2759527,2.014857 L 6.65407,7.7313389 C 7.5655527,6.0022084 8.3358445,4.1589192 11.560016,1.9084663 l 0.03349,-1.05665603 z" id="rect5112" style="fill:#ffffff;fill-opacity:1;stroke:none" /></g></svg></span></deletedisclosure>';
				$._each($.els(options.selector + " > tablecell"), function(idx, ctx) {
					$(ctx).prepend(deleteDisclosure);
				});
				listEl.attr('data-deletable-items', '0');
				var UIEditExecution = function() {
					$(options.toolbar + ' > uibutton[ui-implements=edit]').bind('click', 
						function() { 
							if ($('label', this).text() === label1) {
								$(this).UIToggleButtonLabel(label1, label2);
								$(this).attr('ui-implements', 'done');
								listEl.addClass('ui-show-delete-disclosures');
								$(this).parent()._first().css({'display': '-webkit-inline-box'});
								var toolbarButton = _cc ? toolbarEl.children[1].nodeName : toolbarEl.children().eq(1)[0].nodeName;
								if (/uibutton/i.test(toolbarButton)) {
								   toolbarEl.childElements().eq(1).css('display', 'none');
								}
								$._each($.els("tablecell > img", listEl), function(idx, ctx) {
									$(ctx).css('-webkit-transform','translate3d(40px, 0, 0)');
								});
							} else {
								$(this).UIToggleButtonLabel(label1, label2);
								$(this).removeAttr('ui-implements');
								$(this).parent()._first().css('display', 'none');
								listEl.removeClass('ui-show-delete-disclosures');
								$._each($.els('deletedisclosure'), function(idx, ctx) {
									$(ctx).removeClass('checked');
									$(ctx).closest('tablecell').removeClass('deletable');
								});
								var toolbarButtons = toolbarEl.childElements();
								var testButton = _cc ? toolbarButtons[1] : toolbarButtons.eq(1)[0];
								if (/uibutton/i.test(testButton.nodeName)) {
								   toolbarButtons.eq(1).css('display', '-webkit-inline-box');
								}
								$('uibutton[ui-implements=delete]').addClass('disabled');
								$._each($.els('tablecell > img', listEl), function(idx, ctx) {
									$(ctx).css('-webkit-transform','translate3d(0, 0, 0)');
								});
							}
						}
					);
				};
				var UIDeleteDisclosureSelection = function() {
					$._each($.els('deletedisclosure'), function(idx, disclosure) {
						$(disclosure).on('click', function() {
							$(disclosure).toggleClass('checked');
							$(disclosure).closest('tablecell').toggleClass('deletable');
							$('uibutton[ui-implements=delete]', toolbarEl).removeClass('disabled');
							if (!$(disclosure).closest('tablecell').hasClass('deletable')) {
								if (Number(listEl.attr("data-deletable-items")) < 2) {
									listEl.attr("data-deletable-items", '0');
									toolbarEl.find("uibutton[ui-implements=delete]").addClass("disabled");
								} else {
									listEl.attr("data-deletable-items", Number(listEl.attr("data-deletable-items")) - 1);
								}
							} else {
								listEl.attr('data-deletable-items', Number(listEl.attr("data-deletable-items")) + 1);
							}
						});
					});
				};
				var UIDeletionExecution = function() {
					$._each($.els('uibutton[ui-implements=delete]'), function(idx, ctx) {
						$(ctx).on('click', function() {
							if ($(this).hasClass('disabled')) {
								return;
							}
							$._each($.els('.deletable'), function(idx, ctx) {
								listEl.attr('data-deletable-items', parseInt(listEl.attr('data-deletable-items'), 10) - 1);
								if (!!callback) {
									callback.call(this, ctx);
								}
								$(ctx).remove();
								listEl.attr('data-deletable-items', '0');
							});
							$(this).addClass('disabled');
						});
						$(this).closest('view').find('scrollpanel').data('ui-scroller').refresh();	
					});
				};
				
				UIEditExecution();
				UIDeleteDisclosureSelection();
				UIDeletionExecution();
			},
			
			UIResetDeletionList : function(node, toolbar) {
				node = $(node);
				toolbar = $(toolbar);
				if (node.hasClass("ui-show-delete-disclosures")) {
					node.attr("data-deletable-items", 0);
					$._each(node.childElements(), function(idx, ctx) {
						try {
							$(ctx)._first().removeClass('checked');
						} catch(err) {}
					});
					node.find("deletedisclosure").removeClass("checked");
					node.removeClass("ui-show-delete-disclosures");
					var resetLabel = toolbar.find("uibutton[ui-kind=deletionListEditButton]").attr("ui-button-labels");
					resetLabel = resetLabel.split(" ");
					resetLabel = resetLabel[0];
					toolbar.find("uibutton[ui-kind=deletionListEditButton] > label").text(resetLabel);
					toolbar.find("uibutton[ui-kind=deletionListEditButton]").attr("ui-implements", "edit");
					toolbar.find("uibutton[ui-kind=deletionListDeleteButton]").css("display", "none");
					toolbar.find("uibutton[ui-kind=deletionListDeleteButton]").toggleClass('disabled');
					$._each($.els("tablecell > img", node), function(idx, ctx) {
						$(ctx).css('-webkit-transform','translate3d(0, 0, 0)');
					});					
				}
				$._each($.els('tablecell', node), function(idx, ctx) {
					$(ctx).removeClass('deletable');
				});
			},
			
			UIPopUpIsActive : false,
			UIPopUpIdentifier : null,
			UIPopUp : function( opts ) {
				/*
				opts {
					id: 'alertID',
					title: 'Alert',
					message: 'This is a message from me to you.',
					cancelUIButton: 'Cancel',
					continueUIButton: 'Go Ahead',
					callback: function() { // do nothing }
				}
				*/
				var id = opts.id || $.UIUuid();
				var title = opts.title || 'Alert!';
				var message = opts.message || '';
				var cancelUIButton = opts.cancelUIButton || 'Cancel';
				var continueUIButton = opts.continueUIButton || 'Continue';
				var callback = opts.callback || function() {};
				var popup = $.concat('<popup id=', id, ' ui-visible-state="hidden"><panel><h1>', title, '</h1></toolbar>						<p>', message, '</p><toolbar ui-placement="bottom"><uibutton ui-kind="action" ui-implements="cancel"><label>', cancelUIButton, '</label></uibutton><uibutton ui-kind="action" ui-implements="continue"><label>', continueUIButton, '</label>							</uibutton></toolbar></panel></popup>');
				$('app').append(popup);
				var popupID = '#' + id;
				$(popupID).UIBlock('0.5');
				var popupBtn = '#' + id + ' uibutton';
				$._each($.els(popupBtn), function(idx, ctx) {
					$(ctx).on('click', cancelClickPopup = function(e) {
						if ($(ctx).attr('ui-implements')==='continue') {
							callback.call(callback, this);
						}
						e.preventDefault();
						$.UIClosePopup('#' + id); 
					});
					$.UIPopUpIsActive = false;
					$.UIPopUpIdentifier = null;
					$(ctx).on('touchend', cancelTouchPopup = function(e) {	
						if (this.attr('ui-implements')==='continue') {
							callback.call(callback, this);
						}
						e.preventDefault();
						$.UIClosePopup('#' + id);
					});
					$.UIPopUpIsActive = false;
					$.UIPopUpIdentifier = null;
				});
			},
			
			UIShowPopUp : function( options ) {
				$.UIPopUp(options);
				$.UIPopUpIsActive = true;
				$.UIPopUpIdentifier = '#' + options.id;
				var screenCover = $('mask');
				screenCover.on('touchmove', function(e) {
					e.preventDefault();
				});
				$.UIPositionPopUp('#' + options.id);
				screenCover.attr('ui-visible-state', 'visible');
				$('#' + options.id).attr('ui-visible-state', 'visible');
			},
			
			UIPositionPopUp : function(selector) {
				$.UIPopUpIsActive = true;
				$.UIPopUpIdentifier = selector;
				var popup = $(selector);
				var tmpTop = ((window.innerHeight /2) + window.pageYOffset) - (popup.clientHeight /2) + 'px';
				var tmpLeft = ((window.innerWidth / 2) - (popup.clientWidth / 2) + 'px');
				popup.css({left: tmpLeft, top: tmpTop}); 
			},
			
			UIClosePopup : function ( selector ) {
				$(selector + ' uibutton[ui-implements=cancel]').UIRemovePopupBtnEvents('click', 'cancelClickPopup');
					$(selector + ' uibutton[ui-implements=continue]').UIRemovePopupBtnEvents('click', 'cancelTouchPopup');
				$(selector).UIUnblock();
				$(selector).remove();
				$.UIPopUpIdentifier = null;
				$.UIPopUpIsActive = false;
			},
			
			UIRepositionPopupOnOrientationChange : function ( ) {
				$.body.bind('orientationchange', function() {
					if (window.orientation === 90 || window.orientation === -90) {
						if ($.UIPopUpIsActive) {
							$.UIPositionPopUp($.UIPopUpIdentifier);
						}
					} else {
						if ($.UIPopUpIsActive) {
							$.UIPositionPopUp($.UIPopUpIdentifier);
						}
					}
				});
				window.addEventListener('resize', function() {
					if ($.UIPopUpIsActive) {
						$.UIPositionPopUp($.UIPopUpIdentifier);
					}
				}, false);
			}
		});
	});
	
	$(function() {
		$.UIRepositionPopupOnOrientationChange();
	});
})();