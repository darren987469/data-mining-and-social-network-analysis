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
		if(err) console.log(err);
		else {
			console.log(result);
			db.close();
		}
	});
}

var id = "109327345774256";
// var id = "513479595342757";
// var request = id + "?fields=id,posts.limit(25){created_time}";

// error page id: 633479763374834 -> permantly closed
ids = [];
for(var i = 562; i < config.ids.length; i++) {
	ids.push(config.ids[i]);
}
// Parse 50 posts from page with specified page-id.
var request = id + "?fields=id,posts";
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
		
		if(res.posts) {
			// first page
			record.posts = [].concat(res.posts.data);
			
			// has next page
			if(res.posts.paging && res.posts.paging.next) {
				graph.get(res.posts.paging.next, function(err, res){
					if(err){ 
						console.log(err);
						process.exit(1);
					}
					else {
						record.posts = record.posts.concat(res.data);
						//console.log("record:",record);	
						saveToDB(record);
						
					}				
				});
			} 
			// no next page, save to db
			else {
				saveToDB(record);
				
			}	
		} 
		// no post data, save to db
		else {
			saveToDB(record);
		}
	});
/*
// Main
async.eachSeries(ids, function(id, callback){
	var request = id + "?fields=id,posts.limit(25){created_time}";
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
		
		if(res.posts) {
			// first page
			record.posts = [].concat(res.posts.data);
			
			// has next page
			if(res.posts.paging && res.posts.paging.next) {
				graph.get(res.posts.paging.next, function(err, res){
					if(err){ 
						console.log(err);
						process.exit(1);
					}
					else {
						record.posts = record.posts.concat(res.data);
						//console.log("record:",record);	
						saveToDB(record);
						callback();
					}				
				});
			} 
			// no next page, save to db
			else {
				saveToDB(record);
				callback();
			}	
		} 
		// no post data, save to db
		else {
			saveToDB(record);
			callback();
		}
	});
});
*/