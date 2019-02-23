// ---------------------------------------- Sublink ver 0.1.A
// (C) dannyarnold.com 2019
// Released under the MIT licence www.dannyarnold.com/sublinked/LICENCE
// 


// ----------------------------------------------------------------------------------------------
  (function(){ 
      
    
        var video       = "_video";
        var srtfile     = "linus.srt";
        var hyperlist   = "hyperlist.json";
        var AutoTransript  = false;
        var OnScreenTitles = true;
        var ShowDropDown   = true;
        var ShowTimeStamp  = true;
        var ShowControls   = true;
        var Interval       = 300;

        var vid = document.getElementById(video);
        var linklist ;
        var ticking = false;
        var paused = true;
        var titlestart =[];
        var titlestop  =[];
        var lastStop  = 0;
        var lastStart = 0; 
       
        var linkmatch_regex = /\{\d{1,4}\}/gmi;
        
        var titles =     document.getElementById("_titles");
        var transcript = document.getElementById("_transcript");
        var reference =  document.getElementById("_reference");
        var timestamp =  document.getElementById("_timestamp");
        var controls =   document.getElementById("_controls");

        hideElement();
        wrangleSubs();
      
        setInterval(function(){ 
        
            if (ticking){ 
                
                printTimeStamp(tickToTS(Math.floor(vid.currentTime * 1000)).toString());
                
                stopidx = titlestop.findIndex(checkTime);
                if (stopidx != lastStop) {
                    lastStop = stopidx;
                    printTitle("");
                    
                }
                startidx = titlestart.findIndex(checkTime);
                if (startidx != lastStart) {
                    lastStart = startidx;
                    if(AutoTransript) document.getElementById("_transcript_option").selectedIndex = startidx;
                    buff = document.getElementById("_transcript_option").options[startidx].text;
                    matches = buff.match(linkmatch_regex);
                    if (matches != null){
                        buildLinks(matches);                   
                    }else{                
                        printTitle(buff);
                    }    
                }
            }
        }, Interval);
        
        document.getElementById("_play_button").addEventListener('click',function (event) {
            if(paused){    
                paused = false;
                document.getElementById("_video").play();    
            }
            else{
                paused = true;
                document.getElementById("_video").pause();
            }
        });
        document.getElementById("_stop_button").addEventListener('click',function (event) {
            document.getElementById("_video").pause();
            paused = true;
        });
        
        document.getElementById("_fullscreen_button").addEventListener('click',function (event) {
            document.getElementById("_fullscreen").requestFullscreen();
        });
        
        /*
        */
        titles.addEventListener('click', function (event) {
        
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
            vid.play();
        }

        document.addEventListener("fullscreenchange", function() {
            if (
                document.fullscreenElement ||                 /* Standard syntax */
                document.webkitFullscreenElement ||           /* Chrome, Safari and Opera syntax */
                document.mozFullScreenElement ||              /* Firefox syntax */
                document.msFullscreenElement                  /* IE/Edge syntax */ 
                                                              // code from https://www.w3schools.com/jsref/prop_document_fullscreenelement.asp*/
            ){
                document.getElementById("_titles").style.width = "88%";
                document.getElementById("_video").style.width = "89%";
            }
            else{
                document.getElementById("_titles").style.width = "49%";
                document.getElementById("_video").style.width = "50%";
            }
        });
        

    
    //------------------------------------------------------------------------------------------------------------------------------------------------

    function  buildLinks(matches) {
       
        var index = matches.toString();
        index = index.substring(1);
        index = index.substring(-1);
        index = parseInt(index)
        var link = linklist.EN.Link[index];
        var linktext = linklist.EN.Search[index];
        var hyperText = buff.replace(linktext+matches,"<a id='_link' href='"+ link +"' target='_blank' >"+ linktext +"</a>");
        printTitle(hyperText);
        var linktarget = document.getElementById('_link');
        linktarget.addEventListener('mouseenter',function (event) {
            document.getElementById("_link").style.color = "orange";  //todo: pram color
        });
        linktarget.addEventListener('mouseleave',function (event) {
            document.getElementById("_link").style.color = "white";     //todo: pram color
        });
    }
    // set up config
    function hideElement(){
        if (OnScreenTitles) titles.style.display = "block";
        else titles.style.display = "none";
        if (ShowDropDown) transcript.style.display = "block";
        else transcript.style.display = "none";
        if (ShowTimeStamp) timestamp.style.display = "block";
        else timeStamp.style.display = "none";
        if (ShowControls) controls.style.display = "block";
        else controls.style.display = "none";
        
    }

    async function wrangleSubs(){

        let linkres = await fetch(hyperlist);
        linklist = await linkres.json();
        
        let subtitles = await fetch(srtfile).then(function(response){
            return response.text();
        });
        var index = 0; 
        var lines = subtitles.split(/\s\s/g);
        subs = "<select id='_transcript_option'><option value = '00:00:00,000'>Transcript</option>";
        
        for (x = 0; x < lines.length; x ++){
            if (lines[x].length != 0)
            if (lines[x].match(/\d{1,4}$/g) )
            {
                if (lines[x].match(/\d{1,2}:\d{1,2}:\d{1,2}/g) ) {
                    titlestart[index] = tsToTick(lines[x].substring(0,12));
                    titlestop[index]  = tsToTick(lines[x].substring(17,17 + 12));
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
        subs += "</select><input type='checkbox' id='_autotranscript'>Auto";
        transcript.innerHTML = subs;
        reference.innerHTML = "<h2>Reference</h2>" 
        
        for (i in linklist.EN.Link){
            reference.innerHTML += "{" + i.toString() +"}" + "<a href='"+linklist.EN.Link[i]+"'>" +linklist.EN.Link[i] + "</a><BR>";
            }  
        document.querySelector("#_transcript_option").onchange=selected;  
        document.querySelector("#_autotranscript").onchange=checkedEvent;
    }
    function parseLinks(linkArray,line){
        for (i in linkArray.EN.Search){
            url = linkArray.EN.Link[i];
            match = linkArray.EN.Search[i];
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
        return mill >= Math.floor(vid.currentTime * 1000);
    }
    function printTimeStamp(time){  
        timestamp.innerHTML = time;
    }
    function printTitle(title){
        titles.innerHTML = title;
    }
    function selected(event){
        vid.currentTime = tsToTick(event.target.value) / 1000;
    }

    function checkedEvent(event){
          
        AutoTransript = event.target.checked;   
      
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
        return result ;
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
   

  })();