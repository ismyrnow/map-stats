var express = require('express');
var	stats = require('../public/data/stats');
var fs = require('fs');

var grouped = [];
for (var i in stats) {	
	if (!stats[i].time) continue;

	var index = stats[i].category + "||" + stats[i].use;
	var group = grouped[index];
	
	if (group) {
		group.min = Math.min(group.min, stats[i].time);
		group.max = Math.max(group.max, stats[i].time);
		group.med = ((group.med * group.count) + parseInt(stats[i].time)) / (group.count + 1);
		group.count = group.count + 1;
	} else {
		grouped[index] = {
			min: stats[i].time,
			max: stats[i].time,
			med: stats[i].time,
			count: 1
		};
	}
}

var app = express.createServer();
app.use(express.static(__dirname + '/../public'));

console.log("serving on localhost:3000")
app.listen(3000);