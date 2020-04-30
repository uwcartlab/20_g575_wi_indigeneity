// Choropleth Map
//Wrapper Function for Choropleth Map
(function(){
  var choroplethArray = ["Minimum Number of Individuals (MNI)", "Associated Funerary Objects (AFO)"]
  expressed = choroplethArray[0]
  //console.log(expressed)
  window.onload = setMap();
  function setMap(){
    var width = 1000,
        height = 550;
    // Create map svg container and set projection using d3 -- Push translated TopoJSON data (see week 9)
    var choropleth = d3.select("div#map")
      .append("svg")
      .attr("class", "map")
      .attr("width", width)
      .attr("height", height);
    //Geo Albers Area Conic Projection
    var choroProjection = d3.geoAlbersUsa()
      //.scale(500)
    var path = d3.geoPath()
        .projection(choroProjection);
    //create info Panel
    //use Promise.all to parallelize asynchronous data loading
    var promises = [];
    promises.push(d3.csv("data/choropleth/choroplethData.csv"));  //placeholder csv file name
    promises.push(d3.json("data/choropleth/US_states.json"));
    promises.push(d3.json("data/choropleth/countries.json"));
    Promise.all(promises).then(callback);

    function callback(data){
      choroplethData = data[0];
      usStates = data[1];
      // Translate TopoJSON data with topojson.js
      var states = topojson.feature(usStates, usStates.objects.US_states).features;
      states = joinChoroData(states, choroplethData);
      var choroplethColorScale = choroColors();
      //console.log(choroplethColorScale)
      setStates(states, choropleth, path, choroplethColorScale);
      dropdown()
      };
    };
  // Join GeoJSON features (States) with CSV data (of state repatriation raw numbers)
  function joinChoroData(states, choroplethData){
      for (var i=0; i<choroplethData.length;i++){  //placeholder csv
        var csvState = choroplethData[i]; //placeholder csv
        var csvKey = csvState.postal; /// placeholder unti csv data arrives
        for (var a=0; a<states.length;a++){
          var geojsonProps = states[a].properties;
          var geojsonKey = geojsonProps.postal //placeholder
          if (geojsonKey == csvKey){
            choroplethArray.forEach(function(attr){
              var val = parseFloat(csvState[attr]);
              geojsonProps[attr] = val;
              //console.log(geojsonProps)
            });
          };
        };
      };
      return states;
      };
  // Draw Paths from TopoJSON data
  function setStates(states, choropleth, path, colorScale){
      var statePath = choropleth.selectAll(".states")
        .data(states)
        .enter()
        .append("path")
        .attr("class", function(d){
          return "state " + d.properties.postal; //placeholder name
          })
        .attr("d", path)
        .style("fill", function(d){ // Color Enumeration Units
          var value = d.properties[expressed]
          //console.log(typeof value)
          if(value){
            return colorScale(value);
          } else {
            return "#fff";
          }
          })
        .on("mouseover", function(d){
          highlight(d.properties);
        })
        .on("mouseout", function(d){
          dehighlight(d.properties);
        })
        .on("mousemove", moveLabel);
        var desc = statePath.append("desc")
          .text('{"stroke": "#555", "stroke-width":"0.5px"}');
    };
  // Create Quantile (maybe use Natural Breaks?) Color Scale
  function choroColors(){
      var colorClasses = [
        "#f2f0f7",
        "#dadaeb",
        "#bcbddc",
        "#9e9ac8",
        "#807dba",
        "#6a51a3",
        "#4a1486"
      ];
      //create color scale generator
      var colorScale = d3.scaleThreshold()
          .range(colorClasses);
      //build array of all values of the expressed attribute
      var mni = [10054,271,3807,288,13560,279,381,1173,0,6099,623,114,171,10978,5847,142,757,4660,1453,51,276,6784,1211,181,539,3518,43,256,171,17,36,2450,4831,1384,3,9432,3057,166,2628,103,420,63,9464,3732,966,3,741,189,366,2340,188];
      var afo = [54797,187,4891,617,169516,39,727,3975,0,15149,1541,4,258,57592,13499,1,38343,2788,785,37,102,14037,9955,178,141,9678,150,6458,214,49,160,1612,17132,7124,0,119297,14170,107,94529,21,10361,171,78911,15643,1447,1,5241,84,774,4089,310];
      if(expressed==choroplethArray[0]){
          //var minmax = [
            var clusters = ss.ckmeans(mni, 7);
            mni = clusters.map(function(d){
              return d3.min(d);
            });
            mni.shift();
            colorScale.domain(mni)
            //d3.min(mni),
            //d3.max(mni)
          //];
      }else{
        var clusters = ss.ckmeans(afo, 7);
        afo = clusters.map(function(d){
          return d3.min(d);
        });
        afo.shift();
        colorScale.domain(afo)
          //var minmax = [
            //d3.min(afo),
            //d3.max(afo)
          //];
      };
      //console.log(minmax)
      //assign array of expressed values as scale domain
      //colorScale.domain(mni);
      //console.log(minmax)
      return colorScale;
  };
  // Create Reexpress Method -- Menu Select that changes Expressed data for each State (different types of artifacts)
  function dropdown(choroplethData){
    var dropdown = d3.select("div#map")  //change to info Panel --> Need to append to DIV
      .append("select")
      .attr("class", "dropdown")
      .on("change", function(){
        changeAttribute(this.value, choroplethData)
        });
    // var titleOption = dropdown.append("option")
    //   .attr("class", "titleOption")
    //   .attr("disabled", "true")
    //   .text("Select Item Type");
    var attrOptions = dropdown.selectAll("attrOptions")
      .data(choroplethArray)
      .enter()
      .append("option")
      .attr("value", function(d){return d})
      .text(function(d){return d});
  };
  // Recreate Color Scale and Recolor Each Enumeration Unit based on changed Expressed data
  function changeAttribute(attribute, choroplethData){
    //change Expressed
    expressed = attribute;
    //recreate colorScale
    var choroplethColorScale = choroColors();
    //recolor States
    var states = d3.selectAll(".state")
      .transition()
      .duration(1000)
      .style("fill", function(d){
        var value = d.properties[expressed];
        if (value) {
          return choroplethColorScale(value);
        } else {
          return "#fff";
        }
        });
  };
  // Create Retrieve Method -- onMouseover or onClick methods
  // Create Dynamic Label with State Name and Number of Returned Artifacts of Chosen Type
  function choroLabel(props){
    var labelAttribute = "<h1>"+props[expressed]+"</h1><b>"+expressed+"</b>";
    var infolabel = d3.select("div#map")
      .append("div")
      .attr("class", "infolabel")
      .attr("id", props.postal+"_label")
      .html(labelAttribute);
    var stateName = infolabel.append("div") //state is not being properly appended after adding bootstrap
      .attr("class", "labelname")
      .html(props.name);
    };
  function moveLabel(){
        //get width of label
        var labelWidth = d3.select(".infolabel")
            .node()
            .getBoundingClientRect()
            .width;
        //use coordinates of mousemove event to set label coordinates
        var x1 = d3.event.clientX + 10,
            y1 = d3.event.clientY - 75,
            x2 = d3.event.clientX - labelWidth - 10,
            y2 = d3.event.clientY + 25;
        //horizontal label coordinate, testing for overflow
        var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;
        //vertical label coordinate, testing for overflow
        var y = d3.event.clientY < 75 ? y2 : y1;

        d3.select(".infolabel")
            .style("left", x + "px")
            .style("top", y + "px");
    };
  // Create Dynamic Legend for ColorScale for expressed dataset
  // Create Highlight function
  function highlight(props){
    var selected = d3.selectAll("."+props.postal)
      .style("stroke", "purple")
      .style("stroke-width", "2");
    choroLabel(props);
    };
  // Create Dehighlight Function
  function dehighlight(props){
    var selected = d3.selectAll("."+props.postal)
      .style("stroke", function(){
        return getStyle(this, "stroke")
      })
      .style("stroke-width", function(){
        return getStyle(this, "stroke-width")
      });
    function getStyle(element, styleName){
      var styleText = d3.select(element)
        .select("desc")
        .text();
      var styleObject = JSON.parse(styleText);
      return styleObject[styleName];
    };
    d3.select(".infolabel")
      .remove();
  }
})();

