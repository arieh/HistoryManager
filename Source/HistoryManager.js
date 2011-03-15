/*
---
description: A Class that provides a cross-browser history-management functionaility, using the browser hash to store the application's state

license: MIT-style

authors:
- Arieh Glazer

requires:
- Core/1.3 : JSON
- HistoryManager/1.2: HashListener

provides: [HistoryManager]

...
*/

(function($,undef){

var fireEvent = Events.prototype.fireEvent;

HistoryManager = new Class({
	
	Extends : HashListener,
	
	options : {
		delimiter : '',
		serializeHash: null,
		deserializeHash: null,
        compat : false
	}, 
	
	state : {},
	stateCache : {},
	
	initialize : function(options){
		this.parent(options);

		this.serializeHash = this.options.serializeHash || this.serializeHash;
		this.deserializeHash = this.options.deserializeHash || this.deserializeHash;
		
		this.addEvent('hashChanged',this.updateState.bind(this));
	},

    fireEvent : function(name,args,delay){
        if (!delay) delay = 1;    
        fireEvent.apply(this,[name,args,delay]);
    },

	serializeHash : function (d) {
		return JSON.encode(d);
	},

	deserializeHash : function (d) {
		return JSON.decode(decodeURIComponent(d));
	},
	
	updateState : function (hash){
		var $this = this;
		
		if (this.options.delimiter) hash = hash.substr(this.options.delimiter.length);

		hash = this.deserializeHash(hash);
        
        Object.each(this.state,function(value,key){
			var nvalue, comperable, h_type;

			if (!hash || hash[key]===undef){
				nvalue = $this.state[key];
				
                if ($this.options.compat){
                    $this.fireEvent(key+'-removed',[nvalue]);
                }
                
                $this.fireEvent(key+':removed',[nvalue]);
                $this.fireEvent(key,[nvalue]);
				delete $this.state[key];
				delete $this.stateCache[key];
				if (hash && hash[key]) delete hash[key];
				return;
			}
			
			h_type = typeOf(hash[key]);
			
			comperable = (h_type=='string' || h_type=='number' || h_type =='boolean') ? hash[key] : JSON.encode(hash[key]);
			
			if (comperable != $this.stateCache[key]){
                nvalue = hash[key];
				$this.state[key] = nvalue;
				$this.stateCache[key] =comperable;
				
                if ($this.options.compat){
                    $this.fireEvent(key+'-updated',[nvalue]);
                    $this.fireEvent(key+'-changed',[nvalue]);
                }
                
				$this.fireEvent(key+':updated',[nvalue]);
				$this.fireEvent(key+':changed',[nvalue]);	
                $this.fireEvent(key,[nvalue]);
			}
			
			delete hash[key];
		});
		
		Object.each(hash,function(value,key){
			$this.state[key]=value;
        
			v_type = typeOf(hash[key]);
			$this.stateCache[key] = (v_type=='string' || v_type=='number' || v_type =='boolean') ? value : JSON.encode(value);
				
                if ($this.options.compat){
                    $this.fireEvent(key+'-added',[value]);			
                    $this.fireEvent(key+'-changed',[value]);	
                }
                
			$this.fireEvent(key+':added',[value]);			
			$this.fireEvent(key+':changed',[value]);	
            $this.fireEvent(key,[value]);
		});
	},
	
	set : function(key,value){
		var newState = Object.clone(this.state);
		
		newState[key] = value;
		
		this.updateHash(this.options.delimiter + this.serializeHash(newState));
		
		return this;
	},
	
	remove : function(key){
		var newState = Object.clone(this.state);
		
		delete newState[key];
		
		this.updateHash(this.options.delimiter + this.serializeHash(newState));
		
		return this;
	}
});

})(document.id);
