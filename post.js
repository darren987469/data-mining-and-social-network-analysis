var async = require('async');
var graph = require('fbgraph');
var mongo = require('mongoskin');
var config = require("./config");

var since = new Date(2015, 4, 11);

// set graph access token
var access_token = config.access_token;
graph.setAccessToken(access_token);

var ids = config.ids;

var saveToDB = function(record) {
	var db = mongo.db("mongodb://localhost:27017/test", {native_parser:true});
	db.collection('post').insert(record, function(err, result) {
		if(err){
			console.log(err);	
			process.exit(1);
		} 
		else {
			console.log(result);
			db.close();
		}
	});
}

ids = [];
for(var i = 216; i < config.ids.length; i++) {
	ids.push(config.ids[i]);
}

// var id = "109327345774256";
// var id = "513479595342757";

// Main
async.eachSeries(ids, function(id, callback){
	var request = id + "?fields=posts{shares,id,created_time}";
	console.log("request:",request);
	graph.get(request, function(err, res) {
		if(err){ 
			console.log(err);
			process.exit(1);
		}
		//console.log("1 res:",res);
		
		var record = {
			id : res.id,
	   		posts : []
		};
		
		if(res.posts != undefined && res.posts.data.length > 0) {
			// first page
			for(var i in res.posts.data) {
				var post = res.posts.data[i];
				if(new Date(post.created_time) > since) {
					record.posts.push(post);
				}
			}
			
			var lastpost = res.posts.data[res.posts.data.length -1];

			// get next page data
			if(res.posts.paging != undefined 
				&& res.posts.paging.next != undefined
				&& new Date(lastpost.created_time > since)) {
				graph.get(res.posts.paging.next, function(err, res){
					if(err){ 
						console.log(err);
						process.exit(1);
					}
					else {
						for(var i in res.data) {
							var post = res.data[i];
							if(new Date(post.created_time) > since) {
								record.posts.push(post);
							}
						}
						//console.log("record:",record);	
						saveToDB(record);
						callback();
					}				
					});
			} 
			// no next page
			else {
				saveToDB(record);
				callback();
				//console.log("result:",record);
			}		
		} 
		// no post data, save to db
		else {
			//console.log("result:",record);
			saveToDB(record);
			callback();
		}
	});
});
