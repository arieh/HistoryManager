/*
---
description: A Class that provides a cross-browser history-management functionaility, using the browser hash to store the application's state

license: MIT-style

authors:
- Arieh Glazer

requires:
- /HashListner

provides: HistoryManager

...
*/
var HistoryManager = new Class({
	Extends : HashListener,
	state : new Hash({}),
	fromHash : false,
	fromHandle :false,
	initialize : function(options){
		this.parent(options);		
		this.addEvent('hash-changed',this.updateState.bind(this));
	},
	updateState : function (hash){
		var self = this;
		hash = new Hash(JSON.decode(decodeURIComponent(hash)));
		
		this.state.each(function(value,key){
			var nvalue;

			if (hash.has(key)){
				nvalue = hash.get(key);
				self.state.set(key,nvalue);
				self.fireEvent(key+'-changed',nvalue);
			}else{
				nvalue = self.state.get(key);
				self.fireEvent(key+'-removed',nvalue);
				self.state.erase(key);
			}
			
			hash.erase(key);
		});
		
		hash.each(function(value,key){
			self.state.set(key,value);
			self.fireEvent(key+'-added',value);
		});
	},
	set : function(key,value){
		var newState = new Hash(this.state);
		
		newState.set(key,value);

		this.updateHash(newState.toJSON());
	},
	remove : function(key){
		var newState = new Hash(this.state);
		
		newState.erase(key);
		
		this.updateHash(newState.toJSON());
	}
});