//Wrapper Function for Flow Map
(function(){
  attrArray = ["MNI", "AFO", "CUI"]
  //expressed = attrArray[0]
  window.onload = setbaseMap();
  //build Wisconsin map
  function setbaseMap(){
      var width = 800,
          height = 500;
      // Create map svg container and set projection using d3 -- Push translated TopoJSON data (see week 9)
      var basemap = d3.select("div#flowmap")
        .append("svg")
        .attr("class", "flowmap")
        .attr("width", width)
        .attr("height", height)
        .attr('x', 100)
        .attr('y', 500);
      //Geo Albers Area Conic Projection
      var baseProjection = d3.geoAlbers()
        .center([2.25, 44.88205])
        .scale(5500)
        .rotate([92.35, .5, -2])
        .translate([width / 2, height / 2])
      //Path generator
      var path = d3.geoPath()
          .projection(baseProjection);

      var promises = [];
      promises.push(d3.json('data/effigy/wisconsin.json'));
      promises.push(d3.json('data/nagpra/wiRes.json'));
      promises.push(d3.json('data/nagpra/Museumlocations.json'));
      promises.push(d3.csv('data/nagpra/wiDestination.csv'));
      promises.push(d3.csv('data/nagpra/wiInstitutions.csv'));
      promises.push(d3.csv('data/nagpra/wi-destination.csv'));
      promises.push(d3.csv('data/nagpra/wi-institutions.csv'));
      promises.push(d3.csv('data/nagpra/wiSource.csv'));
      Promise.all(promises).then(callback);

      function callback(data){
        wisconsin = data[0];
        res = data[1];
        instit = data[2];
        wiDest = data[3];
        wiInst = data[4];
        wiSource = data[5];
        var wisc = topojson.feature(wisconsin, wisconsin.objects.cb_2015_wisconsin_county_20m).features;
        var lands = topojson.feature(res, res.objects.wiRes).features;
        var institutions = topojson.feature(instit, instit.objects.Museumlocations).features;
        //console.log(lands)
        getWisconsin(wisc, basemap, path);
        getReservations(wisc, lands, basemap, path);
        getInstitutions(basemap, baseProjection, wisc, institutions, basemap, path)
        };
      };
  function getWisconsin(wisc, basemap, path){
        var wiPath = basemap.selectAll(".counties")
          .data(wisc)
          .enter()
          .append("path")
          .attr("class", function(d){
            return "county " + d.properties.NAME; //placeholder name
            })
          .attr("d", path)
          .style("fill", function(d){ // Color Enumeration Units
            var value = d.properties[expressed]
            if(value){
              return WIcolors(d.properties[expressed]);
            } else {
              return "#ddd";
            }
          });
          // .on("mouseover", function(d){
          //   highlight(d.properties);
          // })
          // .on("mouseout", function(d){
          //   dehighlight(d.properties);
          // })
          // .on("mousemove", moveLabel);
          var desc = wiPath.append("desc")
            .text('{"stroke": "#AAA", "stroke-width":"0.5px"}');
        };
  function getReservations(wisc, lands, basemap, path, baseProjection){
          var reservation = basemap.selectAll(".lands")
            .data(lands)
            .enter()
            .append("path")
            .attr("class", function(d){
              return "reservation " + d.properties.label; //placeholder name
              })
            .attr("d", path)
            .style("fill", function(d){ // Color Enumeration Units
              var value = d.properties[expressed]
              if(value){
                return "#000";
              } else {
                return "#888";
              }
            })
            .on("mouseover", function(d){
              //console.log(d)
              ReservHighlight(basemap, baseProjection, lands, wisc,d);
            })
            .on("mouseout", function(d){
              ReservDehighlight(d);
            })
            .on("mousemove", moveLabel);
            var desc = reservation.append("desc")
              .text('{"stroke": "#AAA", "stroke-width":"0.5px"}');
            };
  function getInstitutions(basemap, baseProjection, wisc, institutions, basemap, path){
          var institution = basemap.selectAll(".institutions")
              .data(institutions)
              .enter()
              .append("path")
              .attr("class", function(d){
                  return "institution " + d.properties.name; //placeholder name
                    })
              .attr("d", path)
              .style("fill", function(d){ // Color Enumeration Units
                  var value = d.properties[expressed]
                    if(value){
                      return "#000";
                      } else {
                      return "#555";
                      }
                  })
                  .on("mouseover", function(d){
                      //console.log(d)
                      InstHighlight(basemap, baseProjection, wisc, d);
                    })
                    .on("mouseout", function(d){
                      InstDehighlight(wisc, d);
                    })
                    .on("mousemove", moveLabel);
            var desc = institution.append("desc")
              .text('{"stroke": "#555", "stroke-width":"0.5px"}');
          };
  // Create Quantile (maybe use Natural Breaks?) Color Scale
  function WIcolors(data){
      var colorClasses = [
      "#fee5d9",  // Red, 4 Classes
      "#fcae91",
      "#fb6a4a",
      "#cb181d"
      ];
      //create color scale generator
      var colorScale = d3.scaleQuantile()
          .range(colorClasses);
      //build array of all values of the expressed attribute
      var domainArray = [];
      for (var i=0; i<data.length; i++){
          var val = parseFloat(data[i][expressed]);
          domainArray.push(val);
      };
      //assign array of expressed values as scale domain
      colorScale.domain(domainArray);
      return colorScale;
  };
  // Create Reexpress Method -- Menu Select that changes Expressed data for each State (different types of artifacts)
  function dropdown(wisconsinData){
    var dropdown = d3.select("div#flowmap")  //change to info Panel --> Need to append to DIV
      .append("select")
      .attr("class", "dropdown")
      .on("change", function(){
        changeAttribute(this.value, wisconsinData)
        });
    var titleOption = dropdown.append("option")
      .attr("class", "titleOption")
      .attr("disabled", "true")
      .text("Select Item Type");
    var attrOptions = dropdown.selectAll("attrOptions")
      .data(attrArray)
      .enter()
      .append("option")
      .attr("value", function(d){return d})
      .text(function(d){return d});
  };
  // Recreate Color Scale and Recolor Each Enumeration Unit based on changed Expressed data
  function changeAttribute(attribute, wisconsinData){
    //change Expressed
    expressed = attribute;
    //recreate colorScale
    var wiColorScale = WIcolors(wisconsinData);
    //recolor States
    var states = d3.selectAll(".counties")
      .transition()
      .duration(1000)
      .style("fill", function(d){
        var value = d.properties[expressed];
        if (value) {
          return wiColorScale(value);
        } else {
          return "#ddd";
        }
      });
  };
  // Create Retrieve Method -- onMouseover or onClick methods
  // Create Dynamic Label with State Name and Number of Returned Artifacts of Chosen Type
  function wiLabels(props){
    var labelAttribute = "<h1>"+props[expressed]+"</h1><b>"+expressed+"</b>";
    var infolabel = d3.select(".county")
      .append("div")
      .attr("class", "infolabel")
      .attr("id", props.NAME+"_label")
      .html(labelAttribute);
    var stateName = infolabel.append("div")
      .attr("class", "labelname")
      .html(props.NAME);
    };
  function moveLabel(){
        //get width of label
        var labelWidth = d3.select(".infolabel")
            .node()
            .getBoundingClientRect()
            .width;
        //use coordinates of mousemove event to set label coordinates
        var x1 = d3.event.clientX + 10,
            y1 = d3.event.clientY - 75,
            x2 = d3.event.clientX - labelWidth - 10,
            y2 = d3.event.clientY + 25;
        //horizontal label coordinate, testing for overflow
        var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;
        //vertical label coordinate, testing for overflow
        var y = d3.event.clientY < 75 ? y2 : y1;

        d3.select(".infolabel")
            .style("left", x + "px")
            .style("top", y + "px");
    };
  function instLines(basemap, baseProjection, props, wisc, wiInst){
      var path = d3.geoPath() //create Path generator
        .projection(baseProjection) //use baseProjection
      var link = []  // creates array for linestrings to be pushed
      var obj; // objects in County topojson
      var instit; //institutions in wisconsin institutions csv
      for (obj in wisc){  //iterate each county
        for (instit in wiInst){ //iterate each institution
          if(wisc[obj].properties.NAME == wiInst[instit].County){  // I - check if Name of County is Equal to Name of a Target County for any Institutions
            if(props.properties.name==wiInst[instit].Label){       // II - check if Dot hovered over has Name equal to name of an Institution in wiInstitutions that targets named County
            //if these two conditions are met, draw line from coordinates of Institution (from II) to coordinates of all counties it is linked to (from I)
                //set target coordinates
              var target = [wisc[obj].properties.coordinates[1],wisc[obj].properties.coordinates[0]],
                //set origin coordinates
                  origin = [props.geometry.coordinates[0],props.geometry.coordinates[1]]
                //create LineString element with Each Coordinate Array as the two End Points
                  topush = {type: "LineString", coordinates: [origin, target]}
                  console.log(topush)
                  //push LineString to array
                  link.push(topush)
              //Draw Lines on Basemap
              basemap.selectAll("myPath")
                .data(link) //enter link data
                .enter()
                .append("path") //append arc
                  .attr("class", function(d){
                    return "arc"; //name it  "arc" --> may need more specific name for Final
                      })
                  .attr("d", function(d){return path(d)})
                  .style("fill", "none")
                  .style("stroke", "#807dba") //color
                  .style("stroke-width", 2)
            }
          }
        }
      }
    };




  //Reservations need flow lines to institutions they got items from.
  function resLines(basemap, baseProjection, props, wisc, lands){
      //console.log(lands)
      //var source = [props.geometry.coordinates[0], props.geometry.coordinates[1]]
      //console.log(source)
      var path = d3.geoPath()
        .projection(baseProjection)
      var link = []
      var obj;
      var reserv;
      console.log(link)
      for (obj in wisc){
        for (reserv in lands){
          //console.log(reserv)
          if(wisc[obj].properties.NAME == lands[reserv].properties.label){
            console.log(reserv) // I - check if Name of County is Equal to Name of a Target County for any Institutions
            var target = [wisc[obj].properties.coordinates[1],wisc[obj].properties.coordinates[0]],
                origin = [props.geometry.coordinates[0][0][0],props.geometry.coordinates[0][0][1]]
                topush = {type: "LineString", coordinates: [origin, target]}
                console.log([origin, target])
                console.log(topush)
                link.push(topush)
                console.log(link)
            basemap.selectAll("myPath")
                .data(link)
                .enter()
                .append("path")
                  .attr("class", function(d){
                    //console.log(link)
                    return "arc"; //name it  "arc" --> may need more specific name for Final
                    })
                  .attr("d", function(d){return path(d)})
                  .style("fill", "none")
                  .style("stroke", "#807dba")
                  .style("stroke-width", 2)
          }
        }
      }
    };
  // Create Dynamic Legend for ColorScale for expressed dataset
  // Create Highlight function
  function ReservHighlight(basemap, baseProjection, lands, wisc, props){
    //console.log(props)
    var selected = d3.selectAll("." + props.properties.label)
      .style("stroke", "purple")
      .style("stroke-width", "1.5");
    wiLabels(props);
    resLines(basemap, baseProjection, props, wisc, lands);
    };
  // Create Dehighlight Function
  function ReservDehighlight(props){
   var selected = d3.selectAll("."+props.properties.label)
      .style("stroke", function(){
        return getStyle(this, "stroke")
      })
      .style("stroke-width", function(){
        return getStyle(this, "stroke-width")
      });
    function getStyle(element, styleName){
      var styleText = d3.select(element)
       .select("desc")
       .text();
      var styleObject = JSON.parse(styleText);
      return styleObject[styleName];
    };
    d3.select(".infolabel")
      .remove();
  }
  function InstHighlight(basemap, baseProjection, wisc, props){
    //console.log(props)
    var selected = d3.selectAll("."+props.properties.name)
      .style("stroke", "purple")
      .style("stroke-width", "1.5")
    wiLabels(props);
    instLines(basemap, baseProjection, props, wisc, wiInst);
    };
  // Create Dehighlight Function
  function InstDehighlight(wisc,props){
   var selected = d3.selectAll("."+props.properties.name)
      .style("stroke", function(){
        return getStyle(this, "stroke")
      })
      .style("stroke-width", function(){
        return getStyle(this, "stroke-width")
      });
    function getStyle(element, styleName){
      var styleText = d3.select(element)
       .select("desc")
       .text();
      var styleObject = JSON.parse(styleText);
      return styleObject[styleName];
    };
    d3.select(".infolabel")
      .remove();
    d3.selectAll(".arc")
      .remove();
  };
  })();



