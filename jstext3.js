var Browser = require("zombie");
var util = require('util');
var request = require('request');
//var flow = require('nimble');
var async = require('async');

// Load test page
browser = new Browser();
browser.debug = true;
browser.runScripts = false;
var site="http://www.washingtonpost.com/";//MUST END WITH /
browser.visit(site, function () {
	var externalScripts=[];
	var controlScripts=[];
	var internalLength=0;
	var externalLength=0;
	var controlLength=0;

	async.series([
    function(callback){
			console.log("site: "+site);
		  // tasks here
		  console.log("title: "+browser.text("title"));
		  console.log("body: "+browser.text("body").length)//includes script tags
		  //console.log("body: "+browser.text("body"))
		  console.log("html in body: "+browser.html("body").length);

		//  console.log("-------------------------------");
		//  console.log(browser.text("body").substring(0,3000))
		// console.log("-------------------------------");
		//  console.log(browser.html("body").substring(0,3000))
		// console.log("-------------------------------");
		  
		  var scripts=browser.queryAll("script");
		  console.log("Number of scripts: "+scripts.length);

		  //iterate to get totals and arrays of external scripts
		  var x;
		  for (var i in scripts) {
		    if (scripts[i].getAttribute("src")!=null){
		    	x=scripts[i].getAttribute("src");
		    	if (x.substring(0,1)!="h"){
		    		x=site+x
		    	}
		    	externalScripts.push(x);
		    	console.log(i+"  "+x+" ("+externalScripts.length+")");
		    	//console.log(i+"  "+scripts[i].innerHTML);
		    }else if (scripts[i].getAttribute("data-cjssrc")!=null){
		    	controlScripts.push(scripts[i].getAttribute("data-cjssrc"));
		    	console.log(i+" "+scripts[i].getAttribute("data-cjssrc")+" ("+controlScripts.length+")");
		    }else{
		    	internalLength=internalLength+scripts[i].text.length;
		    	console.log(i+" "+scripts[i].text.length+" of "+internalLength);
		    	//console.log("---------------------------\n "+scripts[i].text+"---------------------------\n ")
		    }
		  }
		  callback();
		},
		function(callback){
		  //get each external script and check length
		  console.log('-------externalScripts');

// async.each(scripts, function(url, next) {
// 	// do stuff
// 	request() {
// 		next()
// 	}
// }, callback)

			async.each(externalScripts,//array of external scripts
				function(url, next){
					request(url, function(error, response, body) {
						if (typeof body != 'undefined'){
							externalLength=externalLength+body.length;
							console.log("e "+body.length+" of "+externalLength+" for "+url);
							next();
						}
					})
				},callback
			)
			console.log("at end of externalGets")
		},
		function(callback){
			console.log('-------controlScripts');
			async.each(controlScripts,//array of external scripts
				function(url,next){
					request(url, function(error, response, body) {
						if(typeof body === "string"){
							controlLength=controlLength+body.length;
							console.log("c "+body.length+" of "+controlLength+" for "+url);
						} else {
							console.log (url+": null");
						}
						next();
					});
				},callback
			)
		},
    function(callback){
			var grandLength=externalLength+controlLength+internalLength;
			var textLength=browser.text("body").length;
		  console.log("Total internal="+internalLength);
		  console.log("Total external="+externalLength);
		  console.log("Total control="+controlLength);
		  console.log("GRAND TOTAL SCRIPTS="+grandLength);
		  console.log("Text="+textLength);
		  console.log("Actual Text="+(textLength-internalLength));
		  console.log("Ratio: "+ grandLength/(textLength-internalLength));
		  //console.log(browser.html());
		  
		  //console.log(util.inspect(scripts));
		  callback();
		}
	]);
});


/*
Start with array of sites like washingtonpost.com
Each read with zombie
	Get text character total

	Get javascript character total
		Each script tag
			If not scr get text character total
			If scr 
				Read file and get count

	Store result in Json {"pubName": , "pubUrl": , "js": 9999, "text", 999}

*/