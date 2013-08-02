
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//
// XXX_Manager_Page
//
//////////////////////////////////////////////////
//////////////////////////////////////////////////

/*

viewPort:
	- x, y
	- width, height
	- viewPortMoving
	- directionMoving
		- x, y
	
page:
	- width, height

window:
	- focus/blur
	- zoom

screen:
	- width, height
	- orientation

defaultScrollBarSize:
	- width, height

mousePosition:
	- x, y

touches:
	- x, y

TODO: reached end, lazy load trigger

*/

var XXX_Manager_Page =
{
	screen:
	{
		size:
		{
			width: 480,
			height: 480
		},
		
		orientation: 'landscape'
	},
	
	page:
	{
		size:
		{
			width: 480,
			height: 480
		},
		
		defaultScrollBarSize:
		{
			width: 16,
			height: 16	
		},
		
		zoom: 1,
		
		focused: true
	},
	
	viewPort:
	{
		size:
		{
			width: 480,
			height: 480
		},
		
		position:
		{
			current:
			{
				x: 0,
				y: 0
			},	
			
			previous:
			{
				x: 0,
				y: 0
			},
			
			start:
			{
				x: 0,
				y: 0
			},
			
			target:
			{
				x: 0,
				y: 0
			},
			
			delta:
			{
				x: 0,
				y: 0
			},
			
			movementDirection:
			{
				x: 'none',
				y: 'none'
			}
		}
	},
		
	mouse:
	{
		position:
		{
			x: 0,
			y: 0
		}
	},
	
	touches: [],
			
	elements: {},
	
	animation:
	{
		animate: false,
		ease: 'easeInOutQuintic',
		durationPixelsPerSecond: 1000,
		minimumDuration: 1000,
		maximumDuration: 3000
	},
		
	viewPortMoving: false,
	customViewPortMoving: false,
	nativeViewPortMoving: false,
	
	nativeViewPortMoveEndDelay: 200,
	nativeViewPortMoveEndDelayID: false,
	
	
	customViewPortMoveEndDelay: 200,
	customViewPortMoveEndDelayID: false,
	
	// EventDispatcher stuff
	
		eventListeners: {},
		nativeEvent: false,

		automaticallyPropagateEventTo: function (type, ancestor)
		{
			this.addEventListener(type, function ()
			{
				ancestor.dispatchEventToListeners(type); 
			});
		},
		
		dispatchEventToListeners: function (type, argument)
		{
			if (this.eventListeners[type])
			{
				for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.eventListeners[type]); i < iEnd; ++i)
				{
					(this.eventListeners[type][i])(argument);
				}
			}
		},
		
		addEventListener: function (type, eventListener)
		{
			if (!this.eventListeners[type])
			{
				this.eventListeners[type] = [];
			}
			
			this.eventListeners[type].push(eventListener);
		},
		
		
	setNativeEvent: function (nativeEvent)
	{
		this.nativeEvent = nativeEvent;
	},
	
	clearNativeEvent: function ()
	{
		this.nativeEvent = false;
	},
		
	initialize: function ()
	{
		this.screen.size = XXX_Device_Screen.getSize();		
		this.screen.orientation = XXX_Device_Screen.getOrientation();
		this.screen.pointerInterface = XXX_HTTP_Browser.pointerInterface;
		this.page.size = XXX_HTTP_Browser_Page.getSize();
		this.page.defaultScrollBarSize = XXX_HTTP_Browser_ViewPort.getDefaultScrollBarSize();
		this.viewPort.size = XXX_HTTP_Browser_ViewPort.getSize();
		
		this.attachDefaultEvents();
		
		this.pageChange();
		
		this.update();
	},
	
	setPageSize: function (width, height)
	{
		if (XXX_Type.isPositiveInteger(width) && XXX_Type.isPositiveInteger(height))
		{
			XXX_CSS.setStyle(XXX_DOM.get('XXX_body'), ['width', 'height'], [width + 'px', height + 'px']);
			
			this.page.size =
			{
				width: width,
				height: height
			};
			
			this.pageChange();
		}
	},
	
	releasePageSize: function ()
	{
		XXX_CSS.setStyle(XXX_DOM.get('XXX_body'), ['width', 'height'], ['auto', 'auto']);
		
		this.page.size =
		{
			width: 0,
			height: 0
		};
		
		this.pageChange();
	},
	
	
	setPageMargin: function (margin)
	{
		if (XXX_Type.isPositiveInteger(margin))
		{
			XXX_CSS.setStyle(XXX_DOM.get('XXX_body'), ['margin'], [margin + 'px']);
			
			this.pageChange();
		}
	},
	
	releasePageMargin: function ()
	{
		XXX_CSS.setStyle(XXX_DOM.get('XXX_body'), ['margin'], ['auto']);
		
		this.pageChange();
	},
	
	
	
	attachDefaultEvents: function ()
	{		
		XXX_DOM_NativeEventDispatcher.addEventListener(document, 'mouseMove', function (nativeMouseEvent) { XXX_Manager_Page.mouseMove(nativeMouseEvent); });		
		XXX_DOM_NativeEventDispatcher.addEventListener(window, 'resize', function () { XXX_Manager_Page.pageChange(); });
				
		if (XXX_HTTP_Browser.screenRotation)
		{
			XXX_DOM_NativeEventDispatcher.addEventListener(window, 'orientationchange', function (nativeOrientationEvent) { XXX_Manager_Page.pageChange(); });
		}
		
		XXX_DOM_NativeEventDispatcher.addEventListener(window, 'scroll', function (nativeScrollEvent) { XXX_Manager_Page.scroll(nativeScrollEvent); });
		
		if (XXX_HTTP_Browser.touchInterface)
		{
			XXX_DOM_NativeEventDispatcher.addEventListener(document, 'touchstart', function (nativeTouchEvent) { XXX_Manager_Page.touchStart(nativeTouchEvent); });			
			XXX_DOM_NativeEventDispatcher.addEventListener(document, 'touchmove', function (nativeTouchEvent) { XXX_Manager_Page.touchMove(nativeTouchEvent); });			
			XXX_DOM_NativeEventDispatcher.addEventListener(document, 'touchend', function (nativeTouchEvent) { XXX_Manager_Page.touchEnd(nativeTouchEvent); });			
			
			XXX_DOM_NativeEventDispatcher.addEventListener(document, 'gesturestart', function (nativeGestureEvent) { XXX_Manager_Page.gestureStart(nativeGestureEvent); });			
			XXX_DOM_NativeEventDispatcher.addEventListener(document, 'gesturechange', function (nativeGestureEvent) { XXX_Manager_Page.gestureChange(nativeGestureEvent); });			
			XXX_DOM_NativeEventDispatcher.addEventListener(document, 'gestureend', function (nativeGestureEvent) { XXX_Manager_Page.gestureEnd(nativeGestureEvent); });
		}
		
		
		XXX_DOM_NativeEventDispatcher.addEventListener(document, 'focusin', function () { XXX_Manager_Page.pageFocus(); });
		XXX_DOM_NativeEventDispatcher.addEventListener(document, 'focusout', function () { XXX_Manager_Page.pageBlur(); });
		
		XXX_DOM_NativeEventDispatcher.addEventListener(window, 'focus', function () { XXX_Manager_Page.pageFocus(); });
		XXX_DOM_NativeEventDispatcher.addEventListener(window, 'blur', function () { XXX_Manager_Page.pageBlur(); });
	},
	
	// move
	
		setAnimation: function (animate, ease, durationPixelsPerSecond, minimumDuration, maximumDuration)
		{
			animate = XXX_Default.toBoolean(animate, false);
			durationPixelsPerSecond = XXX_Default.toIntegerRange(durationPixelsPerSecond, 0, 3000, 1000);
			minimumDuration = XXX_Default.toIntegerRange(minimumDuration, 1000, 10000, 1000);
			maximumDuration = XXX_Default.toIntegerRange(maximumDuration, 1000, 10000, 3000);
		
			this.animation.animate = animate;
			this.animation.ease = ease;
			this.animation.durationPixelsPerSecond = durationPixelsPerSecond;
			this.animation.minimumDuration = minimumDuration;
			this.animation.maximumDuration = maximumDuration;
		},
		
		enableAnimation: function ()
		{
			this.animation.animate = true;
		},
		
		disableAnimation: function ()
		{
			this.animation.animate = false;
		},
		
		
		
		
		
		customViewPortMoveToTarget: function (target, position, skip)
		{
			target = XXX_DOM.get(target);
			
			if (target)
			{
				var targetSize = XXX_CSS_Size.get(target);
				var targetPosition = XXX_CSS_Position.getRelativeToPage(target);
				
				var x, y;
				
				switch (position)
				{
					// topLeft
					case 1:
						x = targetPosition.x;
						y = targetPosition.y;
						break;
					// topCenter
					case 2:
						x = XXX_Number.floor(targetPosition.x - (this.viewPort.size.width / 2) - (targetSize.width / 2));
						y = targetPosition.y;
						break;
					// topRight
					case 3:
						x = (targetPosition.x - this.viewPort.size.width) + targetSize.width;
						y = targetPosition.y;
						break;
					case 4:
						x = targetPosition.x;
						y = XXX_Number.floor(targetPosition.y - (this.viewPort.size.height / 2) - (targetSize.height / 2));
						break;
					case 5:
						x = XXX_Number.floor(targetPosition.x - (this.viewPort.size.width / 2) - (targetSize.width / 2));
						y = XXX_Number.floor(targetPosition.y - (this.viewPort.size.height / 2) - (targetSize.height / 2));
						break;
					case 6:
						x = (targetPosition.x - this.viewPort.size.width) + targetSize.width;
						y = XXX_Number.floor(targetPosition.y - (this.viewPort.size.height / 2) - (targetSize.height / 2));
						break;
					case 7:
						x = targetPosition.x;
						y = (targetPosition.y - this.viewPort.size.height) + targetSize.height;
						break;
					case 8:
						x = XXX_Number.floor(targetPosition.x - (this.viewPort.size.width / 2) - (targetSize.width / 2));
						y = (targetPosition.y - this.viewPort.size.height) + targetSize.height;
						break;
					case 9:
						x = (targetPosition.x - this.viewPort.size.width) + targetSize.width;
						y = (targetPosition.y - this.viewPort.size.height) + targetSize.height;
						break;
				}
				
				this.customViewPortMoveToCoordinate(x, y, skip);
			}
		},
		
		customViewPortMoveToElement: function (element, skip)
		{
			element = XXX_DOM.get(element);
			
			if (element)
			{
				var elementPosition = XXX_CSS_Position.getRelativeToPage(element);
				
				var x = elementPosition.x;
				var y = elementPosition.y;
				
				this.customViewPortMoveToCoordinate(x, y, skip);
			}
		},
		customViewPortMoveToElementCenter: function (element, skip)
		{
			element = XXX_DOM.get(element);
			
			if (element)
			{
				var elementSize = XXX_CSS_Size.get(element);
				var elementPosition = XXX_CSS_Position.getRelativeToPage(element);
				
				var horizontalElementCenter = XXX_Number.floor(elementPosition.x + (elementSize.width / 2));
				var verticalElementCenter = XXX_Number.floor(elementPosition.y + (elementSize.height / 2));
				
				var x = XXX_Number.floor(horizontalElementCenter - (this.viewPort.size.width / 2));
				var y = XXX_Number.floor(verticalElementCenter - (this.viewPort.size.height / 2));
				
				this.customViewPortMoveToCoordinate(x, y, skip);
			}
		},
		
		customViewPortMoveByOffset: function (x, y, skip)
		{
			x = XXX_Number.floor(this.viewPort.position.current.x + x);
			y = XXX_Number.floor(this.viewPort.position.current.y + y);
			
			this.customViewPortMoveToCoordinate(x, y, skip);
		},
				
		customViewPortMoveToCoordinate: function (x, y, skip)
		{		
			if (!this.viewPortMoving && !this.customViewPortMoving)
			{				
				if (!this.customViewPortMoving)
				{
					this.customViewPortMoving = true;
					
					this.dispatchEventToListeners('customViewPortMoveStart');					
				}
				
				if (!this.viewPortMoving)
				{
					this.viewPortMoving = true;
					
					this.dispatchEventToListeners('viewPortMoveStart');
				}
								
				// Target should be within the page
				
					if (x >= this.page.size.width - (this.viewPort.size.width + (this.page.defaultScrollBarSize.width)))
					{
						x = this.page.size.width - (this.viewPort.size.width + (this.page.defaultScrollBarSize.width));
					}
					if (x <= 0)
					{
						x = 0;
					}
					
					if (y >= this.page.size.height - (this.viewPort.size.height + (this.page.defaultScrollBarSize.width)))
					{
						y = this.page.size.height - (this.viewPort.size.height + (this.page.defaultScrollBarSize.width));
					}
					if (y <= 0)
					{
						y = 0;
					}
				
				this.resetCustomMovement();
								
				if (skip || !this.animation.animate)
				{
					this.viewPort.position.start.x = this.viewPort.position.current.x = this.viewPort.position.target.x = x;
					this.viewPort.position.start.y = this.viewPort.position.current.y = this.viewPort.position.target.y = y;					
					
					XXX_HTTP_Browser_ViewPort.setPosition(x, y);
					
					this.customViewPortMoveEnd();
				}
				else
				{						
					this.viewPort.position.target.x = x;
					this.viewPort.position.target.y = y;
					
					if (this.viewPort.position.target.x > this.viewPort.position.start.x)
					{
						this.viewPort.position.delta.x = this.viewPort.position.target.x - this.viewPort.position.start.x;						
						this.viewPort.position.movementDirection.x = 'right';
					}
					else
					{
						this.viewPort.position.delta.x = this.viewPort.position.start.x - this.viewPort.position.target.x;						
						this.viewPort.position.movementDirection.x = 'left';
					}
					
					if (this.viewPort.position.target.y > this.viewPort.position.start.y)
					{
						this.viewPort.position.delta.y = this.viewPort.position.target.y - this.viewPort.position.start.y;						
						this.viewPort.position.movementDirection.y = 'down';
					}
					else
					{
						this.viewPort.position.delta.y = this.viewPort.position.start.y - this.viewPort.position.target.y;						
						this.viewPort.position.movementDirection.y = 'up';
					}
					
					var tempAnimationFrameCallback = function (progressFraction)
					{
						XXX_Manager_Page.customViewPortMoveToCoordinateFrame(progressFraction);
					};
										
					var tempEndCallback = function ()
					{
						XXX_Manager_Page.customViewPortMoveEnd();
					};
					
					var duration = (XXX_Number.highest(this.viewPort.position.delta.x, this.viewPort.position.delta.y) / this.animation.durationPixelsPerSecond) * 1000;					
						duration = XXX_Number.highest(duration, this.animation.minimumDuration);
						duration = XXX_Number.lowest(duration, this.animation.maximumDuration);
					
					XXX_Animation.animateCustom('customViewPortMove', tempAnimationFrameCallback, this.animation.ease, duration, {end: tempEndCallback});
					
					this.update();
				}
			}
		},
		
			customViewPortMoveToCoordinateFrame: function (progressFraction)
			{
				var tempX, tempY;
				
				if (this.viewPort.position.movementDirection.x == 'right')
				{
					tempX = this.viewPort.position.start.x + (this.viewPort.position.delta.x * progressFraction);
				}
				else if (this.viewPort.position.movementDirection.x == 'left')
				{
					tempX = this.viewPort.position.start.x - (this.viewPort.position.delta.x * progressFraction);
				}
							
				if (this.viewPort.position.movementDirection.y == 'down')
				{
					tempY = this.viewPort.position.start.y + (this.viewPort.position.delta.y * progressFraction);
				}
				else if (this.viewPort.position.movementDirection.y == 'up')
				{
					tempY = this.viewPort.position.start.y - (this.viewPort.position.delta.y * progressFraction);
				}
				
				tempX = XXX_Number.forceMinimum(tempX, 0);
				tempY = XXX_Number.forceMinimum(tempY, 0);
				
				XXX_HTTP_Browser_ViewPort.setPosition(tempX, tempY);
				
				this.viewPort.position.current.x = tempX;
				this.viewPort.position.current.y = tempY;
				
				this.dispatchEventToListeners('customViewPortMove');
				this.dispatchEventToListeners('viewPortMove');
				
				this.update();
			},
		
		
		
		resetCustomMovement: function ()
		{
			this.viewPort.position.start.x = this.viewPort.position.target.x = this.viewPort.position.current.x;
			this.viewPort.position.start.y = this.viewPort.position.target.y = this.viewPort.position.current.y;
					
			this.viewPort.position.previous.x = 0;
			this.viewPort.position.previous.y = 0;
			
			this.viewPort.position.delta.x = 0;
			this.viewPort.position.delta.y = 0;
				
			this.viewPort.position.movementDirection.x = 'none';
			this.viewPort.position.movementDirection.y = 'none';
		},
			
		customViewPortMoveEnd: function ()
		{		
			this.customViewPortMoving = false;
			this.viewPortMoving = false;
			
			this.dispatchEventToListeners('customViewPortMoveEnd');
			this.dispatchEventToListeners('viewPortMoveEnd');
			
			this.update();
		},
		
		forceCustomViewPortMoveStop: function ()
		{
			if (this.customViewPortMoving)
			{
				XXX_Animation.removeAnimation('customViewPortMove');
				
				this.customViewPortMoveEnd();
			}
		},
		
	
		
		
		
		
	
	
		
			
	// Get information
		
		getMousePositionWithinViewPort: function ()
		{
			return this.mouse.position;
		},
		
		getTouchPositionWithinViewPort: function ()
		{
			var position = 
			{
				x: 0,
				y: 0
			};
			
			if (XXX_HTTP_Browser.touchInterface)
			{
				if (XXX_Array.getFirstLevelItemTotal(this.touches) > 0)
				{
					position = this.touches[0].position;
				}
			}
			
			return position;
		},
		
		getTouchesWithinViewPort: function ()
		{
			return this.touches;
		},
		
		getPage: function ()
		{
			return this.page;
		},
		
			getPageSize: function ()
			{
				return this.page.size;
			},
		
		getScreen: function ()
		{
			return this.screen;
		},
		
			getScreenSize: function ()
			{
				return this.screen.size;
			},
		
		getViewPort: function ()
		{
			return this.viewPort;
		},
		
			getViewPortSize: function ()
			{
				return this.viewPort.size;
			},
			
			getViewPortPosition: function ()
			{
				return this.viewPort.position.current;
			},
		
		isViewPortMoving: function ()
		{
			return this.viewPortMoving;
		},
		
			isNativeViewPortMoving: function ()
			{
				return this.nativeViewPortMoving;
			},
			
			isCustomViewPortMoving: function ()
			{
				return this.customViewPortMoving;
			},
		
		
		
	// Events
		
		mouseMove: function (nativeMouseEvent)
		{
			this.mouse.position = XXX_Device_Mouse.getPositionWithinViewPort(nativeMouseEvent);
			
			this.dispatchEventToListeners('mouseMove');
			
			this.update();
		},
		
		scroll: function (nativeScrollEvent)
		{
			this.nativeViewPortMove(nativeScrollEvent);
		},
			
		touchStart: function (nativeTouchEvent)
		{	
			this.nativeViewPortMove(nativeTouchEvent);		
		},
		
		touchMove: function (nativeTouchEvent)
		{
			var touchCount = XXX_Device_TouchSurface.getTouchCount(nativeTouchEvent);
			
			var touches = [];
			
			for (var i = 0, iEnd = touchCount; i < iEnd; ++i)
			{
				var touch =
				{
					position: XXX_Device_TouchSurface.getPositionWithinViewPort(nativeTouchEvent, i)
				};
				
				touches.push(touch);
			}
			
			this.touches = touches;
			
			this.nativeViewPortMove(nativeTouchEvent);
		},
		
		touchEnd: function (nativeTouchEvent)
		{
			this.nativeViewPortMove(nativeTouchEvent);
		},
		
		gestureStart: function (nativeGestureEvent)
		{
		},
		
		gestureChange: function (nativeGestureEvent)
		{
			
		},
		
		gestureEnd: function (nativeGestureEvent)
		{
			
		},
		
		// scroll, swipe etc.
		nativeViewPortMove: function (nativeEvent)
		{			
			if (this.customViewPortMoving)
			{
				nativeEvent.preventDefault();
			}
			else
			{
				this.forceCustomViewPortMoveStop();
				
				this.viewPort.position.previous.x = this.viewPort.position.current.x;
				this.viewPort.position.previous.y = this.viewPort.position.current.y;
				
				this.viewPort.position.current = XXX_HTTP_Browser_ViewPort.getPosition();
				
				this.clearNativeViewPortMoveEndDelay();
				
				var nativeViewPortMoving = false;
				
				if (this.viewPort.position.current.x != this.viewPort.position.previous.x)
				{
					nativeViewPortMoving = true;
					
					this.viewPort.position.movementDirection.x = (this.viewPort.position.current.x > this.viewPort.position.previous.x) ? 'right' : 'left';
				}
				
				if (this.viewPort.position.current.y != this.viewPort.position.previous.y)
				{				
					nativeViewPortMoving = true;
					
					this.viewPort.position.movementDirection.y = (this.viewPort.position.current.y > this.viewPort.position.previous.y) ? 'down' : 'up';  
				}
				
				if (!this.nativeViewPortMoving)
				{					
					this.nativeViewPortMoving = true;
					
					this.dispatchEventToListeners('nativeViewPortMoveStart');
				}
				
				if (!this.viewPortMoving)
				{
					this.viewPortMoving = true;
					
					this.dispatchEventToListeners('viewPortMoveStart');
				}
					
				if (nativeViewPortMoving)
				{					
					this.dispatchEventToListeners('nativeViewPortMove');
					this.dispatchEventToListeners('viewPortMove');
					this.dispatchEventToListeners('viewPortChange');
					
					this.update();
				}
				
				this.nativeViewPortMoveEndDelayID = XXX_Timer.startDelay(this.nativeViewPortMoveEndDelay, function ()
				{
					XXX_Manager_Page.nativeViewPortMoveEndDelayID = false;
					
					XXX_Manager_Page.nativeViewPortMoveEndDelayed();
				});
			}
		},
		
		clearNativeViewPortMoveEndDelay: function ()
		{
			XXX_Timer.cancelDelay(this.nativeViewPortMoveEndDelayID);
		},
		
		nativeViewPortMoveEndDelayed: function ()
		{
			this.viewPortMoving = false;
			this.nativeViewPortMoving = false;
			
			this.viewPort.position.previous.x = 0;
			this.viewPort.position.previous.y = 0;
			
			this.viewPort.position.movementDirection.x = 'none';
			this.viewPort.position.movementDirection.y = 'none';
						
			if (XXX_HTTP_Browser.touchInterface)
			{
				this.touches = [];
			}
			
			this.dispatchEventToListeners('nativeViewPortMoveEnd');
			this.dispatchEventToListeners('viewPortMoveEnd');
			this.dispatchEventToListeners('viewPortChange');
			
			this.update();
		},
				
		pageFocus: function ()
		{
			this.page.focused = true;
			
			this.viewPort.size = XXX_HTTP_Browser_ViewPort.getSize();
			this.page.size = XXX_HTTP_Browser_Page.getSize();
			this.screen.size = XXX_Device_Screen.getSize();
			
			this.dispatchEventToListeners('pageFocus');
			this.dispatchEventToListeners('pageChange');
			
			this.update();
		},
		
		pageBlur: function ()
		{
			this.page.focused = false;
			
			this.mouse.position.x = 0;
			this.mouse.position.y = 0;
			
			this.touches = [];
			
			this.dispatchEventToListeners('pageBlur');
			this.dispatchEventToListeners('pageChange');
			
			this.update();
		},
						
		pageChange: function ()
		{
			this.screen.size = XXX_Device_Screen.getSize();
			this.screen.orientation = XXX_Device_Screen.getOrientation();
			
			this.page.size = XXX_HTTP_Browser_Page.getSize();
			this.page.zoom = XXX_HTTP_Browser_Page.getZoom();
			
			this.viewPort.size = XXX_HTTP_Browser_ViewPort.getSize();
			this.viewPort.position.current = XXX_HTTP_Browser_ViewPort.getPosition();
			
			
			this.dispatchEventToListeners('pageChange');
			this.dispatchEventToListeners('viewPortResize');
			this.dispatchEventToListeners('viewPortChange'); // TODO Fix this, conflicting with viewPortMove etc... only clear events por favor
			
			this.update();
		},
	
	update: function ()
	{
		if (XXX_JS.debug)
		{
			var screenInformation = 'screen: ';
			screenInformation += ' ' + this.screen.size.width + 'x' + this.screen.size.height;
			screenInformation += ' | ' + this.screen.orientation;
			screenInformation += ' | ' + this.screen.pointerInterface;
			screenInformation += '<br>';
			
			var pageInformation = 'page: ';
			pageInformation += ' ' + this.page.size.width + 'x' + this.page.size.height;
			pageInformation += ' | zoom: ' + this.page.zoom;
			pageInformation += ' | ' + (this.page.focused ? 'focused' : 'blurred');
			pageInformation += '<br>';
			
			var viewPortInformation = 'viewPort: ';
			viewPortInformation += ' ' + this.viewPort.size.width + 'x' + this.viewPort.size.height;
			viewPortInformation += ' | ' + XXX_Number.round(this.viewPort.position.current.x) + ', ' + XXX_Number.round(this.viewPort.position.current.y);
			viewPortInformation += ' | ' + (this.viewPortMoving ? 'moving' : 'not moving');
			viewPortInformation += '<br>';
			
			var mouseInformation = 'mouse: ';
			mouseInformation += ' ' + this.mouse.position.x + ' (' + (XXX_Number.round((this.mouse.position.x / this.viewPort.size.width) * 100)) + '%)';
			mouseInformation += ', ' + this.mouse.position.y + ' (' + (XXX_Number.round((this.mouse.position.y / this.viewPort.size.height) * 100)) + '%)';
			mouseInformation += '<br>';
			
			var touchInformation = '';
			if (this.screen.pointerInterface == 'touch')
			{
				var touchInformation = 'touches: ' + '<br>';
				for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.touches); i < iEnd; ++i)
				{
					touchInformation += ' - ' + i + ': ';
					touchInformation += ' ' + this.touches[i].position.x + ' (' + (XXX_Number.round((this.touches[i].position.x / this.viewPort.size.width) * 100)) + '%)';
					touchInformation += ', ' + this.touches[i].position.y + ' (' + (XXX_Number.round((this.touches[i].position.y / this.viewPort.size.height) * 100)) + '%)' + '<br>';
				}
				touchInformation += '<br>';
			}
						
			XXX_JS.liveDebugOutput(screenInformation + pageInformation + viewPortInformation + mouseInformation + touchInformation);
		}
	}
};

XXX_DOM_Ready.addEventListener(function ()
{
	XXX_Manager_Page.initialize();
});
