var graph = require('fbgraph');
var mongo = require('mongoskin');
var async = require('async');
var config = require("./config");

var db = mongo.db("mongodb://localhost:27017/test", {native_parser:true});

// merge data from restaurant coll and history coll
var ids = config.ids;


async.eachSeries(ids, function(id, callback){
	
	// get posts
	db.collection('newpost').findOne({id:id},function(err, result){
		if(err) {
			console.log(err);
			process.exit(1);	
		} else {
			var posts = result.posts;
			
			// get location
			db.collection('restaurant').findOne({id:id},function(err, result) {
				if(err) {
					console.log(err);
					process.exit(1);	
				} 
				else {
					var record = {
		    			timestamp: new Date(2015,4,11),
						likes: result.likes,
						were_here_count: result.were_here_count,
						talking_about_count: result.talking_about_count
		    		};
		    		var location = result.location;
					
					// get history
					db.collection('history').findOne({id:id}, function(err, result){
						if(err){
							console.log(err);
							process.exit(1);	
						} 
						else {
							result.location = location;
							result.history.unshift(record);
							result.posts = posts;
							//console.log(result);
							
							// combine data and insert to data collection
							db.collection('data').insert(result, function(err, result){
								if(err){
									console.log(err);
									process.exit(1);
								} 
								else {
									console.log(result);
									db.close();
									callback();	
								}	
							});
						}
					});
				}
			});
		}
	}); 
	
});

 
