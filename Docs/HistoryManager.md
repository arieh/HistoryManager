HistoryManager
===============
The class acts as a paramater stack, to monitor and modify the state of an aplication. Whenever a paramater withing the stack changes state, the class notifies it's followers of the change.

Methods:
--------
 * set (key,value) : used to set a state. Will set key's value. 
 * remove (key) : will remove key from the stack.
 * start : will start monitoring application state
 * stop : will stop monitoring application state
 
Events:
--------
The class main functionality cmes from it's events. In order to monitor the state of the application, you attach events to a monitored parameter.
They concise thus:

  * ' * -added' : will fire when a new value is added. will send the new value to the function
  * ' * -changed' : will fire when a value is modified. will send the new value to the function
  * ' * -removed' : will fire when a value is removed. will send the last value to the function
  
where * is the name of the paramater that was modified.

so, if we want our listener to monitor the state of a specified parameter - someValue, will will attach these events 'someValue-added','someValue-changed','someValue-removed'.
We can then use the setters (set/remove) to change the state of someValue, calling it's listeners.

Usage Example
--------------

	#JS
	var HM = new HistoryManager();
	
	