//Wrapper Function for Mound Map
(function(){
  attrArray = ["Selection 1", "Selection 2"]
  //expressed = attrArray[0]
  window.onload = setbaseMap();
  //build Wisconsin map
  function setbaseMap(){
      var width = 600,
        height = 500;
      // Create map svg container and set projection using d3 -- Push translated TopoJSON data (see week 9)
      var basemap = d3.select("div#moundmap")
        .append("svg")
        .attr("class", "moundmap")
        .attr("width", width)
        .attr("height", height)
        // .attr('x', 100)
        // .attr('y', 500)
        .call(d3.zoom().on("zoom", function () {
            basemap.attr("transform", d3.event.transform)
        }))
        .append("g");
      //Geo Albers Area Conic Projection
      var baseProjection = d3.geoAlbers()
        .center([3.35, 44.88205])
        .scale(20000)
        .rotate([92.35, 1.8, -1])
        .translate([width / 2, height / 2])

      var path = d3.geoPath()
          .projection(baseProjection);
      var promises = [];
      promises.push(d3.json('data/effigy/wisconsin.json'));
      promises.push(d3.json('data/effigy/RealEffigy_spaces.json'));
      Promise.all(promises).then(callback);
      function callback(data){
        wisconsin = data[0];
        effigymounds = data[1];
        //console.log(effigymounds)
        var wisc = topojson.feature(wisconsin, wisconsin.objects.cb_2015_wisconsin_county_20m).features;
        var mounds = topojson.feature(effigymounds, effigymounds.objects['RealEffigy_spaces']).features;
        //console.log(mounds)
        getWisconsin(wisc, basemap, path)
        drawLocations(mounds, basemap, baseProjection);
        };
      };

  function getWisconsin(wisc, basemap, path){
        //console.log(zoom)
        var wiPath = basemap.selectAll(".counties")
          .data(wisc)
          .enter()
          .append("path")
          .attr("class", function(d){
            //console.log(d.properties)
            return "county " + d.properties.NAME;
            })
          .attr("d", path)
          .style("fill", function(d){
              return "#ddd";
            })
          var desc = wiPath.append("desc")
            .text('{"stroke": "#AAA", "stroke-width":"0.5px"}');
        };


  function drawLocations(mounds, basemap, baseProjection) {
      var legend = d3.select("#moundlegend")
      legend.append("text").attr("x",-114).attr("y",9).attr("transform", "rotate(-90)").text("Mound status").style("font-size", "15px").style("font-weight", "bold").attr("alignment-baseline","middle")
      legend.append("circle").attr("cx",30).attr("cy",28).attr("r", 6).style("fill", "green")
      legend.append("circle").attr("cx",30).attr("cy",48).attr("r", 6).style("fill", "yellow")
      legend.append("circle").attr("cx",30).attr("cy",68).attr("r", 6).style("fill", "gray")
      legend.append("circle").attr("cx",30).attr("cy",88).attr("r", 6).style("fill", "black")
      legend.append("text").attr("x", 40).attr("y", 29).text("Intact").style("font-size", "15px").attr("alignment-baseline","middle")
      legend.append("text").attr("x", 40).attr("y", 49).text("Unknown").style("font-size", "15px").attr("alignment-baseline","middle")
      legend.append("text").attr("x", 40).attr("y", 69).text("Partially Destroyed").style("font-size", "15px").attr("alignment-baseline","middle")
      legend.append("text").attr("x", 40).attr("y", 89).text("Destroyed").style("font-size", "15px").attr("alignment-baseline","middle")

      var loc = basemap.selectAll("circle")
      	.data(mounds)
      	.enter()
      	.append("circle")
      	.attr("cx", function(d) {
            //console.log(d.properties)
            return baseProjection([d.properties['Longitutde'], d.properties['Latitude']])[0];
      			//return baseProjection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0];
      		})
      	.attr("cy", function(d) {
            return baseProjection([d.properties['Longitutde'], d.properties['Latitude']])[1];
            //return baseProjection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1];
      	})
      	.attr("r", 3)
      	.attr("class", function(d){
          return "location " + d.properties['SiteName'];
        })
        .style("fill", function(d) {
          //console.log(d.properties['status'])
          if(d.properties['status']=="intact"){
            return "green"
          }
          if(d.properties['status']=="destroyed"){
            return "black"
          }
          if(d.properties['status']=="unknown"){
            return "yellow"
          }
          if(d.properties['status']=='partially destroyed'){
            return "gray"
          }
        })
        // .addEventListener("click", function(d){
        //   populatePanel(mounds)
        // })
        .on("mouseover", function(d){
          //console.log('highlight')
          mhighlight(d.properties);
        })
        .on("mouseout", function(d){
          mdehighlight(d.properties);
        })
        //buildInfoPanel(mounds);
        .on("mousemove", buildInfoPanel(mounds));
        loc.on("click", function(d){
          populatePanel(d)
        })
        var desc = loc.append('desc')
            .text('{"stroke": "#AAA", "stroke-width":"0.5px"}')
    }

  function buildInfoPanel(mounds){
    //console.log('made it')
    var width = 300,
        height = 500;
    var moundinfo = d3.select("div#moundpanel")
      .append('svg')
      .attr("class", "moundinfo")
      .attr("width", width)
      .attr("height", height)
      .attr('x', 100)
      .attr('y', 500);
    var infopan = moundinfo.selectAll('rect')
      .attr('class', 'rect')
      .attr("width", width)
      .attr("height", height)
      .attr('x', 100)
      .attr('y', 500);
    var panel = moundinfo.selectAll('text')
      .data(mounds)
      .enter()
      .append('text')
      .attr('class', 'text')
      .attr("width", width)
      .attr("height", height)
      .attr('x', 100)
      .attr('y', 500)
      .style('fill', 'red')
      .attr('class', 'actualtext')
      // .attr('text', function(d){
      //     //console.log(d.properties['County'])
      //     return ("Located in "+ d.properties['County']+" county at the "+d.properties['Present Name']+" site. The site has "+ d.properties["Sum"]+" mounds listed as "+d.properties['status']+".")
      // });
  }

  function populatePanel(d){
    console.log('reached function')
    var dynamictext = d3.selectAll('rect')
        .data(d)
        .enter()
        .append('text')
        .attr('text', function(d){
          console.log('ah')
          return ("Located in "+ d.properties['County']+" county at the "+d.properties['Present Name']+" site. The site has "+ d.properties["Sum"]+" mounds listed as "+d.properties['status']+".")
        });
  }

  // Create Quantile (maybe use Natural Breaks?) Color Scale
  function WIcolors(data){
      var colorClasses = [
      "#fee5d9",  // Red, 4 Classes
      "#fcae91",
      "#fb6a4a",
      "#cb181d"
      ];
      //create color scale generator
      var colorScale = d3.scaleQuantile()
          .range(colorClasses);
      //build array of all values of the expressed attribute
      var domainArray = [];
      for (var i=0; i<data.length; i++){
          var val = parseFloat(data[i][expressed]);
          domainArray.push(val);
      };
      //assign array of expressed values as scale domain
      colorScale.domain(domainArray);
      return colorScale;
  };
  // Create Reexpress Method -- Menu Select that changes Expressed data for each State (different types of artifacts)
  function dropdown(wisconsinData){
    var dropdown = d3.select("div#moundmap")  //change to info Panel --> Need to append to DIV
      .append("select")
      .attr("class", "dropdown")
      .on("change", function(){
        changeAttribute(this.value, wisconsinData)
        });
    var titleOption = dropdown.append("option")
      .attr("class", "titleOption")
      .attr("disabled", "true")
      .text("Select Item Type");
    var attrOptions = dropdown.selectAll("attrOptions")
      .data(attrArray)
      .enter()
      .append("option")
      .attr("value", function(d){return d})
      .text(function(d){return d});
  };
  // Recreate Color Scale and Recolor Each Enumeration Unit based on changed Expressed data
  function changeAttribute(attribute, wisconsinData){
    //change Expressed
    expressed = attribute;
    //recreate colorScale
    var wiColorScale = WIcolors(wisconsinData);
    //recolor States
    var states = d3.selectAll(".counties")
      .transition()
      .duration(1000)
      .style("fill", function(d){
        var value = d.properties[expressed];
        if (value) {
          return wiColorScale(value);
        } else {
          return "#ddd";
        }
      });
  };
  // Create Retrieve Method -- onMouseover or onClick methods
  // Create Dynamic Label with State Name and Number of Returned Artifacts of Chosen Type
  function wiLabels(props){
    var labelAttribute = "<h1>"+props[expressed]+"</h1><b>"+expressed+"</b>";
    var infolabel = d3.select(".county")
      .append("div")
      .attr("class", "infolabel")
      .attr("id", props.NAME+"_label")
      .html(labelAttribute);
    var stateName = infolabel.append("div")
      .attr("class", "labelname")
      .html(props.NAME);
    };
  function moveLabel(){
        //get width of label
        var labelWidth = d3.select(".infolabel")
            .node()
            .getBoundingClientRect()
            .width;
        //use coordinates of mousemove event to set label coordinates
        var x1 = d3.event.clientX + 10,
            y1 = d3.event.clientY - 75,
            x2 = d3.event.clientX - labelWidth - 10,
            y2 = d3.event.clientY + 25;
        //horizontal label coordinate, testing for overflow
        var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;
        //vertical label coordinate, testing for overflow
        var y = d3.event.clientY < 75 ? y2 : y1;

        d3.select(".infolabel")
            .style("left", x + "px")
            .style("top", y + "px");
    };

function mhighlight(props){
  //console.log(props)
  var selected = d3.selectAll("." +props['SiteName'])
      .style("stroke", "red")
      .style("stroke-width", "2");
      //choroLabel(props);
  };
    // Create Dehighlight Function
function mdehighlight(props){
  var selected = d3.selectAll("."+props['SiteName'])
      .style("stroke", function(){
          return getStyle(this, "stroke")
      })
      .style("stroke-width", function(){
          return getStyle(this, "stroke-width")
      });
function getStyle(element, styleName){
  var styleText = d3.select(element)
      .select("desc")
      .text();
  var styleObject = JSON.parse(styleText);
        return styleObject[styleName];
    };
  d3.select(".infolabel")
    .remove();
}

  // Create Dynamic Legend for ColorScale for expressed dataset
  // Create Highlight function
  //function highlight(props){
    //var selected = d3.selectAll("."+props.NAME)
      //.style("stroke", "red")
      //.style("stroke-width", "2");
    //wiLabels(props);
  //  };
  // Create Dehighlight Function
  //function dehighlight(props){
  //  var selected = d3.selectAll("."+props.NAME)
  //    .style("stroke", function(){
  //      return getStyle(this, "stroke")
  //    })
  //    .style("stroke-width", function(){
  //      return getStyle(this, "stroke-width")
  //    });
  //  function getStyle(element, styleName){
  //    var styleText = d3.select(element)
  //      .select("desc")
  //      .text();
  //    var styleObject = JSON.parse(styleText);
  //    return styleObject[styleName];
  //  };
  //  d3.select(".infolabel")
  //    .remove();
  //}
  })();


