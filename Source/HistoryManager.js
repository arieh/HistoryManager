/*
---
description: A Class that provides a cross-browser history-management functionaility, using the browser hash to store the application's state

license: MIT-style

authors:
- Arieh Glazer

requires:
- HistoryManager/0.9.3: HashListener

provides: [HistoryManager]

...
*/
var HistoryManager = new Class({
	
	Extends : HashListener,
	
	options : {
		delimiter : '',
		serializeHash: null,
		deserializeHash: null,
	}, 
	
	state : new Hash({}),
	stateCache : new Hash({}),
	
	
	
	initialize : function(options){
		this.parent(options);
		
		if (null !== this.options.deserializeHash && null !== this.options.serializeHash)
		{
			this.serializeHash = this.options.serializeHash;
			this.deserializeHash = this.options.deserializeHash;
		}
		
		this.addEvent('hashChanged',this.updateState.bind(this));
	},
	

	serializeHash : function (d) {
		return d.toJSON();
	},
	

	deserializeHash : function (d) {
		return new Hash(JSON.decode(decodeURIComponent(d)));
	},
	
	
	updateState : function (hash){
		var $this = this;
		
		if (this.options.delimiter) hash = hash.substr(this.options.delimiter.length);

		hash = this.deserializeHash(hash);
		
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
				$this.fireEvent(key+'-updated',[nvalue]);	
				$this.fireEvent(key+'-changed',[nvalue]);	
			}
			
			hash.erase(key);		
		});
		
		hash.each(function(value,key){
			$this.state.set(key,value);
			v_type = $type(hash[key]);
			$this.stateCache.set(key,(v_type=='string' || v_type=='number' || v_type =='boolean') ? value : JSON.encode(value));
			$this.fireEvent(key+'-added',[value]);			
			$this.fireEvent(key+'-changed',[value]);	
		});
	},
	
	set : function(key,value){
		var newState = new Hash(this.state);
		
		newState.set(key,value);
		
		this.updateHash(this.options.delimiter + this.serializeHash(newState));
		
		return this;
	},
	
	remove : function(key){
		var newState = new Hash(this.state);
		
		newState.erase(key);
		
		this.updateHash(this.options.delimiter + this.serializeHash(newState));
		
		return this;
	}
});
