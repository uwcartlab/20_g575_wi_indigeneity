// Choropleth Map
//Wrapper Function for Choropleth Map
(function(){
  var choroplethArray = ["Option 1", "Option 2", "Option 3"]
  expressed = choroplethArray[0]
  window.onload = setMap();
  function setMap(){
    var width = 1000,
        height = 550;
    // Create map svg container and set projection using d3 -- Push translated TopoJSON data (see week 9)
    var choropleth = d3.select("body")
      .insert("svg", "#map")
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
    //promises.push(d3.csv("data/choropleth/choroplethData.csv"));  //placeholder csv file name
    promises.push(d3.json("data/choropleth/US_states.json"));
    promises.push(d3.json("data/choropleth/countries.json"));
    //promises.push(d3.json('data/WI_county.json'));
    Promise.all(promises).then(callback);

    function callback(data){
      //choroplethData = data[0];
      usStates = data[0];
      //wisconsin = data[2];
      // Translate TopoJSON data with topojson.js
      var states = topojson.feature(usStates, usStates.objects.US_states).features;
      console.log(states)
      //states = joinChoroData(states, choroplethData);
      //setbaseMap(wisconsin)
      //var choroplethColorScale = choroColors(choroplethData)
      setStates(states, choropleth, path);
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
              });
            };
          };
        };
      return states;
      };
  // Draw Paths from TopoJSON data
  function setStates(states, choropleth, path){
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
            return choroColors(d.properties[expressed]);
          } else {
            return "#ddd";
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
          .text('{"stroke": "#AAA", "stroke-width":"0.5px"}');
    };
  // Create Quantile (maybe use Natural Breaks?) Color Scale
  function choroColors(data){
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
  function dropdown(choroplethData){
    var dropdown = d3.select("body")  //change to info Panel --> Need to append to DIV
      .append("select")
      .attr("class", "dropdown")
      .on("change", function(){
        changeAttribute(this.value, choroplethData)
        });
    var titleOption = dropdown.append("option")
      .attr("class", "titleOption")
      .attr("disabled", "true")
      .text("Select Item Type");
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
    var choroplethColorScale = choroColors(choroplethData);
    //recolor States
    var states = d3.selectAll(".states")
      .transition()
      .duration(1000)
      .style("fill", function(d){
        var value = d.properties[expressed];
        if (value) {
          return choroplethColorScale(value);
        } else {
          return "#ddd";
        }
      });
  };
  // Create Retrieve Method -- onMouseover or onClick methods
  // Create Dynamic Label with State Name and Number of Returned Artifacts of Chosen Type
  function choroLabel(props){
    var labelAttribute = "<h1>"+props[expressed]+"</h1><b>"+expressed+"</b>";
    var infolabel = d3.select("body")
      .append("div")
      .attr("class", "infolabel")
      .attr("id", props.postal+"_label")
      .html(labelAttribute);
    var stateName = infolabel.append("div")
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
      .style("stroke", "red")
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
(function(){
  attrArray = ["Selection 1", "Selection 2"]
  expressed = attrArray[0]
  window.onload = setbaseMap();
  //build Wisconsin map
  function setbaseMap(){
      var width = 800,
          height = 500;
      // Create map svg container and set projection using d3 -- Push translated TopoJSON data (see week 9)
      var basemap = d3.select("body")
        .insert("svg", '#basemap')
        .attr("class", "basemap")
        .attr("width", width)
        .attr("height", height)
        .attr('x', 100)
        .attr('y', 500);
      //Geo Albers Area Conic Projection
      var baseProjection = d3.geoAlbers()
        .center([2.25, 44.88205])
        .scale(5000)
        .rotate([92.35, .5, -2])
        .translate([width / 2, height / 2])

      var path = d3.geoPath()
          .projection(baseProjection);
      var promises = [];
      promises.push(d3.json('data/effigy/wisconsin.json'));
      Promise.all(promises).then(callback);
      function callback(data){
        wisconsin = data[0];
        var wisc = topojson.feature(wisconsin, wisconsin.objects.cb_2015_wisconsin_county_20m).features;
        console.log(wisc)
        getWisconsin(wisc, basemap, path)
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
            })
          .on("mouseover", function(d){
            highlight(d.properties);
          })
          .on("mouseout", function(d){
            dehighlight(d.properties);
          })
          .on("mousemove", moveLabel);
          var desc = wiPath.append("desc")
            .text('{"stroke": "#AAA", "stroke-width":"0.5px"}');
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
    var dropdown = d3.select("body")  //change to info Panel --> Need to append to DIV
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
  // Create Dynamic Legend for ColorScale for expressed dataset
  // Create Highlight function
  function highlight(props){
    var selected = d3.selectAll("."+props.NAME)
      .style("stroke", "red")
      .style("stroke-width", "2");
    wiLabels(props);
    };
  // Create Dehighlight Function
  function dehighlight(props){
    var selected = d3.selectAll("."+props.NAME)
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
