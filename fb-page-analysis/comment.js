var async = require('async');
var graph = require('fbgraph');
var mongo = require('mongoskin');
var config = require("./config");

// set graph access token
var access_token = config.access_token;
graph.setAccessToken(access_token);

var ids = config.ids;

// 5/11
var since = new Date(2015, 4, 11);

//var id = "456665787772291";
ids = [];
for(var i = 857; i < config.ids.length;i++){
	ids.push(config.ids[i]); 
}
async.eachSeries(ids, function(id, callback){
	var db = mongo.db("mongodb://localhost:27017/test", {native_parser:true});
	db.collection('post').findOne({id:id}, function(err, result){
		if(err) {
			callback(err);
		}
		else {
			/*
				{id: "id",
				 posts: []}
			*/
			console.log("post:",result);
			var record = result;
			var posts = [];
			
			// add post like count to every post record
			async.eachSeries(result.posts, function(post, callback){
				var pid = post.id;
				var request = '/' + pid + '/likes?summary=true';
				
				// get post like count
				graph.get(request, function(err, res){
					if(err)	callback(err);
			  		else{
			  			post.like = res.summary.total_count;
			  			
			  			// get post comment count
			  			var req = '/' + pid + '/comments?fields=like_count&summary=true';
			  			console.log(req);
			  			graph.get(req, function(err, res) {
			  				if(err) callback(err);
			  				else {
			  					console.log(res);
			  					if(res.summary && res.summary.total_count) {
			  						post.comment_count = res.summary.total_count;	
			  					} else {
			  						post.comment_count = 0;
			  					}
			  					posts.push(post);
			  					callback(); // callback for post
			  				}
			  			});
			  		}
				});
			}, function(err) {
				if(err) {
					console.log(err);
			  		process.exit(1);	
				} else {
					record.posts = posts;
					// save record to database
					db.collection('newpost').insert(record, function(err, result){
						if(err) {
							console.log(err);
							process.exit(1);
						} 
						else{
							console.log(result);
							db.close();
							callback(); // callback for ids
						}

					});
					
				}
			});
		} 
	});
});
