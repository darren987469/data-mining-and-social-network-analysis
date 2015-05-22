var async = require('async');
var graph = require('fbgraph');
var mongo = require('mongoskin');
var config = require("./config");

var since = new Date(2015, 4, 11);

// set graph access token
var access_token = config.access_token;
graph.setAccessToken(access_token);

var ids = config.ids;

var buildPostQuery = function(id) {
	return {
		method: "GET",
	    relative_url: '/' + id + "?fields=id,posts.limit(25){created_time}"
	};
}

// Main
var idxs = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850];
//var idxs = [900];
var morelist = [];
/*
async.eachSeries(idxs, function(idx, callback){
	console.log("index:",idx);
	var batch = [];

	// TODO
	for(var i = idx; i < (idx + 50); i++) {
    	batch.push(buildPostQuery(ids[i]));
	}
	// for(var i = idx; i < 915; i++) {
 //    	batch.push(buildPostQuery(ids[i]));
	// }
	
	//console.info("batches:", batch);

	graph.batch(batch , function(err, res) {
  		if(err) console.log(err);
  		async.eachSeries(res, function(response, callback){
			
			var data = JSON.parse(response.body);
   			//console.log(data);
   			var db = mongo.db("mongodb://localhost:27017/test", {native_parser:true});

   			var post;
   			if(data.posts) {
   				post = {
   					id : data.id,
   					posts :	data.posts.data
   				};
   				var lastIndex = data.posts.data.length;
   				console.log(data.id);
   				console.log(lastIndex);
   				
   				if(new Date(data.posts.data[lastIndex-1].created_time) > since) {
   					morelist.push(data.id);
   					callback(data.id);
   				}

   			} else {
   				post = {
   					id : data.id,
   					posts : []
   				};
   				
   			}
   			callback();
   			// db.collection('post').insert(post, function(err, result) {
   			// 	if(err) console.log(err);
   			// 	else {
   			// 		console.log(result);
   			// 		db.close();
   			// 		callback(); // callback for res
   			// 	}
   			// });
    	}, function(err) {
			if(err) console.error("err:",err);
			console.log("morelist:",morelist);
			callback(); // callback for idx 
		});
   
	});
});
*/
var id = "109327345774256";

var getPost = function(posts) {
	var result = [];
	
	for(var i in posts) {
		var post = posts[i];
		// get post after 5/11
		if(new Date(post.created_time) > since) {
			result.push(post);
		} else {
			return result;
		}
	}
	
	return result;
}


var isNextPage = function(posts) {
	var post = posts[posts.length -1];
	return (new Date(post.created_time) > since)? true:false;
}
/*
var request = id + "?fields=id,posts.limit(25){created_time,updated_time}";
graph.get(request, function(err, res) {
	if(err) console.log(err);
	console.log(res);
	var result = [];
	if(res.posts) {
		result = result.concat(getPost(res.posts.data));
		console.log("result:",result);
		// has next page
		if(isNextPage(res.posts) && res.paging && res.paging.next) {
			graph.get(res.paging.next, function(err, res){
				return;
			});
		}	
	}
	// TODO no data -> no post
	else {

	}
});*/

var request = id + "?fields=id,posts.limit(25){created_time,updated_time}";
var nextPage = true;
var result = [];
async.doWhilst(
	function(callback) {
		graph.get(request, function(err, res) {
			console.log("1 nextPage:", nextPage);
			if(err) console.log(err);
			console.log(res);
			if(res.posts) {
				result = result.concat(getPost(res.posts.data));
				nextPage = isNextPage(res.posts.data);
				if(nextPage) {
					request = res.posts.paging.next;
				}
			} else {
				nextPage = false;
			}
			console.log("nextPage:", nextPage);
			callback();
		});
	}, function() {
		return nextPage;
	}, function(err) {
		console.log("result:",result);
	}
);

