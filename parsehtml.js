var cleanups=require("./cleanups");
var pb_bjt="";
var replaceEntity=function(content){
	return content.replace(/&#(\d+);/g,function(m,m1){
		if (!isNaN(parseInt(m1))) {
			return String.fromCharCode(parseInt(m1));
		} else {
			return m;
		}
	}).replace(/&ntilde;/g,"ñ").replace(/&Ntilde;/g,"Ñ");
}
var getBody=function(content,prefix,fn){
	content=content.replace("</P></BODY>","");
	var start=content.indexOf("<P>");
	var end=content.lastIndexOf("</P>");
	var body=content.substring(start,end);
	body=replaceEntity(body);
	return body;
}

var parsePNum_Note=function(content,fn){
	var pcount=0,notegroup,lastPNum=0, lastNNum=0;
	return content.replace(/<P>(\d+)\. ?([\S\s]*?)<\/FONT> <\/P>/g,function(m,m1,m2){
		var N=parseInt(m1);
		if (m1=="1") {
			if (pcount) {
				notegroup=true;
				lastNNum=0;
			} else {
				notegroup=false;
			}
		}
		pcount++;
		if (notegroup && N==lastNNum+1) {
			lastNNum=N;
			var extra="";
			m2=m2.replace(/,? ?\[P T S\.\]/,function(){
				extra=' source="pts"';
				return "";
			}).replace(/,? ? ?\[PTS\] ?/,function(){
				extra=' source="pts"';
				return "";				
			});
			return '<ndef n="'+m1+'"'+extra+'>'+m2+"</ndef>";
		} else if (N==lastPNum+1) {
			if (notegroup) notegroup=false;
			lastPNum=N;
			return '<p n="'+m1+'">'+m2+'</p>';
		} else {
			lastPNum=N;
			console.log("error pnum",lastPNum,lastNNum,m1,notegroup);
			return '<p n="'+m1+'" s="?">'+m2+"</p>";
		}

		
	});
}

var parsePTSPage=function(content,fn){
	return content.replace(/\[PTS Page (\d+)\] \[\\q (\d+)\/\]/g,function(m,m1,m2){
		if (parseInt(m1)!==parseInt(m2)) {
			console.log("error pts page",fn,m1,m2)
		}
		return '<pb s="pts" n="'+m2+'"/>';
	});
}
var parseVol=function(content,fn){
	return content.replace(/<FONT FACE="Times Ext Roman" SIZE=(\d)>\[PTS Vol (.) - \d\] \[\\z (.) \/\] \[\\f (.) \/]<\/FONT> <BR>\n/g,function(m,m1,m2,m3,m4){
		return '<VOL type="pts" id="'+m2+m1+'"/>';
	}).replace(/<FONT FACE="Times Ext Roman" SIZE=(\d)>\[BJT Vol (.) - \d\] \[\\z (.) \/\] \[\\w (.) \/]<\/FONT> <BR>\n/g,function(m,m1,m2,m3,m4){
		return '<VOL type="bjt" id="'+m2+m1+'"/>';
	});
}
var parseHeader=function(content,fn){
	return content.replace(/<FONT FACE="Times Ext Roman" SIZE=(\d)>(.+?)<\/FONT> <BR>/g,function(m,m1,m2){
		return "<H"+m1+">"+m2+"</H"+m1+">";
	});
}
var parseSuttaname=function(content,fn){
	return content.replace(/<FONT FACE="Times Ext Roman" SIZE=5>(.+?)<\/P>/g,function(m,m1){
		return "<sutta>"+m1+"</sutta>";
	});	
}
var parseBJTPage=function(content,fn){
	return content.replace(/<P>\[BJT Page (\d+)\] \[\\x (\d+)\/\]<\/FONT> <\/P>/g,function(m,m1,m2){
		if (parseInt(m1)!==parseInt(m2)) {
			console.log("error bjt page",fn,m1,m2)
		}
		return '<pb s="bjt" n="'+m2+'"/>';
	}).replace(/\[BJT Page (\d+)\] \[\\x (\d+)\/\]/g,function(m,m1,m2){
		if (parseInt(m1)!==parseInt(m2)) {
			console.log("error bjt page",fn,m1,m2)
		}
		return '<pb s="bjt" n="'+m2+'"/>';
	})
}

var parseNormalP=function(content,fn){
	return content.replace(/<P>([\S\s]+?)<\/FONT> <\/P>/g,function(m,m1){
		return "<p>"+m1+"</p>";
	});
}
var parseBody=function(body,fn){
	body=parseBJTPage(body);
	body=parsePTSPage(body);
	body=parsePNum_Note(body,fn);
	body=parseVol(body,fn);
	body=parseSuttaname(body,fn);
	body=parseHeader(body,fn);
	body=parseNormalP(body);

	for (var i=0;i<cleanups.length;i++){
		body=body.replace(cleanups[i][0],cleanups[i][1]);
	}
	return {text:body,links:[]};
}
module.exports={getBody,parseBody};