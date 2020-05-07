//Final Project 75% Check-in
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
  window.onload = setbaseMap();
  //build Wisconsin map
  function setbaseMap(){
      var width = 800,
          height = 800;
      // Create map svg container and set projection using d3 -- Push translated TopoJSON data (see week 9)
      //var zoom = d3.zoom().on('zoom', zoomed);
      //var transform = d3.event.transform;
      var basemap = d3.select("div#flowmap")
        .append("svg")
        .attr("class", "flowmap")
        .attr("width", width)
        .attr("height", height)
        .attr('x', 100)
        .attr('y', 500)
        //.call(zoom)
        //.attr('transform', transform.toString())
        .call(d3.zoom().on("zoom", function () {
            basemap.attr("transform", d3.event.transform)
        }))
        .append("g");
      var flowPanel = d3.select("div#flowpanel")
        .append("svg")
        .attr("class", "information")
        .attr("width", 395)
        .attr("height", 800)
        //.attr('x', 100)
        //.attr('y', 500);
      //Geo Albers Area Conic Projection
      var baseProjection = d3.geoAlbers()
        .center([4.25, 44.90])
        .scale(8800)
        .rotate([92.35, .5, -2])
        .translate([width / 2, height / 2]);

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
      promises.push(d3.csv('data/nagpra/wiReservations.csv'));
      promises.push(d3.json('data/nagpra/Sources.json'));
      Promise.all(promises).then(callback);

      function callback(data){
        wisconsin = data[0];
        res = data[1];
        instit = data[2];
        wiDest = data[3];
        wiInst = data[4];
        wiSource = data[7];
        wiReserv = data[8];
        sourceInst = data[9]
        var wisc = topojson.feature(wisconsin, wisconsin.objects.cb_2015_wisconsin_county_20m).features;
        var lands = topojson.feature(res, res.objects.wiRes).features;
        var institutions = topojson.feature(instit, instit.objects.Museumlocations).features;
        var institutionsSource = topojson.feature(sourceInst, sourceInst.objects.Sources).features;
        getWisconsin(wisc, basemap, path);
        getReservations(flowPanel, wisc, lands, wiReserv, basemap, path, baseProjection, wiSource, institutionsSource);
        getInstitutions(flowPanel, basemap, baseProjection, wisc, institutionsSource, wiSource, wiReserv, path);
        //buildInfoPanel(wiSource, wiInst, wiReserv)
        };
      };
  function setInfoPanel(width, height){
    var flowPanel = d3.select("div#flowpanel")
    .append("svg")
    .attr("class", "flowpaneltext")
    .attr("width", 250)
    .attr("height", 500)
    .attr('x', 250)
    .attr('y', 500)
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
          var desc = wiPath.append("desc")
            .text('{"stroke": "#AAA", "stroke-width":"0.5px"}');
        };
  function zoom() {
        d3.select(this).attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      };
  function getReservations(flowPanel, wisc, lands, wiReserv, basemap, path, baseProjection, wiSource, institutionsSource){
          var reservation = basemap.selectAll(".lands")
            .data(lands)
            .enter()
            .append("path")
            .attr("class", function(d){
              return "reservation " + d.properties.label; //placeholder name
              })
            .attr("d", path)
            .style("fill", "#555")
            .on("mouseover", function(d){
              InstDehighlight_noLine(wisc, d);
              ReservDehighlight_noLine(d);
              ReservHighlight_noLine(basemap, baseProjection, wiReserv, lands, wisc, d);
            })
            .on("click", function(d){
              InstDehighlight(wisc, d);
              ReservDehighlight(d);
              ReservHighlight(basemap, baseProjection, wiReserv, lands, institutionsSource, d);
              populatePanel(flowPanel,d, wisc, wiSource, wiReserv);
            })
            //.on("mouseout", function(d){
            //  ReservDehighlight(d);
            //})
            //.on("mousemove", moveLabel);
            var desc = reservation.append("desc")
              .text('{"stroke": "#555", "stroke-width":"0.5px"}');
            };
  function getInstitutions(flowPanel, basemap, baseProjection, wisc, institutionsSource, wiSource, wiReserv, path){
          var institution = basemap.selectAll(".institutions")
              .data(institutionsSource)
              .enter()
              .append("path")
              .attr("class", function(d){
                  return "institution " + d.properties.Name; //placeholder name
                    })
              //.attr("d", path)
              .attr("d", path.pointRadius(4))
              .style("fill", "#555")
              .style("stroke", "#FFFAFA")
              .style("stroke-width", "0.5px")
                .on("zoom", zoom)
                .on("mouseover", function(d){
                      ReservDehighlight_noLine(d);
                      InstDehighlight_noLine(wisc, d);
                      InstHighlight_noLine(basemap, baseProjection, wisc, d, wiSource);
                  })
                .on("click", function(d){
                      ReservDehighlight(d);
                      InstDehighlight(wisc, d);
                      InstHighlight(flowPanel, basemap, baseProjection, wisc, d, wiSource, wiReserv);
                      populatePanel(flowPanel, d, wisc, wiSource, wiReserv)
                  })
                  //.on("mouseout", removePanel());
            var desc = institution.append("desc")
              .text('{"stroke": "#FFFAFA", "stroke-width":"0.5px"}');
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
  //create Lines from institutions to counties
  function instLines(basemap, baseProjection, props, wisc, wiSource){
      var path = d3.geoPath() //create Path generator
        .projection(baseProjection) //use baseProjection
      var link = []  // creates array for linestrings to be pushed
      var obj; // objects in County topojson
      var instit; //institutions in wisconsin institutions csv
      for (obj in wisc){  //iterate each county
        for (instit in wiSource){ //iterate each institution
          if(wisc[obj].properties.NAME == wiSource[instit].County){                                                                    // I - check if Name of County is Equal to Name of a Target County for any Institutions
            if(props.properties.Name==wiSource[instit].Name){      // II - check if Dot hovered over has Name equal to name of an Institution in wiInstitutions that targets named County                                      //if these two conditions are met, draw line from coordinates of Institution (from II) to coordinates of all counties it is linked to (from I)
                //set target coordinates
              var target = [wisc[obj].properties.coordinates[1],wisc[obj].properties.coordinates[0]],
                //set origin coordinates
                  origin = [props.geometry.coordinates[0],props.geometry.coordinates[1]]
                //create LineString element with Each Coordinate Array as the two End Points
                  topush = {type: "LineString", coordinates: [origin, target]}
                  //console.log(topush)
                  //push LineString to array
                  link.push(topush)
              //Draw Lines on Basemap
              basemap.selectAll("myPath")
                .data(link) //enter link data
                .enter()
                .append("path") //append arc
                  .attr("class", function(d){
                    //console.log(link)
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
  function reservationLines(basemap, baseProjection, wiReserv, props, institutionsSource, lands){
      var path = d3.geoPath()
        .projection(baseProjection)
      var link = []
      var instit;
      var reserv;
      for (instit in institutionsSource){
        for (reserv in wiReserv){
          if(institutionsSource[instit].properties.Name == wiReserv[reserv].InstitLabel){  // I - check if Name of County is Equal to Name of a Target County for any Institutions
            if(props.properties.label == wiReserv[reserv].Label){
              var target = [institutionsSource[instit].geometry.coordinates[0],institutionsSource[instit].geometry.coordinates[1]],
                  origin = [props.properties.center[0],props.properties.center[1]]
                  topush = {type: "LineString", coordinates: [origin, target]}
                  link.push(topush)
              basemap.selectAll("myPath")
                  .data(link)
                  .enter()
                  .append("path")
                    .attr("class", function(d){
                      return "arc"; //name it  "arc" --> may need more specific name for Final
                      })
                    .attr("d", function(d){return path(d)})
                    .style("fill", "none")
                    .style("stroke", "#807dba")
                    .style("stroke-width", 2)
                    .style("stroke-linejoin", "round")
            }
          }
        }
      }
    };
  // Create Dynamic Legend for ColorScale for expressed dataset
  // Create Highlight function
  function ReservHighlight(basemap, baseProjection, wiReserv, lands, institutionsSource, props){
    //console.log(props)
    var selected = d3.selectAll("." + props.properties.label)
      .style("stroke", "purple")
      .style("stroke-width", "1.5");
    wiLabels(props);
    reservationLines(basemap, baseProjection, wiReserv, props, institutionsSource, lands);
    };
  function ReservHighlight_noLine(basemap, baseProjection, wiReserv, lands, wisc, props){
      //console.log(props)
      var selected = d3.selectAll("." + props.properties.label)
        .style("stroke", "purple")
        .style("stroke-width", "1.5");
      wiLabels(props);
      };
  // Create Dehighlight Function
  function ReservDehighlight(props){
   var selected = d3.selectAll(".reservation")
      .style("stroke", function(){
        return getStyle(this, "stroke")
      })
      .style("stroke-width", function(){
        return getStyle(this, "stroke-width")
      });
    var menominee = d3.selectAll(".county.Menominee")
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
  function ReservDehighlight_noLine(props){
   var selected = d3.selectAll(".reservation")
      .style("stroke", function(){
        return getStyle(this, "stroke")
      })
      .style("stroke-width", function(){
        return getStyle(this, "stroke-width")
      });
    var menominee = d3.selectAll(".county.Menominee") //because Menominee is both a county and a reservation, this de-highlights the County specifically as the previous var only dehighlights the reservations
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
  function InstHighlight(flowPanel,basemap, baseProjection, wisc, props, wiSource, wiReserv){
    //console.log(props)
    var selected = d3.selectAll("."+props.properties.Name)
      .style("stroke", "purple")
      .style("stroke-width", "1.5")
    wiLabels(props);
    instLines(basemap, baseProjection, props, wisc, wiSource);
    populatePanel(flowPanel,props, wisc, wiSource, wiReserv)
    };
  function InstHighlight_noLine(basemap, baseProjection, wisc, props){
      //console.log(props)
      var selected = d3.selectAll("."+props.properties.Name)
        .style("stroke", "purple")
        .style("stroke-width", "1.5")
      wiLabels(props);
      };
  // Create Dehighlight Function
  function InstDehighlight(wisc,props){
   var selected = d3.selectAll(".institution")
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
  function InstDehighlight_noLine(wisc,props){
   var selected = d3.selectAll(".institution")
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
  };
//we'll use this eventually
  function populatePanel(flowPanel, props, wisc, wiSource, wiReserv){
    if (props.properties.NAMELSAD){
      var reservation;
      for (reservation in wiReserv){
        if (props.properties.label == wiReserv[reservation].Label){
          console.log("Gets to final step in Reservation Text Append")
          var text = flowPanel.append("text")
            .append("p")
            .attr("class", "flowpaneltext")
            .text('');
          //var reservationText = text
          //  .attr('class', 'flowpaneltext')
          //  .text("Notes: "+wiReserv[reservation].CollectionHistory+".");
      }
    }
  } else if (props.properties.Institution){
    var instit;
    for (instit in wiSource){
      if (props.properties.Name == wiSource[instit].Name){
        console.log("Gets to final step in Institution Text Append")
        var institutionText = flowPanel.selectAll(".information")
          .attr('class', 'flowpaneltext')
          .append("p")
          .text("This is the "+wiSource[instit].Institution+".");
      }
    }
  }
};

//function removePanel(){
  //console.log('panel removed')
  //d3.select('.flowpaneltext').remove()
//}
  })();



//Wrapper Function for Mound Map
(function(){
  window.onload = setbaseMap();
  //build Wisconsin map
  function setbaseMap(){
      var width = 600,
        height = 500;
      // Create map svg container and set projection using d3 -- Push translated TopoJSON data (see week 9)
      var basemap = d3.select("div#main")
        .append("svg")
        .attr("id", "moundmap")
        .attr('class', 'aperture')
        .attr("width", width)
        .attr("height", height)
        // .attr('viewBox', "0 0 600 450") //400 250 ratio
        // .attr('preserveAspectRatio', "none")
        .call(d3.zoom().on("zoom", function () {
            basemap.attr("transform", d3.event.transform)
        }))
        .append("g");
      //Geo Albers Area Conic Projection
      var baseProjection = d3.geoAlbers()
        .center([3.35, 46.2])
        .scale(5500)
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
var moundmap_svg;
var mini_svg;
var viewbox;
var brush;
var extent;
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
          //.call(zoom)
          .style("fill", function(d){
              return "#ddd";
            })
          .call(responsivefy)
          var desc = wiPath.append("desc")
            .text('{"stroke": "#AAA", "stroke-width":"0.5px"}')
           moundmap_svg = d3.select("#main svg").attr("class", "zoom")
           mini_svg   = d3.select("#moundmini svg").append("g").attr("class", "zoom")

              // store the image's initial viewBox
             viewbox = moundmap_svg.attr("viewBox").split(' ').map(d => +d)
             extent = [
                      [viewbox[0], viewbox[1]]
                    , [(viewbox[2] - viewbox[0]), (viewbox[3] - viewbox[1])]
                  ]
               brush  = d3.brush()
                    .extent(extent)
                    .on("brush", brushed)
              const zoom = d3.zoom().scaleExtent([0.05, 1]).on("zoom", zoomed);
            // Apply the brush to the minimap, and also apply the zoom behavior here
            mini_svg
                .call(brush)
                .call(brush.move, brush.extent())
                .call(zoom);
            // Apply the zoom behavior to the moundmap svg
            moundmap_svg
                .call(zoom);
        };

    function brushed() {
                // Ignore brush-via-zoom
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
            let sel = d3.event.selection
                  let vb = sel
                        ? [sel[0][0], sel[0][1], (sel[1][0] - sel[0][0]), (sel[1][1] - sel[0][1])]
                        : viewbox
                  let k = vb[3] / viewbox[3]
                  let t = d3.zoomIdentity.translate(vb[0], vb[1]).scale(k);
                mini_svg
                    .property("__zoom", t);
                moundmap_svg
                    .attr("viewBox", vb.join(' '))
                    .property("__zoom", t);
  }; // brushed()

  function zoomed() {
      if(this === mini_svg.node()) {
        mini_svg.call(d3.zoom().on("zoom", function () {
                mini_svg.attr("transform", d3.event.transform)
        }))
            }

      if(!d3.event.sourceEvent || d3.event.sourceEvent.type === "brush") return;

                // Process the zoom event on the moundmap SVG
        let t = d3.event.transform;
        t.x = t.x < viewbox[0] ? viewbox[0] : t.x;
        t.x = t.x > viewbox[2] ? viewbox[2] : t.x;
        t.y = t.y < viewbox[1] ? viewbox[1] : t.y;
        t.y = t.y > viewbox[3] ? viewbox[3] : t.y;
        if(t.k === 1) t.x = t.y = 0;

        const vb = [t.x, t.y, viewbox[2] * t.k, viewbox[3] * t.k];

        moundmap_svg.attr("viewBox", vb.join(' '));
        mini_svg
              .property("__zoom", t)
              .call(brush.move, [[t.x, t.y], [t.x + vb[2], t.y + vb[3]]]);
  };
  function responsivefy(svg) {
  // container will be the DOM element
  // that the svg is appended to
  // we then measure the container
  // and find its aspect ratio
  const container = d3.select(svg.node().parentNode),
      width = parseInt(svg.style('width'), 10),
      height = parseInt(svg.style('height'), 10),
      aspect = width / height;

  // set viewBox attribute to the initial size
  // control scaling with preserveAspectRatio
  // resize svg on inital page load
  svg.attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMid')
      .call(resize);

  // add a listener so the chart will be resized
  // when the window resizes
  // multiple listeners for the same event type
  // requires a namespace, i.e., 'click.foo'
  // api docs: https://goo.gl/F3ZCFr
  d3.select(window).on(
      'resize.' + container.attr('id'),
      resize
  );

  // this is the code that resizes the chart
  // it will be called on load
  // and in response to window resizes
  // gets the width of the container
  // and resizes the svg to fill it
  // while maintaining a consistent aspect ratio
  function resize() {
      const w = parseInt(container.style('width'));
      svg.attr('width', w);
      svg.attr('height', Math.round(w / aspect));
  }
}
  function drawLocations(mounds, basemap, baseProjection) {
      var legend = d3.select("#moundlegend")
      legend.append("text").attr("x",-113).attr("y",9).attr("transform", "rotate(-90)").text("Mound status").style("font-size", "15px").style("font-weight", "bold").attr("alignment-baseline","middle")
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
        .on("mouseover", function(d){
          // updatePopup(d)
          populatePanel(d)
          mhighlight(d.properties);
        })
        .on("mouseout", function(d){
          removePanel(d)
          mdehighlight(d.properties);
        })
        var desc = loc.append('desc')
            .text('{"stroke": "#AAA", "stroke-width":"0.5px"}')
    }

//     function PopupContent(mounds){
//       var dynamictext = d3.select("div#moundpanel")
//         .attr('class', 'moundpaneltext')
//         .append("p")
//         .text("This mound group is located in "+ mounds.properties['County']+" county at the "+mounds.properties['Present Name']+" site. The site has "+ mounds.properties["Sum"]+" mounds listed with status: "+mounds.properties['status']+".");
//     }
// var popupContent = ''
//     function updatePopup(mounds){
//       console.log("sss")
//       d3.select("#moundmap")
//           var popupContent = new PopupContent(mounds)
//       };

    function populatePanel(mounds){
      // d3.select('col-md-4')
      //   .append('div', '#moundpanel')
      var dynamictext = d3.select("div#moundpanel")
        .attr('class', 'moundpaneltext')
        .append("p")
        .text("This mound group is located in "+ mounds.properties['County']+" county at the "+mounds.properties['Present Name']+" site. The site has "+ mounds.properties["Sum"]+" mounds listed with status: "+mounds.properties['status']+".");
    };

  function removePanel(mounds){
    console.log('nnnnn')
    // popupContent = ""
    d3.select('.moundpaneltext').remove()
  }

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
};

})();
