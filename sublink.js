//            Sublink ver 0.1.A

// set up config

var video = "myVideo";
var srtfile = "linus.srt";
var hyperlist = "hyperlist.json";

var OnScreenTitles = true;
var ShowDropDown = true;
var ShowTimeStamp = true;
var ShowControls = false;
var linkmatch_regex = /\{\d{1,4}\}/gmi;

//-----------------------------------------------------------------------------------------
var tick = 0 ;
var ticking = false;
var srt = document.getElementById("srt");
var transcript = document.getElementById("transcript");
var timeStamp = document.getElementById("timeStamp");
var controls = document.getElementById("controls");
var paused = false;
var titlestart =[] ;
var titlestop = [] ;
var lastStop = 0;
var lastStart = 0; 
let linklist;

if (OnScreenTitles) srt.style.display = "block";
else srt.style.display = "none";
if (ShowDropDown) transcript.style.display = "block";
else transcript.style.display = "none";
if (ShowTimeStamp) timeStamp.style.display = "block";
else timeStamp.style.display = "none";
if (ShowControls) controls.style.display = "block";
else controls.style.display = "none";



async function wrangleSubs(){

    let linkres = await fetch(hyperlist);
    linklist = await linkres.json();
    let subtitles = await fetch(srtfile).then(function(response){
        return response.text();
    });
    var index = 0; 
    var lines = subtitles.split(/\s\s/g);
    subs = "<select id='opts' class = 'transcript' onchange='selected(this.value)'><option value = '00:00:00,000'>Transcript</option>";
    for (x = 0; x < lines.length; x ++){
        if (lines[x].length != 0)
        if (lines[x].match(/\d{1,4}$/g) )
        {
            if (lines[x].match(/\d{1,2}:\d{1,2}:\d{1,2}/g) ) {
                titlestart[index] = tsToTick(lines[x].substring(0,12));
                titlestop[index]  = tsToTick(lines[x].substring(17,17 + 12));
                console.log(index.toString() + "-" + titlestart[index]);
                index ++;
                subs += "<option value = '"+ lines[x].substring(0,12) + "'>";
            }
            else {
                if(x > 1) subs += "</option>";
            }
        }
        else {
            subs += parseLinks(linklist,lines[x]);
        }
    }
    subs += "</select>";
    transcript.innerHTML = subs;
}

wrangleSubs();

function parseLinks(linkArray,line){
    
    for (i in linkArray.Search){
        
        match = linkArray.Search[i];
        matches = line.match(new RegExp(match));
        if (matches != null) {
            buff = line;
            fragments = buff.split(match);
            line = fragments[0] + match +"{" + i.toString() + "}"  + fragments[1];
        }
    }
    return line;
}

function checkTime(mill){
     return mill >= tick;
}

var timer = setInterval(function(){ 
    
    if (ticking){ 
        syncVideo();
        timeStamp.innerHTML = tickToTS(tick);
        
        stopidx = titlestop.findIndex(checkTime);
        if (stopidx != lastStop) {
            lastStop = stopidx;
            srt.innerHTML = "";
            
        }
        startidx = titlestart.findIndex(checkTime);
        if (startidx != lastStart) {
            lastStart = startidx;
            x = document.getElementById("opts").selectedIndex = startidx;

            buff = document.getElementById("opts").options[startidx].text;
            
            matches = buff.match(linkmatch_regex);
            if (matches != null){

                var index = matches.toString();
                index = index.substring(1);
                index = index.substring(-1);
                index = parseInt(index)
                var link = linklist.Link[index];
                var linktext = linklist.Search[index];
                var hyperText = buff.replace(linktext+matches,"<a id='_link' href='"+ link +"' target='_blank' >"+ linktext +"</a>");
                srt.innerHTML = hyperText;
                var linktarget = document.getElementById('_link');
                linktarget.addEventListener('mouseenter',function (event) {
                    document.getElementById("_link").style.color = "orange";
                });
                linktarget.addEventListener('mouseleave',function (event) {
                    document.getElementById("_link").style.color = "white";
                });
                console.log(link);
               
            }else{
            
            srt.innerHTML = buff;
        }    }
    }
}, 10);

var vid = document.getElementById(video);

/*
*/
srt.addEventListener('click', function (event) {

    if (paused){
        vid.play();
        paused=false;
    } else { 
        vid.pause();
        paused=true;
    }
});

vid.onplay = function() {
    ticking = true;
}

vid.onpause = function() {
    ticking = false;
}

vid.onseeking = function(){
    tick =  Math.floor(vid.currentTime * 1000);
}

function selected(time){
    vid.currentTime = tsToTick(time) / 1000;
}
function tickToTS(tick){
    var result = "";
    
    mill = tick % 1000;
    secs  = Math.floor(tick / 1000) % 60;
    mins = Math.floor(tick / 60000) % 60;
    hrs = Math.floor(tick / 6000000) % 60;

    result = hrs.toString().padStart(2,'0');
    result += ":";
    result += mins.toString().padStart(2,'0') ;
    result += ":";
    result += secs.toString().padStart(2,'0'); 
    result += ","; 
    result += mill.toString().padStart(3,'0');
    return result ;//+ ":" + tsToTick(result).toString() + ":" + tick.toString();
}
function tsToTick(TS){
    var result = 0;
    var lines = TS.split(',');
    var segs = lines[0].split(':');
    var mils = 0;
    
    mils = parseInt(lines[1]);
    mils += 1000 * parseInt(segs[2]);
    mils += 60000 * parseInt(segs[1]);
    mils += 6000000 * parseInt(segs[0]);
    return mils;
}
function syncVideo(){
    tick =  Math.floor(vid.currentTime * 1000);
}
