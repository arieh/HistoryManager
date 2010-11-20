HistoryManager
================
This library consists of 2 Classes:

  * HashListener : Supplies a very simple interface to mimic a cross-browser back/farward buttons functionality through the browser hash. It uses only 1 method to do this - updateHash, and only 1 Event - 'hash-changed'.
  * HistoryManager : This class is built on-top of the HashListener to supplly an Observer interface to the HashListener.

I've patched quite a lot of code together to implement the HashListener (and probably will find myself patching some more later on).
The Main code sources i used are:

  * Dave De Vos supplied me with a very good Moo implemenetation that he worked out from several other sources (such as YUI and LittleHistoryManager)
  * Digitarald's HistoryManager, which was originaly made for Moo 1.1. His IE method is by now the best I've seen used and is the one used for this class.

The class started as a prooof-of-concept for a Domain Observer. Thus, this class still needs a lot of testing to be made. 
  
Tested With: FF3.5, Safari 4.0.4, Safari 5, Chrome 3, Opera 10.10 and IE6, IE7 emulation (throught the IE8 developer interface) and IE8. 

![Screenshot](http://github.com/arieh/HistoryManager/raw/master/screenshot.png)


*NOTE: this version's events are incompatible with versions prior to 1*

*NOTE: As of v.1.3 the class only support mootools 1.3. 1.2 is considered stable, so if you need 1.2.4 support you can download it instead*

How To Use
-------------
For both classes, you must supply a blank.html (comes with the package), and point the classes to it (for IE<8 support). by default the classes assume it's location at the root dir.

### Hash Listener

This class supplies a very simple interface for modifying the browser hash in a way that supports a back/farward behavior to all browsers (theoretically).
How To Use:

	#JS
	var HM = new HashListener();
	
	//add an event listener to the manager
	HM.addEvent('hashChanged',function(new_hash){
		console.log(new_hash);
	});
	
	HM.start(); //Will start listening to hash changes
	
	HM.updateHash('a string'); //will log 'a string'
	HM.updateHash('another string'); //will log 'another string'
	
note that updateHash changes the hash completely.

### History Manager

This class extends the HashListener to supply a richer interface that allows multiple states to be kept together.
It supplies a Domain Observer. This means that you can register your classes through it, and let it transact data between different classes and layers of the site. 
It's usage can be a bit confusing but it actually tries to use JavaScript's event driven syntax:
	
	#JS
	var HM = new HistoryManager();
	
	/*
	 * Adding events to the observer. 
	 * Should be done before observer is started, so that they will 
	 * also be used when site is opened from history/bookmark.
	 */
	HM.addEvent('someValue:added',function(new_value){
		console.log('someValue was added:'+new_value);
	});
	HM.addEvent('someValue:updated',function(new_value){
		console.log('someValue was changed:'+new_value);
	});
	HM.addEvent('someValue:removed',function(last_value){
		console.log('someValue was removed:'+new_value);
	});
	
	HM.start();
	
	HM.set('someValue',1); //will log 'someValue was added:1'
	HM.set('someValue','aaa'); //will log 'someValue was changed:aaa'
	HM.remove('someValue'); //will log 'someValue was removed:aaa'
	HM.set('someValue','bbb'); //will log 'someValue was added:bbb'
	

Note that this can be done with multiple value names, and can use any JSON-encodable data format as values (such as strings, arrays and objects).

Another note - because of the way the hash is analyzed, changing the order of the inner members of a value will cuase a state-change event. This is because i'm convering the objects to JSON instead of parsing them to save speed.
If you do not controll the order of the values in your objects, make sure you check this manuly.
An Example for this:
	
	#JS
	HM.set('someValue',{a:'a',b:'b'});
	HM.set('someValue',{b:'b',a:'a'}); //will fire someValue-changed although values aren't actualy modified. 

Options
---------
Both classes use the same options:

  * blank_page : an alternative source for an iframe file. *note that the file must be valid for IE<8 support*
  * start : whether to start service on creation (default:false). this is not recomended, since you want the events to be registered before starting the class up.
 
  
HistoryManager comes with these additional options:

 * delimiter - (`string`: defaults to '') a beginning delimiter to add to the hash, to support the new Google AJAX syntax (#!)
  * serializeHash - `String function (aHash)` (_Optional_, use with `deserializeHash`) A callback function which serializes a Hash
  * deserializeHash - `Hash function (aString)` (_Optional_, use with `serializeHash`) A callback function which deserializes a String to a Hash
  * compat - (`boolean` : defaults to `false`) whether to file deprecated event style as well (`key-added` aongside `key:added`) 


#### Delimiter Usage:
	var HM = new HistoryManager({delimiter:'!'}); //will add support for the google syntax
	
#### Custom (de)serializer Usage:

	var HM = new HistoryManager({
		'delimiter':'!',
		serializeHash: function (h) {
			return h.toQueryString();
		},
		deserializeHash: function (s) {
			return new Hash(s.parseQueryString());
		}
	});


Events
-------
### Hash Listener

  * 'hashChanged' : will fire whenever the hash was changed (whether by the back-button or the class's methods). will send the new hash as a paramater to the function

### History Manager

The class is event-based, but doesn't have prefixed events. The events change according to the key being observed. 
The names point to one of 3 states a value might be in: Added, Changed and Removed.

For every change that goes on on a specific key, an event with that key's name will be fired, passing it's value as parameter.

<small>As of v1.1, all event names will be using colon seperation. For dash seperation, use the compat options.</small>

  * `key`':added' : will be fired when an unset key is given a value. will pass the new value as parameter.
  * `key`':updated' : will be fired when a current key's value was changed. will pass the new value as parameter.
  * `key`':removed' : will be fired when a key has been removed from the state. will pas the key's last value as parameter.
  * `key`':changed' : will fire when any a key is added/updated. will pass the new value as parameter. *NOTE: this will fire alongside the add/updated events*
 
