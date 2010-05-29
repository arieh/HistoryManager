HistoryManager
===============
The class acts as a parameter stack, to monitor and modify the state of an application. Whenever a parameter withing the stack changes state, the class notifies its followers of the change.

Methods:
--------
 * set (key,value) : used to set a state. will set key's value. 
 * remove (key) : will remove key from the stack.
 * start : will start monitoring application state
 * stop : will stop monitoring application state
 
Events:
--------
The class main functionality comes from its events. In order to monitor the state of the application, you attach events to a monitored parameter.
They concise thus:

  * ' * -added' : will fire when a new value is added. will send the new value to the function
  * ' * -changed' : will fire when a value is modified. will send the new value to the function
  * ' * -removed' : will fire when a value is removed. will send the last value to the function
  
where * is the name of the parameter that was modified.

so, if we want our listener to monitor the state of a specified parameter - someValue, will will attach these events 'someValue-added','someValue-changed','someValue-removed'.
We can then use the setters (set/remove) to change the state of someValue, calling its listeners.

Usage Example
--------------

	#JS
	var HM = new HistoryManager();
	
	HM.addEvent( 'MyVar-added'   , function(myvar){console.log('added '+myvar)} );
	HM.addEvent( 'MyVar-changed' , function(myvar){console.log('changed '+myvar)} );
	HM.addEvent( 'MyVar-removed' , function(myvar){console.log('removed '+myvar)} );
	
	// it is strongly recomended to set the events before starting the object
	HM.start();
	
	HM.set('MyVar',1); //will log 'added 1'
	HM.set('MyVar',2); //will log 'changed 2'
	HM.set('MyVar',3); //will log 'changed 3'
	HM.remove('MyVar');//will log 'removed 3'
	
	/* 
	 * pressing back button will do the following:
	 * 1. added 3
	 * 2. changed 2
	 * 3. changed 1
	 * 4. removed 1
	 */
	
	
