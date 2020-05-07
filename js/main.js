//Final Project - Zoey Colglazier, Jake Hildebrand, Brody Manquen, Nick Smith
//Wrapper Function for Choropleth Map
(function(){
  var choroplethArray = ["Minimum Number of Individuals (MNI)", "Associated Funerary Objects (AFO)"]
  expressed = choroplethArray[0]
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
    var path = d3.geoPath()
        .projection(choroProjection);
    //use Promise.all to parallelize asynchronous data loading
    var promises = [];
    promises.push(d3.csv("data/choropleth/choroplethData.csv"));  //placeholder csv file name
    promises.push(d3.json("data/choropleth/US_states.json"));
    promises.push(d3.json("data/choropleth/countries.json"));
    Promise.all(promises).then(callback);

    function callback(data){
      choroplethData = data[0];
      usStates = data[1];
      var states = topojson.feature(usStates, usStates.objects.US_states).features;
      states = joinChoroData(states, choroplethData);
      var choroplethColorScale = choroColors();
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
          var geojsonKey = geojsonProps.postal //sets geojson key
          if (geojsonKey == csvKey){
            choroplethArray.forEach(function(attr){
              var val = parseFloat(csvState[attr]);
              geojsonProps[attr] = val;
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
            var clusters = ss.ckmeans(mni, 7);
            mni = clusters.map(function(d){
              return d3.min(d);
            });
            mni.shift();
            colorScale.domain(mni)
      }else{
        var clusters = ss.ckmeans(afo, 7);
        afo = clusters.map(function(d){
          return d3.min(d);
        });
        afo.shift();
        colorScale.domain(afo)
      };
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
      var basemap = d3.select("div#flowmap")
        .append("svg")
        .attr("class", "flowmap img-fluid")
        .attr("width", width)
        .attr("height", height)
        .attr('x', 100)
        .attr('y', 500)
        .call(d3.zoom().on("zoom", function () {
            basemap.attr("transform", d3.event.transform)
        }))
        .append("g");
      var flowPanel = d3.select("div#flowpanel")
      //Geo Albers Area Conic Projection
      var baseProjection = d3.geoAlbers()
        .center([4.25, 44.90])
        .scale(8700)
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
        };
      };
  function getWisconsin(wisc, basemap, path){
        var wiPath = basemap.selectAll(".counties")
          .data(wisc)
          .enter()
          .append("path")
          .attr("class", function(d){
            return "county " + d.properties.NAME; //Sets county name
            })
          .attr("d", path)
          .style("fill", "#ddd");
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
              return "reservation " + d.properties.label; //Sets Institution Name
              })
            .attr("d", path)
            .style("fill", "#555")
            .on("mouseover", function(d){   //Mouseover events
              InstDehighlight_noLine();
              ReservDehighlight_noLine(d);
              ReservHighlight_noLine(basemap, baseProjection, wiReserv, lands, wisc, d);
            })
            .on("click", function(d){  //Click events
              InstDehighlight();
              ReservDehighlight(d);
              ReservHighlight(basemap, baseProjection, wiReserv, lands, institutionsSource, d);
              removePanel(d)
              removeinstPanel(d)
              populatePanel(flowPanel,d, wisc, wiSource, wiReserv);
            })
            .on("mouseout", function(d){  //Mouseout Events
              ReservDehighlight_noLine(d);
            })
            var desc = reservation.append("desc")
              .text('{"stroke": "#555", "stroke-width":"0.5px"}');
            };
  function getInstitutions(flowPanel, basemap, baseProjection, wisc, institutionsSource, wiSource, wiReserv, path){
          var institution = basemap.selectAll(".institutions")
              .data(institutionsSource)
              .enter()
              .append("path")
              .attr("class", function(d){
                  return "institution " + d.properties.Name; //Sets Institution Name
                    })
              .attr("d", path.pointRadius(4))  //Institution Size
              .style("fill", "#555")
              .style("stroke", "#FFFAFA")   //Institution Style
              .style("stroke-width", "0.5px")
                .on("zoom", zoom)
                .on("mouseover", function(d){   //Mouseover events
                      ReservDehighlight_noLine(d);
                      InstDehighlight_noLine();
                      InstHighlight_noLine(basemap, baseProjection, wisc, d, wiSource);
                  })
                .on("click", function(d){   //Click Events
                      ReservDehighlight(d);
                      InstDehighlight();
                      InstHighlight(flowPanel, basemap, baseProjection, wisc, d, wiSource, wiReserv);
                      removePanel(d)
                      removeinstPanel(d)
                      populatePanel(flowPanel, d, wisc, wiSource, wiReserv)
                  })
                .on("mouseout", function(d){   //Mouseout events
                  InstDehighlight_noLine()
                  });
            var desc = institution.append("desc")
              .text('{"stroke": "#FFFAFA", "stroke-width":"0.5px"}');
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
          if(wisc[obj].properties.NAME == wiSource[instit].County){   // I - check if Name of County is Equal to Name of a Target County for any Institutions
            if(props.properties.Name==wiSource[instit].Name){      // II - check if Dot hovered over has Name equal to name of an Institution in wiInstitutions that targets named County
              var target = [wisc[obj].properties.coordinates[1],wisc[obj].properties.coordinates[0]],  //if these two conditions are met, draw line from coordinates of Institution (from II) to coordinates of all counties it is linked to (from I)
                  origin = [props.geometry.coordinates[0],props.geometry.coordinates[1]]
                  topush = {type: "LineString", coordinates: [origin, target]}    //create LineString element with Each Coordinate Array as the two End Points
                  link.push(topush)  //push link data
              basemap.selectAll("myPath") //Draw Lines on Basemap
                .data(link) //enter link data
                .enter()
                .append("path") //append arc
                  .attr("class", function(d){
                    return "arc"; //name it  "arc"
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
  // Create Highlight function
  function ReservHighlight(basemap, baseProjection, wiReserv, lands, institutionsSource, props){
    var selected = d3.selectAll("." + props.properties.label)
      .style("stroke", "purple")
      .style("stroke-width", "1.5");
    reservationLines(basemap, baseProjection, wiReserv, props, institutionsSource, lands);
    };
  function ReservHighlight_noLine(basemap, baseProjection, wiReserv, lands, wisc, props){
      var selected = d3.selectAll("." + props.properties.label)
        .style("stroke", "purple")
        .style("stroke-width", "1.5");
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
    var menominee = d3.selectAll(".county.Menominee")  //Must specifically Dehighlight Menominee County because it is both a Reservation and County so it will stay highlighted otherwise
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
  }
  function InstHighlight(flowPanel,basemap, baseProjection, wisc, props, wiSource, wiReserv){
    var selected = d3.selectAll("."+props.properties.Name)
      .style("stroke", "purple")
      .style("stroke-width", "1.5")
    instLines(basemap, baseProjection, props, wisc, wiSource);
    populatePanel(flowPanel,props, wisc, wiSource, wiReserv)
    };
  function InstHighlight_noLine(basemap, baseProjection, wisc, props){
      var selected = d3.selectAll("."+props.properties.Name)
        .style("stroke", "purple")
        .style("stroke-width", "1.5")
      };
  // Create Dehighlight Function
  function InstDehighlight(){  //Dehigelights Institutions
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
    d3.selectAll(".arc")
      .remove();
  };
  function InstDehighlight_noLine(){  //Dehighlights Everything but the Flow Lines
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
  };
//Populates Information Panel
  function populatePanel(flowPanel, props, wisc, wiSource, wiReserv){
    if (props.properties.NAMELSAD){
      var reservation;
      var templist = [];
      var item;
      var counter = 0
      for (reservation in wiReserv){
        if (props.properties.label == wiReserv[reservation].Label){  //Gets Data
          templist.push(wiReserv[reservation])
        }};
      for (reservation in wiReserv){
        if (props.properties.label == wiReserv[reservation].Label){
          var title = flowPanel.append("p")
            .text("Wisconsin Repatriations to the " + wiReserv[reservation].Tribe + ":")  //Sets Title of Info Panel
            break
          }};
      for (reservation in wiReserv){
        if (props.properties.label == wiReserv[reservation].Label){
          var text = flowPanel.append("p")
          .text(wiReserv[reservation].CollectionHistory);  //pushes text to Info Panel
    }}
  } else if (props.properties.Institution){
    var instit;
    var institList = [];
    for (instit in wiSource){
      if (props.properties.Name == wiSource[instit].Name){  //Gets Data
        institList.push(wiSource[instit])
      }};
    for (instit in wiSource){  //Title for Instit
      if (props.properties.Name == wiSource[instit].Name){
        var institutionName = flowPanel.append("p")
          .text(""+wiSource[instit].Institution+" Object Origins: ");
          break
      }
     }
     for (instit in wiSource){  //Populate Min Number Indiv for Instit
       if (props.properties.Name == wiSource[instit].Name){
         var institutionMNI = flowPanel.append("p")
           .text("Minimum number of individuals from "+wiSource[instit].County+": "+wiSource[instit].MNI);
       }
      }
      for (instit in wiSource){  //Populate Assoc Funerary Object Data for Instit
        if (props.properties.Name == wiSource[instit].Name){
          var institutionAFO = flowPanel.append("p")
            .text("Associated Funerary Objects from "+wiSource[instit].County+": "+wiSource[instit].AFO);
        }
       }
    }
  }
function removePanel(){
  $('#flowpanel').html(" ")
};
function removeinstPanel(){
  $('#flowpanel').html(" ")
}
  })();
//Wrapper Function for Mound Map
(function(){
  window.onload = setbaseMap();
  //build Wisconsin map
function setbaseMap(){
      var width = 600,
        height = 500;
      // Create map svg container and set projection using d3 -- Push translated TopoJSON data (see week 9)
      var basemap = d3.select(".aperture")
        .append("svg")
        .attr("id", "moundmap")
        .attr('class', 'aperture')
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", function () {
            basemap.attr("transform", d3.event.transform)
        }))
        .append("g");
      //Geo Albers Area Conic Projection
      var baseProjection = d3.geoAlbers()
        .center([4.35, 44.2])
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
        var wisc = topojson.feature(wisconsin, wisconsin.objects.cb_2015_wisconsin_county_20m).features;
        var mounds = topojson.feature(effigymounds, effigymounds.objects['RealEffigy_spaces']).features;
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
        var wiPath = basemap.selectAll(".counties")
          .data(wisc)
          .enter()
          .append("path")
          .attr("class", function(d){
            return "county " + d.properties.NAME;
            })
          .attr("d", path)
          .style("fill", function(d){
              return "#ddd";
            })
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
  };
function zoomed() {
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
function drawLocations(mounds, basemap, baseProjection) {
      var legend = d3.select("#moundlegend")
      legend.append("text").attr("x",-113).attr("y",9).attr("transform", "rotate(-90)").text("Mound status").style("font-size", "15px").style("font-weight", "bold").attr("alignment-baseline","middle")
      legend.append("circle").attr("cx",30).attr("cy",28).attr("r", 6).style("fill", "#1f78b4")
      legend.append("circle").attr("cx",30).attr("cy",48).attr("r", 6).style("fill", "#a6cee3")
      legend.append("circle").attr("cx",30).attr("cy",68).attr("r", 6).style("fill", "#b2df8a")
      legend.append("circle").attr("cx",30).attr("cy",88).attr("r", 6).style("fill", "#33a02c")
      legend.append("text").attr("x", 40).attr("y", 29).text("Intact").style("font-size", "15px").attr("alignment-baseline","middle")
      legend.append("text").attr("x", 40).attr("y", 49).text("Partially Destroyed").style("font-size", "15px").attr("alignment-baseline","middle")
      legend.append("text").attr("x", 40).attr("y", 69).text("Unknown").style("font-size", "15px").attr("alignment-baseline","middle")
      legend.append("text").attr("x", 40).attr("y", 89).text("Destroyed").style("font-size", "15px").attr("alignment-baseline","middle")

      var loc = basemap.selectAll("circle")
      	.data(mounds)
      	.enter()
      	.append("circle")
      	.attr("cx", function(d) {
            return baseProjection([d.properties['Longitutde'], d.properties['Latitude']])[0];
      		})
      	.attr("cy", function(d) {
            return baseProjection([d.properties['Longitutde'], d.properties['Latitude']])[1];
      	})
      	.attr("r", 1.25)
      	.attr("class", function(d){
          return "location " + d.properties['SiteName'];
        })
        .style("fill", function(d) {
          if(d.properties['status']=="intact"){
            return "#1f78b4"
          }
          if(d.properties['status']=="destroyed"){
            return "#33a02c"
          }
          if(d.properties['status']=="unknown"){
            return "#b2df8a"
          }
          if(d.properties['status']=='partially destroyed'){
            return "#a6cee3"
          }
        })
        .style("stroke", "#999")
        .style("stroke-width", 0.25)
        .on("mouseover", function(d){
          populatemoundPanel(d)
          mhighlight(d.properties);
        })
        .on("mouseout", function(d){
          removemoundPanel(d)
          mdehighlight(d.properties);
        })
        var desc = loc.append('desc')
            .text('{"stroke": "#999", "stroke-width":"0.25px"}')
    };
function removemoundPanel(){
console.log('panel removed')
d3.select('.moundtext').remove()
};
function populatemoundPanel(mounds){
      var dynamictext = d3.select("div#moundpanel")
        .attr('class', 'moundpaneltext')
        .text("This mound group is located in "+ mounds.properties['County']+" county at the "+mounds.properties['Present Name']+" site. The site has "+ mounds.properties["Sum"]+" mounds listed with status: "+mounds.properties['status']+".");
};
function mhighlight(props){
  var selected = d3.selectAll("." +props['SiteName'])
      .style("stroke", "purple")
      .style("stroke-width", ".42");
};
// Create Dehighlight Functions
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
