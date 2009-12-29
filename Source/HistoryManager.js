/*
---
description:

license: MIT-style

authors:
- Arieh Glazer

requires:
- core: 1.2.4/Class
- core: 1.2.4/Class.Extras

provides: HistoryManager

...
*/
/*!
Copyright (c) 2009 Arieh Glazer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE 
*/
var HistoryManager = new Class({
	Implements : [Options,Events],
	options: {
		iframeSrc: 'blank.html',
		start : false
	},
	isFirst :false,
	handle : $empty,
	iframe : null,
	list : new Hash({}),
	needIframe : ((Browser.Engine.trident && Browser.Engine.version <6 )),
	currentHash : '',
	initialize : function(options){
		var list = this.getHash(),self=this;
		if (list) this.list = new Hash(JSON.decode(list));
		if (this.options.start) this.start();
	},
	
	observe: function() {
		if (this.timeout) return;
		var state = this.getState();
		
		if (this.state == state) return;
		
		if ((this.needIframe || Browser.Engine.webkit && Browser.Engine.version<=419) && (this.state !== null)) this.setState(true);
		else this.state = state;
		this.checkHash(state);		
	},
	
	checkHash : function(hash){
		var jhash = new Hash(JSON.decode(hash)), self = this;
		jhash.each(function(value,name){
			self.set(name,value);
		});
		if (jhash.getLength()<this.list.getLength()) this.list.each(function(value,name){
			if (false === jhash.has(name)){
				self.remove(name,self.list);
			}
		});
		this.currentHash = hash;
	},
	
	set : function(name,value){
		if (this.list.has(name)){
			this.list.set(name,value);
			this.fireEvent(name+'-changed',value);
		}else{
			this.dontCheck = true;
			this.list.set(name,value);
			this.fireEvent(name+'-added',value);
		}
		this.setState();
	},
	
	remove : function(name,list){
		var list = (list) ? list : this.list ,
			value = list.get(name);
		list.erase(name);
		this.fireEvent(name+'-removed',value);
		this.setState();
	},
	
	generateState: function() {
		return this.list.toJSON();
	},

	update: function() {
		if (!this.started) return this;
		var state = this.generateState();
		if ((!this.state && !state) || (this.state == state)) return this;
		this.setState(state);
		return this;
	},

	observeTimeout: function() {
		if (this.timeout) this.timeout = $clear(this.timeout);
		else this.timeout = this.observeTimeout.delay(200, this);
	},

	getHash: function() {
		var href = decodeURIComponent(top.location.href);
		var pos = href.indexOf('#') + 1;
		return (pos) ? href.substr(pos) : '';
	},

	getState: function() {
		var state = this.getHash();

		if (this.iframe) {
			var doc = this.iframe.contentWindow.document;
			if (doc && doc.body.id == 'state') {
				var istate = doc.body.innerText;
				if (this.state == state) return istate;
				this.istateOld = true;
			} else return this.istate;
		}
		if (Browser.Engine.webkit && Browser.Engine.version<=419 && history.length != this.count) {
			this.count = history.length;
			return (this.states[this.count - 1]===undefined) ? this.states[this.count-1] :  state;
		}
		return state;
	},

	setState: function(fix) {
		state = this.generateState();
		
		if (Browser.Engine.webkit && Browser.Engine.version<=419) {
			if (!this.form) this.form = new Element('form', {method: 'get'}).inject(document.body);
			this.count = history.length;
			this.states[this.count] = state;
			this.observeTimeout();
			this.form.setProperty('action', '#' + state).submit();
		} else top.location.hash = state || '#';
		
		if (this.needIframe && (!fix || this.istateOld)) {
			if (!this.iframe) {
				this.iframe = new Element('iframe', {
					src: this.options.iframeSrc,
					style: 'visibility: hidden;'
				}).inject(document.body);
				this.istate = this.state;
			}
			try {
				var doc = this.iframe.contentWindow.document;
				doc.open();
				doc.write('<html><body id="state">' + state + '</body></html>');
				doc.close();
				this.istateOld = false;
			} catch(e) {};
		}
		
		this.state = state;
	},
	stop : function(){$clear(this.handle); this.started = false;},
	start : function(){
		var self=this;

		this.setState();
		this.list.each(function(value,name){
			self.fireEvent(name+'-added',value);
		});
		this.handle = this.observe.bind(this).periodical(100);
		this.started = true;
	}
});