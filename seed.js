#!/usr/bin/env node

var tele = require("./index.js");
var fs = require("fs");
var path = require("path");
var argv = require("optimist")
  .default("id", "./seed.json")
  .default("port", 42424)
  .default("bridge", true)
  .boolean("v").describe("v", "verbose")
  .boolean("nolan").describe("nolan", "disable lan usage")
  .argv;

if(argv.v) tele.debug(console.log);
tele.info(function(){console.log.apply(console,arguments)});

if(argv.port == 42420)
{
  console.log("that port is reserved");
  process.exit(1);
}

// localize our id file
argv.id = path.resolve(argv.id);
if(argv.seeds) argv.seeds = path.resolve(argv.seeds);

tele.init(argv, function(err, seed){
  if(!seed) return console.log("something went wrong :(",err) || process.exit(1);
  console.log("PATHS",seed.paths);
  var ip4 = seed.paths.pub4 || seed.paths.lan4;
  var ip6 = seed.paths.pub6 || seed.paths.lan6;
  var info = {paths:[], parts:seed.parts, keys:seed.keys};
  info.paths.push({type:"ipv4",ip:ip4.ip,port:ip4.port});
  if(ip6) info.paths.push({type:"ipv6",ip:ip6.ip,port:ip6.port});
  if(seed.paths.http.http) info.paths.push({type:"http",http:seed.paths.http.http});
  else info.paths.push({type:"http",http:"http://"+ip4.ip+":"+seed.paths.http.port});
  
  var seeds = {};
  seeds[seed.hashname] = info;
  console.log(JSON.stringify(seeds,null,2));
  console.log("connected to "+Object.keys(seed.lines).length+" mesh seed peers");
});
