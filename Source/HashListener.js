/*
---
description: A Class that provides a cross-browser history-management functionaility, using the browser hash to store the application's state

license: MIT-style

authors:
- Arieh Glazer
- Dave De Vos
- Digitarald

requires:
- core/1.3: [Object,Class,Class.Extras,Element,Element.Event,Element.Style]

provides: [HashListener]

...
*/
(function($){

Element.NativeEvents['hashchange'] =  2;

HashListener = new Class({
	Implements : [Options,Events],
	options : {
		blank_page : 'blank.html',
		start : false
	},
	iframe : null,
	currentHash : '',
	firstLoad : true,
	handle : false,
	useIframe : (Browser.ie && (typeof(document.documentMode)=='undefined' || document.documentMode < 8)),
	ignoreLocationChange : false,
    initialize : function(options){
		var $this=this;
			
		this.setOptions(options);
		
		// Disable Opera's fast back/forward navigation mode
		if (Browser.opera && window.history.navigationMode) {
			window.history.navigationMode = 'compatible';
		}

		
		 // IE8 in IE7 mode defines window.onhashchange, but never fires it...
        if (
			('onhashchange' in window) &&
            (typeof(document.documentMode) == 'undefined' || document.documentMode > 7)
		   ){
				
                // The HTML5 way of handling DHTML history...
				window.addEvent('hashchange' , function () {
					var hash = $this.getHash();
					if (hash == $this.currentHash) {
						return;
					}
					$this.fireEvent('hashChanged',hash);
					$this.fireEvent('hash-changed',hash);
				});;
        } else  {
			if (this.useIframe){
				this.initializeHistoryIframe();
			} 
        } 
		
		window.addEvent('unload', function(event) {
			$this.firstLoad = null;
		});
		
		if (this.options.start) this.start();
	},
    initializeHistoryIframe : function(){
		var hash = this.getHash(), doc;
		this.iframe = new IFrame({
			src		: this.options.blank_page,
			styles	: { 
				'position'	: 'absolute',
				'top'		: 0,
				'left'		: 0,
				'width'		: '1px', 
				'height'	: '1px',
				'visibility': 'hidden'
			}
		}).inject(document.body);

		doc	= (this.iframe.contentDocument) ? this.iframe.contentDocument  : this.iframe.contentWindow.document;
		doc.open();
		doc.write('<html><body id="state">' + hash + '</body></html>');
		doc.close();
		return;
	},
	checkHash : function(){
		var hash = this.getHash(), ie_state, doc;
		if (this.ignoreLocationChange) {
			this.ignoreLocationChange = false;
			return;
		}

		if (this.useIframe){
			doc	= (this.iframe.contentDocument) ? this.iframe.contentDocumnet  : this.iframe.contentWindow.document;
			ie_state = doc.body.innerHTML;
			
			if (ie_state!=hash){                
                this.setHash(ie_state);				
                hash = ie_state;                
			} 
		}		
		
		if (this.currentLocation == hash) {
			return;
		}
		
		this.currentLocation = hash;
		
		this.fireEvent('hashChanged',hash);
		this.fireEvent('hash-changed',hash);
	},
	setHash : function(newHash){
		window.location.hash = this.currentLocation = newHash;
		
		if (
			('onhashchange' in window) &&
            (typeof(document.documentMode) == 'undefined' || document.documentMode > 7)
		   ) return;
		
		this.fireEvent('hashChanged',newHash);
		this.fireEvent('hash-changed',newHash);
	},
	getHash : function(){
		var m;
		if (Browser.firefox){
			m = /#(.*)$/.exec(window.location.href);
			return m && m[1] ? m[1] : '';
		}else if (Browser.safari || Browser.chrome){
			return decodeURI(window.location.hash.substr(1));
		}else{
			return window.location.hash.substr(1);
		}
	},
	setIframeHash: function(newHash) {
		var doc	= (this.iframe.contentDocument) ? this.iframe.contentDocumnet  : this.iframe.contentWindow.document;
		doc.open();
		doc.write('<html><body id="state">' + newHash + '</body></html>');
		doc.close();
		
	},
	updateHash : function (newHash){
		if (document.id(newHash)) {
			this.debug_msg(
				"Exception: History locations can not have the same value as _any_ IDs that might be in the document,"
				+ " due to a bug in IE; please ask the developer to choose a history location that does not match any HTML"
				+ " IDs in this document. The following ID is already taken and cannot be a location: "
				+ newHash
			);
		}
		
		this.ignoreLocationChange = true;
		
		if (this.useIframe) this.setIframeHash(newHash);
		else this.setHash(newHash);
	},
	start : function(){
		this.handle = this.checkHash.periodical(100, this);
	},
	stop : function(){
		clearInterval(this.handle);
	}
});

})(document.id);
