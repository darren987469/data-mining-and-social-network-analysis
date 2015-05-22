var graph = require('fbgraph');
var mongo = require('mongoskin');
var async = require('async');
var config = require("./config");
//var db = mongo.db("mongodb://localhost:27017/test", {native_parser:true});


var ids = config.ids;
var zip_tainan = [700,701,702,703,704,705,706,707,708,709,710,711,712,713,714,715,716,717,718,719,720,721,722,723,724,725,726,727,728,729,730,731,732,733,734,735,736,737,738,739,740,741,742,743,744,745];
//var access_token = 'CAACEdEose0cBAOGREVbfqHqHbZBcZCfRFjLyxswpXB1k76ZAghnn6lnwvzoArjVQTm2O12vJ0g4pRcc3xjNUfJuaY4jIomdcc2TlI012zuMqBK8dwrN8XRydujD0RXGXG6wMQsg48iGR0tQDhe86NjMcCB8kIq4BjNRD8th1D21L0wrBMIjZBDq58jZCq5OvH2MERpJ2ZAzuCOgMiNiZBwZBJZCBb8Xk5Oy4ZD';
graph.setAccessToken(config.access_token);

var buildQuery = function(id) {
  return {
    method: "GET",
    //relative_url: '/' + id + '?fields=id,talking_about_count,likes,location,were_here_count,name'
    relative_url: '/' + id + '?fields=id,talking_about_count,likes,were_here_count,name'
  };
}

// Main
// var idxs = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850];
var idxs = [900];
async.eachSeries(idxs, function(idx, callback){
	console.log("index:",idx);
	var batch = [];

	// for(var i = idx; i < (idx + 50); i++) {
 //    	batch.push(buildQuery(ids[i]));
	// }
	for(var i = idx; i < 914; i++) {
    	batch.push(buildQuery(ids[i]));
	}
	console.info("batches:", batch);

	graph.batch(batch , function(err, res) {
  		async.eachSeries(res, function(response, callback){
			var data = JSON.parse(response.body);
		
			var record = {
    			timestamp: new Date(),
				likes: data.likes,
				were_here_count: data.were_here_count,
				talking_about_count: data.talking_about_count
    		};
   
    		var db = mongo.db("mongodb://localhost:27017/test", {native_parser:true});
    
    		db.collection('history').update({id:data.id}, {
    			$push : { history: record}
    		},function(err, result) {
    			if(err) console.error(err);
    			if(result) console.log(result);
    			db.close();
    			callback();
    		});

		}, function(err) {
			if(err) console.error(err);
			callback();
		});
   
	});
});