var fs=require("fs");
var parsehtml=require("./parsehtml");
var lists=[
	['dn','lst/dn.lst','genxml/dn.js'],
//	['mn','lst/mn.lst','genxml/mn.js'],
//	['sn','lst/sn.lst','genxml/sn.js'],
//	['an','lst/an.lst','genxml/an.js'],
]

var stringify=function(json){
	var out=[],r;
	for (var i in json) {
		if (!json[i])continue;
		r="";
		var r="{text:`"+json[i].text+"`\n,links:[\n";
		for (j=0;j< json[i].links.length;j++) {
			r+=JSON.stringify(json[i].links[j])+"\n";
		}
		r+="]},\n";
		out.push(r);

	}
	return "module.exports=[\n"+out.join("\n")+"]";
}
var getsid=function(fn,prefix){
	var n1="",n2="";
	var first2=prefix.substr(0,2);

	var at=fn.lastIndexOf("/");
	var	filename=fn.substr(at+1);
	n1=parseInt(filename);

	var at=fn.substr(0,at).lastIndexOf("/");
	var parent=fn.substr(at+1);
	n2=parseInt(parent);

	if (first2=="dn" || first2=="mn") {
		return prefix+n1;
	} else {
		return prefix+n2+"."+n1;
	}
}

var processfile=function(prefix,fn){
	var content=fs.readFileSync(fn,'utf8').replace(/\r?\n/g,"\n");
	var sid=getsid(fn,prefix);
	
	var body=parsehtml.getBody(content,prefix,fn);
	if (!body) {
		console.log("empty file",fn);
		return;
	}
	var parsed=parsehtml.parseBody(body,fn);

	return {text:parsed.text,links:parsed.links};
}
var processlist=function(lst){
	var files=fs.readFileSync(lst[1],'utf8').trim().split(/\r?\n/);

	//files.shift();
	//files.length=1;

	var out=files.map(processfile.bind(this,lst[0]));
	fs.writeFileSync(lst[2], stringify(out),"utf8");
}
lists.forEach(processlist);