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
	stateCache : new Hash({}),
	fromHash : false,
	fromHandle :false,
	initialize : function(options){
		this.parent(options);		
		this.addEvent('hashChanged',this.updateState.bind(this));
	},
	updateState : function (hash){
		var $this = this;
		hash = new Hash(JSON.decode(decodeURIComponent(hash)));
		
		this.state.each(function(value,key){
			var nvalue, comperable, h_type;

			if (!hash.has(key)){
				nvalue = $this.state.get(key);
				$this.fireEvent(key+'-removed',[nvalue]);
				$this.state.erase(key);
				$this.stateCache.erase(key);
				hash.erase(key);
				return;
			}
			
			h_type = $type(hash[key]);
			
			comperable = (h_type=='string' || h_type=='number' || h_type =='boolean') ? hash[key] : JSON.encode(hash[key]);
			
			if (comperable != $this.stateCache[key]){
				nvalue = hash.get(key);
				$this.state.set(key,nvalue);
				$this.stateCache.set(key,comperable);
				$this.fireEvent(key+'-changed',[nvalue]);	
			}
			
			hash.erase(key);		
		});
		
		hash.each(function(value,key){
			$this.state.set(key,value);
			$this.stateCache.set(key,JSON.encode(value));
			$this.fireEvent(key+'-added',[value]);
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
