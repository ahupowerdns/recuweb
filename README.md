# recuweb
Recursor built-in website rapid development

![The graph](http://xs.powerdns.com/tmp/powerdns-recursor-live.gif "The graph")


To test, build a recursor from Git, and set in your recursor.conf (or on --commandline):

```
	experimental-webserver
	experimental-api-key=super-secret
	experimental-webserver-address=0.0.0.0
	experimental-webserver-port=8082
```

Next, load index.html from this repository and enter the '1.2.3.4:8082' and 'super-secret'
in the form above and press enter.

Graph and statistics should now load.

