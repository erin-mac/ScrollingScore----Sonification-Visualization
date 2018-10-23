var margin = {top: 10, right: 20, bottom: 30, left: 20},
    w = +1000- margin.left - margin.right,
    h = +600- margin.top - margin.bottom;


 //Full Dataset
var index = 0;
var trigger = 0;
var autoplay = false;
var osc;
var timer;

var xScale;
var yScale;
var xAxis;
var yAxis;
var svg;
var tooltip, maxMidi, maxDuration, maxDurationTime;
var dataset;
var ranges = [];

var maxes = [];
//data as objects into arrays

//dataset.tracks;
var song = [];//tracks[0].notes;
var midiNotes = [];


var mySong = [];

function songChange(){//start of songChange()
  mySong = [];
  
  var selection = $('#myselectform2').val();
  switch (selection) {
    case "1":
    song =  d3.json("ClaireDeLune.json", function(error,songData){
  if (error) return console.warn(error);
    cleanData(songData)});
    break;
    case "2":
    song = d3.json("RideValkyries.json", function(error,songData){
  if (error) return console.warn(error);
    newSong  = {tracks: songData.tracks[3]};
    cleanData(newSong)} 
    );
    break;
    case "3":
    song = d3.json("Fantasie.json", function(error,songData){
  if (error) return console.warn(error);
    newSong  = {tracks: songData.tracks[1]};

    cleanData(newSong)});
    break;
  }

}


function cleanData(songData){
    for (key in songData.tracks.notes){
      mySong.push(songData.tracks.notes[key]);
    }
    for (key in mySong){
      midiNotes.push(mySong[key].midi);
    }
     maxTime = d3.max(mySong, function(d){ return d.time});
     maxMidi = d3.max(mySong, function(d){ return d.midi});
     maxDuration = d3.max(mySong, function(d){ return d.duration});
     maxDurationTime = d3.max(mySong, function(d){ return (d.time + d.duration)});
     maxes.push(maxTime, maxMidi, maxDuration, maxDurationTime);
    ranges.push([0, maxTime], [0, maxMidi],[0, maxDuration], [0, maxDurationTime]);
    clearSVG();
    create();
    drawVis(mySong);
    setup(mySong);
}// end of cleanData()

songChange();

var patt = new RegExp("All");
  var attributes = ["time","midi","duration","DurationTime"];


function create(){

     svg = d3.select("#visualization").append("svg")
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");


     tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      //change origin
     xScale = d3.scaleLinear() 
        .domain([0,200])
        .range([margin.left,w])
     yScale = d3.scaleLinear()
        .domain([0,127])
        .range([(h + margin.top),margin.top])

    //X Axis from x scale
     xAxis = d3.axisBottom(xScale)
        .ticks(50); 
    //Draw x axis
    svg.append("g") 
    .attr("transform",  "translate(0,"  + (h + margin.top) + ")")
    .attr("class","axis")
    .call(xAxis)
      .append("text")
      .attr("x", w)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Time");

    //Y axis from y scale
     yAxis = d3.axisLeft(yScale)
        .ticks(50);
    //Draw y axis
    svg.append("g")
    .attr("transform", "translate(" + margin.left + ",0)")
    .attr("class","axis")
    .call(yAxis)
      .append("text")
        .attr("transform","rotate(-90)")
      .attr("dy", ".71em")
      .attr("y", 6)
      .style("text-anchor","end")
      .text("Midi Note");
}//end of create()

function clearSVG(){
  d3.select("svg").remove();
  $( "#instructions" ).remove();
  osc.stop();
  setup();
}


//Slider
$(function(){
  $("#Midi").slider({
    range: true,
    min: 0,
    max: maxes[1],
    values: [0, maxes[1]],
    slide: function( event, ui){
      $("#midiAmount").val(ui.values[0] + " - " + ui.values[1]);
      filterData(attributes[1], ui.values);
      }
    });
  $("#midiAmount").val( $("#Midi").slider("values", 0) + " - " + $("#Midi").slider("values", 1));
});

var midiNotes = [];
console.log(midiNotes);
function midiChange(){
  var selection = $('#myselectform').val();
  
  switch (selection) {
    case "All":
        midi = midiNotes;
        break;
    case "C":
        midi = [0,12,24,36,48,60,72,84,96,108,120];
        break;
    case "C#":
        midi = [1,13,25,37,49,61,73,85,97,109,121];
        break;
    case "D":
        midi = [2,14,26,38,50,62,74,86,98,110,122];
        break;
    case "D#":
        midi = [3,15,27,39,51,63,75,87,99,111,123];
        break;
    case "E":
        midi = [4,16,28,40,,52,64,76,88,100,112,124];
        break;
    case "F":
        midi = [5,17,29,41,53,65,77,89,101,113,125];
        break;
    case "F#":
        midi = [6,18,,30,42,54,66,78,90,201,114,126];
        break;
    case "G":
        midi = [7,19,31,43,55,67,79,91,,103,115,127];
        break;
    case "G#":
        midi = [8,20,32,44,56,68,80,92,104,116];
        break;
    case "A":
        midi = [9,21,33,45,57,69,81,93,105,117];
        break;
    case "A#":
        midi = [10,22,34,46,58,70,82,94,106,118];
        break;
    case "B":
        midi = [11,23,35,47,59,71,83,95,107,119];
        break;
 
  
  }
  new_data = [];
   for (var i = 0; i <= mySong.length -1; i++){
    for (var k = 0; k <= mySong.length; k++){
        if (mySong[i].midi==midi[k] ) {
          new_data.push(mySong[i]);
        }
      }
    }

  mySong = new_data;
  //combine slider and drop down menu data
  drawVis(mySong);
  clearSVG();
  create();
  drawVis(mySong);
  setup();
}//end of midiChange()


