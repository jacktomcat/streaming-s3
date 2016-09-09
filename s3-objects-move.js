var awstk = require('awstk');
var http = require('http');
var url = require("url");
 
var s3 = new awstk.s3({accessKeyId: "xxxxxx", secretAccessKey: "xxxxxx", region: "ap-northeast-1"});
					 
var log = require('simple-node-logger').createSimpleLogger('object-move.log');
log.setLevel('info');
 
var server = function(request, response) { 
    response.writeHead(200,{"Content-Type":"text/json"});
    var params = url.parse(request.url,true)
	var pathname = params.pathname;
	if(pathname.indexOf("/gs2s3")!=-1){
		var result = [];
		var query = params.query;
		var starttime=new Date().getTime();
		s3.moveFile("ottcloud", query.src, "ottcloud", query.dst, null, function(obj){
			var endtime = new Date().getTime();
			log.info(query.dst+"=====耗时===="+Math.floor((endtime-starttime)/1000));
		});
		response.write(JSON.stringify(params));
	}
    response.end();
}
 
http.createServer(server).listen(8888);  
console.log('server started'); 
 
 
var existsobj = function (key){
    
    s3.fileExists("ottcloud", key,function(d){
			if(d){
				var endtime = new Date().getTime();
				log.info(key+"=====耗时===="+Math.floor((endtime-starttime)/1000)+"=======true");
			}else{
				log.info(key+"=======false");
			}
	});
}
//log.info('Upload finished: ', resp);
