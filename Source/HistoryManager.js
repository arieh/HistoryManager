/*
---
description: A Class that provides a cross-browser history-management functionaility, using the browser hash to store the application's state

license: MIT-style

authors:
- Arieh Glazer

requires:
- HistoryManager/0.4.1: HashListener

provides: [HistoryManager]

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
			var nvalue, comperable, h_type,v_type;
			if (!hash.has(key)){
				nvalue = self.state.get(key);
				self.fireEvent(key+'-removed',[nvalue]);
				self.state.erase(key);
				hash.erase(key);
				return;
			}
			h_type = $type(hash[key]);
			v_type = $type(value);
			comperable = [
				(h_type=='string' || h_type=='number' || h_type =='boolean') ? hash[key] : JSON.encode(hash[key])
				, (v_type=='string' || v_type=='number' || v_type =='boolean') ? value : JSON.encode(value)
			];

			if (comperable[0] != comperable[1]){
				nvalue = hash.get(key);
				self.state.set(key,nvalue);
				self.fireEvent(key+'-changed',[nvalue]);	
			}
			hash.erase(key);		
		});
		
		hash.each(function(value,key){
			self.state.set(key,value);
			self.fireEvent(key+'-added',[value]);
		});
	},
	set : function(key,value){
		var newState = new Hash(this.state);
		
		newState.set(key,value);

		this.updateHash(newState.toJSON());
		
		return this;
	},
	remove : function(key){
		var newState = new Hash(this.state);
		
		newState.erase(key);
		
		this.updateHash(newState.toJSON());
		
		return this;
	}
});