function drawVis(data) { /////Draw cirlces and lines and with every interaction/////
   var circle = svg.selectAll("circle")
      .data(data);

   circle
         .attr("cx", function(d) { return xScale(d.time);  })
         .attr("cy", function(d) { return yScale(d.midi);  })
         

   circle.exit().remove();

   circle.enter().append("circle")
         .attr("cx", function(d) { return xScale(d.time);  })
         .attr("cy", function(d) { return yScale(d.midi);  })
         .attr("r", 4)
         .style("stroke", "black")
   
   svg.selectAll("circle")    
              .data(data)
              .enter().append("circle")    
                      .attr("cx",    function(d)    {    return    xScale(d.time);    })
                      .attr("cy",    function(d)    {    return    yScale(d.midi);    })
                      .attr("r", 3);

     //duration lines
   var line = svg.selectAll("line")
     .data(data);

     line.exit().append("line");

     line.enter().append("line")
       .attr("x1", function(d) {   return  xScale(d.time);   })  // x position of the first end of the line
       .attr("y1", function(d) {   return  yScale(d.midi);   }) // y position of the first end of the line
       .attr("x2", function(d) {   return  xScale(d.time + d.duration);   }) // x position of the second end of the line
       .attr("y2", function(d) {   return  yScale(d.midi);   }) // y position of the second end of the line
       .attr("stroke-width", 3)
       .style("stroke", "black");
}//end of drawVis()


//filters each slider function, saving the individual ranges
function isInRange(datum){
  for (i = 0; i < attributes.length; i++){
    if (datum[attributes[i]] < ranges[i][0] || datum[attributes[i]] > ranges[i][1]){
      return false;
    }
  }
  return true;
}

function filterData(attr, values){
  for (i = 0; i < attributes.length; i++){
    if (attr == attributes[i]){
      ranges[i] = values;
    }
  }
  
  var toVisualize = mySong.filter(function(d) { return isInRange(d)});
  dataset = mySong.filter(function(d) { return isInRange(d)});
  
  clearSVG();
  create();
  drawVis(toVisualize);
}

//checks to see if a data point is within the range of each of the sliders

///////scroll line///////
//var ScrollLine = svg.selectAll("line");

// Create Start Button at margin, start/stop scroll line and sound 


function play(){
    x = margin.left;
    timer = setInterval(function(){x = x+1;
      removeLine();
      drawLine(x);},100);
      setup();
      playViz();

  }


function stop(){
    clearInterval(timer);
    osc.stop();
    // trigger = 12353422;
    autoplay = false;

}

function drawLine(xpos){
    svg.append("line")
    .attr("id","scrolling")
    .style("stroke", "black")
    .attr("x1",xpos)
    .attr("y1", h)
    .attr("x2",xpos)
    .attr("y2", 0);
}

function removeLine(){
    d3.select("#scrolling")
    .remove();
}


        // Draw the key
 ///Bottom viz, Sonification

///So P5 library notes mapped to reveresed data 
    // Automatically playing the song

    function setup() {
         if (mySong) {
        song = mySong;
      } else {
        song = song;
      }


      createCanvas(1000, 400);
      var div = createDiv("")
      div.id("instructions");

    
      // Triangle oscillator
      osc = new p5.TriOsc();
      // Start silent
      osc.start();
      osc.amp(0);    
    }

      function playViz(){
        if (!autoplay) {
          index = 0;
          autoplay = true;
        }
      }


  // Play a note
    function playNote(note, duration) { 
      osc.freq(midiToFreq(note));
      osc.fade(note, duration);
      
      // If autoplaying, time for the next note
  // If duration set, fade it out
      if (duration) {
        setTimeout(function() {
          osc.fade(0,0.2);
        }, duration-50);
      }
    }


function draw(){
    if (autoplay && millis() > trigger){ 
        playNote(mySong[index].midi, (mySong[index].duration * 500));
        console.log(trigger);
        trigger = millis() + (mySong[index].duration * 500);
        index ++;
      } else if (index >= mySong.length) {
        autoplay = false;
      }

            // Draw Keyboard
      var w = width / 127
      for (var i = 0; i < 127; i++) {
        var x = i * w;
        // If the mouse is over the key
        if (mouseX > x && mouseX < x + w && mouseY < height) {
          if (mouseIsPressed) {
            fill(100,255,200);
          } else {
            fill(127);
          }
        } else {
          fill(200);
        }

        if (autoplay && i === mySong[index-1].midi) {
            fill(100,255,200);
        }

        rect(x, 0, w-1, height-1);
      } 
  
      // Map mouse to the key index             
      function mousePressed() {
  
      var key = floor(map(mouseX, 0, width, 0, midiNotes.length));
      console.log(key);
      // playNote(notes[key]);
      playNote(midiNotes[0]);
    }

    // Fade it out when we release
    function mouseReleased() {
      osc.fade(0,0.5);
    }   
    }       
     

      
    








