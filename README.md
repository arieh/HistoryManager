HistoryManager
========
This class is intended to supply a back-button functionality to JS actions. It is also a way to implement an Observer pattern in JS. 
To supply the back button functionality i've ported the detection methods from digitarald's HistoryManager, which is built on top of Moo 1.1.

Tested With: FF3.5, Safari 4.0.4, Chrome 3 and IE8. IE6-7 work as well, but require double-click on the back button to acualy go back (no idea why...)

How to use
----------
The class is quite simple. it is basicly a domain event listner. 
It can monitor and modify the values of assigned parameters, and fire events when thier values are modified.
First, we create an Instance:

    #JS
	var hm = new HistoryManager;
	
Next, lets say we want to follow an action called PageNum. Atatching its events will look like this:
   
    #JS
    hm.addEvent('PageNum-added',function(value){
        console.log('a new Page Number:'+value);
    });
   
    hm.addEvent('PageNum-changed',function(value){
        console.log('Page Number changed:'+value);
    });
    
    hm.addEvent('PageNum-removed',function(value){
        console.log('a Page Number was removed:'+value);
    });

Now we can start the service:
    
    #JS
    hm.start();	
	
We can now assign the values of PageNum, firing its events and registring the changes to the browser history:

    #JS
	hm.set('PageNum',1); //will fire PageNum-added with value of 1
	hm.set('PageNum',2); //will fire PageNum-chenged with value of 2
	hm.remove('PageNum'); //will fire PageNum-removed with value of 2

The set method can recieve any JSON compatible value. 

Options
---------
  * iframeSrc : an alternative source for an iframe file
  * start : whether to start service on creation (default:false)

Events
-------
The class's events are not pre-defined, but concice as such:

  * '-added' : will fire when a new value is added. will send the new value to the function
  * '-changed' : will fire when a value is modified. will send the new value to the function
  * '-removed' : will fire when a value is removed. will send the last value to the function
