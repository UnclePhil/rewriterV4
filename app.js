// url rewriter
// Unclephil 2011  tc.unclephil.net
// ================================
// Derived from well knowed http-proxy.js
// Is able to manage international domain name
// In this case the configuration must be in idn fom, NOT ASCII
// ============================================================
var http = require('http');
var fs   = require('fs');
var idn  = require('punycode');
var xrl  = require('url');

//defaultvalue for config
// TBD

//Load Config
var config = require('./config.js');

//END CONFIGURATION

var configlist = {};
var iplist    = [];

//watch config files , with this rewriter never stopp working
// if config files are not present, server is crashing
//
fs.watch(config.blacklistfile, function(c,p) { update_iplist(); });

fs.watch(config.filespath, { persistent: true }, function (e, f) {
  console.log("File "+f+" have been "+e);
  update_configdir();
});

// helper function
// PKO grep wrapper
// return all lines with requested data
var grep = function(what, where, callback){
  var exec = require('child_process').exec;
  exec("grep " + what + " " + where + " -nr", function(err, stdin, stdout){
    var list = {};
    var results = stdin.split('\n');
      // remove last element (it’s an empty line)
      results.pop();
      callback(results)
  });
}

//read the config directory
//load all files alphabetically
//inject data in object {"mysource":"mydestination","mysource2":"mydestination2"}
//
function update_configdir() {
  configlist={};
  console.log(config.msg.ConfigLoader);
  fs.readdir(config.filespath,function(err,files){
    if (err) throw err;
    files.sort().forEach(function(file){
      console.log(config.filespath+file);
      fs.readFile(config.filespath+file,{encoding: 'utf8'},function(err,data){

        if (err) {
          console.log(config.msg.ErrorReadConfig);
          configlist={};
        }
        else {
          line = 0;
          var dt = data.split('\n');
          dt.forEach(function(elem){
            //increment counter
            line += 1;
            //remove any crlf or blank in the line
            elem = elem.trim();
            // test if line is commented
            if (elem.charAt(0)!="#") {
              //split the 2 elements
              e = elem.split(',');
              if (e.length = 2) {
                 configlist[e[0]]=e[1];
              }
              else {
                console.log("Syntax error in ",config.filespath+file, "at line", line);
              }
            }
          });
        }
      });
    });
  });
}

//read the blacklist ip file and inject in array
function update_iplist() {
  fs.readFile(config.blacklistfile,{encoding: 'utf8'},function(err,data){
    if (err) {
      console.log(config.msg.ErrorReadBlacklist);
      iplist=[];
    }
    else {
      var iplist = data.split('\n');
    }
  });
}

//send error screen
function deny(response, message, code) {
  response.writeHead(code);
  response.write(config.msg.ErrorHeader);
  response.write(message+"\n");
  response.write((new Date).toGMTString()+"\n");
  response.end();
}

console.log("Rewriter starting");
update_configdir();
update_iplist();
http.createServer(function(request, response) {

  /// parsing of url
  var ip = request.headers['x-real-ip'] || request.connection.remoteAddress;
  var path = xrl.parse(request.url).path;
  var url = xrl.parse(request.url).pathname || "/";
  var search = xrl.parse(request.url).search || "";
  var params = xrl.parse(request.url).query || "";
  var host = request.headers['host'] || "";
  var method = request.method;

  console.log(params);
  // test blacklist ip
  if (iplist.indexOf(ip) >=0) {
    message = ip + ": " +config.msg.IpNotAllowed;
    deny(response, message, "401");
    console.log(ip + "," + request.method + "," + host+url +",401,IpDenied");
    return;
  }
  // reply to config url
  if (url == config.resturl){
    console.log(ip + "," + request.method + "," + host+url +",200,ShowConfig");
    console.log(Object.keys(configlist).length+config.msg.ConfigLength);
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(JSON.stringify(configlist, null, 4),'utf-8');
  }
  //test url
  else if (url == config.testurl){
    oldhost = params || "";
    oldloc = idn.toUnicode(oldhost);
    newloc = configlist[oldloc];
    //host not in list
    if (newloc=="" || newloc==null) {
      message = oldloc + " "+config.msg.ErrorHostNotDefined;
      deny(response, message,"404");
      console.log(ip + "," + request.method + "," + host+url +",404,-");
    }
    //host in list and rewrited
    else {
      sloc = newloc.rewrite('$1',url+search);
      console.log(ip + "," + request.method + "," + host+url +",301,"+sloc);
      response.writeHead(301,{'Location':idn.toASCII(sloc), 'Expires': (new Date).toGMTString()});
      response.end();
    }
  }
  // info url
  else if (url == config.infourl){
    oldhost = params || "";
    oldloc = idn.toUnicode(oldhost);
    newloc = configlist[oldloc];
    //host not in list
    if (newloc=="" || newloc==null) {
      message = oldloc + " "+config.msg.ErrorHostNotDefined;
      deny(response, message,"404");
      console.log(ip + "," + request.method + "," + host+url +",404,-");
    }
    //host in list and rewrited + check duplicate in config file
    else {
      console.log(ip + "," + request.method + "," + host+url +",200,"+newloc);
      grep( oldloc, config.filespath, function(list){
        response.writeHead(200);
        response.write("Requested: "+oldloc+"\n");
        response.write("Response : "+newloc+"\n");
        response.write("Config File content : \n");
        response.write(JSON.stringify(list.sort(), null, 2),'utf-8');
        response.write("\n"+(new Date).toGMTString()+"\n");
        response.end();
      });
    }
  }


  //process loaded host
  else {
    oldhost = host;

    oldloc = idn.toUnicode(oldhost);
    newloc = configlist[oldloc];
    //host not in list
    if (newloc=="" || newloc==null) {
      message = oldloc + " "+config.msg.ErrorHostNotDefined;
      deny(response, message,"404");
      console.log(ip + "," + request.method + "," + host+url +",404,-");
    }
    //host in list and rewrited
    else {
      sloc=newloc.replace('$1',url+search);
      console.log(ip + "," + request.method + "," + host+url +",301,"+sloc);
      response.writeHead(301,{'Location':idn.toASCII(sloc), 'Expires': (new Date).toGMTString()});
      response.end();
    }
  }
}).listen(config.port);
