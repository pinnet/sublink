//            Sublink ver 0.1.A

// set up config
var video = "myVideo";
var url = "test.srt";
var hyperlist = "hyperlist.json";
var tick = 0 ;
var ticking = false;
var srt = document.getElementById("srt");
var transcript = document.getElementById("transcript");
var timeStamp = document.getElementById("timeStamp");
var options = document.getElementById("opts");

var current = 0;
var loaded = false;

async function getLinks(path, callback) {
    return callback(await fetch(path).then(r => r.json()));
}

getLinks(hyperlist, function(info){

    var subs = "";
    var promise1 = new Promise(function(resolve, reject) {
    const Http = new XMLHttpRequest();
    Http.open("GET", url);
    Http.send();

    Http.onreadystatechange=(e)=>{
    
    if (Http.readyState == 4) {
            var lines = Http.responseText.split(/\s\s/g);
            var stop = [];
            var stop = [];
            subs = "<select id= 'opts' onchange='selected(this.value)'><option value = '00:00:00,000' selected>  SUBTEXT (C) dannyarnold.com 2019  </option>";
            for (x = 0; x < lines.length; x ++){

                if (lines[x].length != 0)
                if (lines[x].match(/\d{1,4}$/g) )
                {
                    if (lines[x].match(/\d{1,2}:\d{1,2}:\d{1,2}/g) ) {
                        start[x] = tsToTick(lines[x].substring(0,12));
                        stop[x]  = tsToTick(lines[x].substring(17,17 + 12));
                        subs += "<option value = '"+ lines[x] + "'>";
                    }
                    else {
                        if(x > 1) subs += "</option>";
                    }
                }
                else {
                      subs += lines[x] + " ";
                }
            }
            subs += "</select>";
            resolve(subs);
        }
    }
    });

    promise1.then(function (subs){
        subs += "</select>";
        transcript.innerHTML = subs;
        loaded = true;
     }); 

});

 
function advanceFrame(){
    tick = tick + 10;
    
    if (loaded){
        
        console.log(stop[current]);
        
    }
}


// display subtitles
var timer = setInterval(function(){ 
    if (ticking){ advanceFrame();}
    timeStamp.innerHTML = tickToTS(tick);
}, 10);

var vid = document.getElementById(video);

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
    console.log(time);
    console.log(tsToTick(time));
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

function offset(el) {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}