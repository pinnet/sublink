//            Sublink ver 0.1.A

// set up config
var video = "myVideo";
var srt = "subs.srt";
var hyperList = "links.lst";
var tick = 0 ;
var ticking = false; 
// read srt.

const Http = new XMLHttpRequest();

const url='test.srt';
Http.open("GET", url);
Http.send();
var transcript = document.getElementById("transcript");
var timeStamp = document.getElementById("timeStamp");
Http.onreadystatechange=(e)=>{
    console.log(Http.readyState);
    if (Http.readyState == 4) {
        
        var promise1 = new Promise(function(resolve, reject) {
        
            var lines = Http.responseText.split("/\r\n/");
            var subs = "<select>";
            for (x = 0; x < lines.length; x ++){

                console.log(lines[x].length);


                subs += "<option>"+ lines[x] +"</option>";
            }
            resolve(subs);

          });

          promise1.then(function (subs){
            subs += "</select>";
            transcript.innerHTML = subs;
          });
       
    }
}


function advanceFrame(){
    tick ++;
}

// read hyperList (Link Dictionary);

// display subtitles
var timer = setInterval(function(){ 
    if (ticking){ advanceFrame();}
    timeStamp.innerHTML = tick;   
}, 10);


var vid = document.getElementById(video);

vid.onplay = function() {

 ticking = true;
}
vid.onpause = function() {

ticking = false;
}        

