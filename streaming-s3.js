var streamingS3 = require('streaming-s3');
var request = require('request');
var http = require("http");
var url = require("url");
var log = require('simple-node-logger').createSimpleLogger('streaming.log');
log.setLevel('info');
 
var server = function(request, response) { 
    response.writeHead(200,{"Content-Type":"text/json"});
    var params = url.parse(request.url,true)
	//console.log(JSON.stringify(params));
	var pathname = params.pathname;
	if(pathname.indexOf("/gs2s3")!=-1){
		var result = [];
		var query = params.query;
        result['location'] = upload(query);
	    response.write(JSON.stringify(params));
	}
    response.end();
}
 
http.createServer(server).listen(8888);  
console.log('server started'); 
 
 
var upload = function(query){ 
    
	var rStream = request.get(query.url);
	var uploader = new streamingS3(rStream, {accessKeyId: 'xxxxx', secretAccessKey: 'xxxxxx'},
	  {
		Bucket: query.bucket,
		Key: query.key,
		ContentType: 'video/mp4'
	  },
	  {
		concurrentParts: 3,
		waitTime: 10000,
		retries: 1,
		maxPartSize: 10*1024*1024,
	  }
	);
	  
	uploader.begin(); //important if callback not provided. 
	 
	uploader.on('data', function (bytesRead) {
	  console.log(query.key+' :'+bytesRead, ' bytes read.');
	});
	 
	uploader.on('part', function (number) {
	  //log.info('Part ', number, ' uploaded.');
	});
	 
	// All parts uploaded, but upload not yet acknowledged. 
	uploader.on('uploaded', function (stats) {
	  //log.info('Upload stats: ', stats);
	});
	 
	uploader.on('finished', function (resp, stats) {
	  log.info('Upload finished: ', resp);
	});
	 
	uploader.on('error', function (e) {
	  log.info(query.key+' Upload error: ', e);
	});
	
}
