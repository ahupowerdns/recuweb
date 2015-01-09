"use strict";

// var moment= require('moment');
var gdata={}

$(document).ready(function() {
    $.ajaxSetup({ cache: false });
    
    var server=$("#server").val();
    var password=$("#password").val();
    $("#server").change(function(e) {
	console.log("Changed!");
	server=$("#server").val();

    });
    $("#password").change(function(e) {
	password=$("#password").val();
    });

    var qpsgraph = new Rickshaw.Graph( {
	element: document.getElementById("qpschart"),
	width: 400,
	height: 200,
	renderer: 'line',
	series: new Rickshaw.Series.FixedDuration([{ name: 'one' }], undefined, {
            timeInterval: 1000,
            maxDataPoints: 100,
            timeBase: new Date().getTime() / 1000
	}) 
    } );
    var y_ticks = new Rickshaw.Graph.Axis.Y( {
	graph: qpsgraph,
	orientation: 'left',
	tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
	element: document.getElementById('qpsy_axis')
    } );

    qpsgraph.render();

    var cpugraph = new Rickshaw.Graph( {
	element: document.getElementById("cpuchart"),
	width: 400,
	height: 200,
	renderer: 'line',
	series: new Rickshaw.Series.FixedDuration([{ name: 'one' }], undefined, {
            timeInterval: 1000,
            maxDataPoints: 100,
            timeBase: new Date().getTime() / 1000
	}) 
    } );
    var y_ticks = new Rickshaw.Graph.Axis.Y( {
	graph: cpugraph,
	orientation: 'left',
	tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
	element: document.getElementById('cpuy_axis')
    } );

    cpugraph.render();
    function update()
    {

	$.ajax({
            url: 'http://'+server+'/jsonstat?command=stats&api-key='+password+'&callback=?',
            type: 'GET',
            dataType: 'jsonp',
            success: function(data, x, y) {
		$("#questions").text(data["questions"]);
		$("#over-capacity-drops").text(data["over-capacity-drops"]);
		$("#too-old").text(data["too-old-drops"]);
		$("#uptime").text(moment.duration(data["uptime"]*1000.0).humanize());
		$("#latency").text(data["qa-latency"]/1000.0);
		if(!gdata["sys-msec"]) 
		    gdata=data;

		var cpu=((1.0*data["sys-msec"]+1.0*data["user-msec"] - 1.0*gdata["sys-msec"]-1.0*gdata["user-msec"])/10.0);

		$("#cpu").text(cpu.toFixed(2));
		var qps=1.0*data["questions"]-1.0*gdata["questions"];
		$("#qps").text(qps);
		var totpcache=1.0*data["packetcache-hits"]-1.0*gdata["packetcache-hits"]+1.0*data["packetcache-misses"]-1.0*gdata["packetcache-misses"];
		if(totpcache > 0)
		    $("#phitrate").text((100.0*(data["packetcache-hits"]-1.0*gdata["packetcache-hits"])/totpcache).toFixed(2));
		else
		    $("#phitrate").text(0);
		
		qpsgraph.series.addData({ one: qps});
		qpsgraph.render();

		cpugraph.series.addData({ one: cpu});
		cpugraph.render();

		gdata=data;
            },
            error:  function() {
                alert('boo!');
            },
            beforeSend: function(xhr) { 
                xhr.setRequestHeader('X-API-Key', 'changeme');
		
		
		return true;
	    }
        });

	$.ajax({ url: 'http://'+server+'/servers/localhost?api-key='+password+'&callback=?', type: 'GET', dataType: 'jsonp',
		 success: function(data) {
		     $("#version").text("PowerDNS "+data["daemon_type"]+" "+data["version"]);
		 }
	       });


	$.getJSON('http://'+server+'/jsonstat?api-key='+password+'&command=get-query-ring&name=queries&callback=?', 
		  function(data) {
		      var bouw="<table><tr><th>Number</th><th>Domain</th><th>Type</th></tr>";
		      var num=0;
		      $.each(data["entries"], function(a,b) {
			  if(num++ > 30)
			      return;
			  if(b[1].length > 20)
			      b[1]=b[1].substring(0,20);

			  bouw=bouw+("<tr><td>"+b[0]+"</td><td>"+b[1]+"</td><td>"+b[2]+"</td></tr>");
		      });
		      $("#queryring").html(bouw);

		  });

	$.getJSON('http://'+server+'/jsonstat?api-key='+password+'&command=get-query-ring&name=servfail-queries&callback=?', 
		  function(data) {
		      var bouw="<table><tr><th>Number</th><th>Servfail domain</th><th>Type</th></tr>";
		      var num=0;
		      $.each(data["entries"], function(a,b) {
			  if(num++ > 20)
			      return;
			  if(b[1].length > 20)
			      b[1]=b[1].substring(0,20);
			  bouw=bouw+("<tr><td>"+b[0]+"</td><td>"+b[1]+"</td><td>"+b[2]+"</td></tr>");
		      });
		      $("#servfailqueryring").html(bouw);

		  });


    };
		 

    update();
    setInterval(update, 1000);
});
