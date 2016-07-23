var graph = require('fbgraph');
var mongo = require('mongoskin');
var async = require('async');
var config = require("./config");

var ids = config.ids;
graph.setAccessToken(config.access_token);

var buildQuery = function(id) {
  return {
    method: "GET",
    //relative_url: '/' + id + '?fields=id,talking_about_count,likes,location,were_here_count,name'
    relative_url: '/' + id + '?fields=id,talking_about_count,likes,were_here_count,name'
  };
}

// Main
var idxs = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900];

async.eachSeries(idxs, function(idx, callback){
	console.log("index:",idx);
	var batch = [];

	var upper;
	if(idx == 900) upper = 914;
	else upper = idx + 50;

	for(var i = idx; i < upper; i++) {
    	batch.push(buildQuery(ids[i]));
	}

	console.info("batches:", batch);

	graph.batch(batch , function(err, res) {
  		if(err) {
  			console.log(err);
  			process.exit(1);
  		}
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