// Pseudocode for Flow Map

// Collect TopoJSON data for Wisconsin, Museums/Institutions, and Reservations, and Historical Tribal Bounds and Promise data to SetMap() function
// Translate TopoJSON data with topojson.js
// Create map svg container and set projection using d3 -- Push translated TopoJSON data (see week 9)
// Draw Paths from TopoJSON data
// Create Information Panel div
// Create Retrieve via Menu Selection to Select Tribes or Institutions
// Create Retrieve via onClick/onMouseover to select Tribes or Institutions
// Create Dynamic Label Method for onClick/onMouseover of a reservation or institution
// Create Flow Creation Method with Size Scaled to Amount Returned to or from the Tribe or Institution respectively
// Create Flow Creation Method with Size Scaled to Amount Affiliated to or from the Tribe or Institution respectively -- But not known if Returned (uses dotted line instead of full flow)
// Create Reexpress method to dynamically call Flow Creation Method when a new Tribe/Institution is selected
// Create Overlay/Reexpress method to overlay historical tribal bounds when a Reservation/Tribe is selected
// Create Information Panel update method to dynamically update InfoPanel when new item selected
// Create Legend for Flowline sizes
// Determine Zoom, Pan, and Search Constraints if we are restricting until end of article

// Pseudocode for Mound Map

// Collect TopoJSON data for Wisconsin, Mounds, and Historical Tribal Bounds and Promise data to SetMap() function
// Translate TopoJSON data with topojson.js
// Create map svg container and set projection using d3 -- Push translated TopoJSON data (see week 9)
// Draw Paths from TopoJSON data
// Create Information Panel div
// Create Filter in Menu Selection to filter out Unprotected and Protected Mounds (checkboxes)
// Create Reexpress method to color each Mound Site as Destroyed, Partially Intact, Intact, or Unknown
// Create Retrieve via onClick/onMouseover to select Mounds
// Create Dynamic Label Method for onClick/onMouseover of a mound
// Create Overlay/Reexpress method to overlay historical tribal bounds
// Determine Zoom, Pan, and Search Constraints if we are restricting until end of article

// Miscellaneous Pseudocode

// Create divs/styles for Article Information, Titles, Sources, etc --> i.e. all non-Map elements
// Create Map containers, adjust for screen sizes(?)
// Coherent Style Scheme --> Styles of Article body and of Map should be compatible.
