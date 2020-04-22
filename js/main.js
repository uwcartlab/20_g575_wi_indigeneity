// Pseudocode for Choropleth Map

// Collect TopoJSON data for US states and Promise data to SetMap() function
window.onload = setMap();

function setMap(){
    var width = 960,
        height = 460;
    // Create map svg container and set projection using d3 -- Push translated TopoJSON data (see week 9)
    var choropleth = d3.select("body")
      .append("svg")
      .attr("class", "map")
      .attr("width", width)
      .attr("height", height);

    var choroProjection = d3.geoAlbers()
      .center([0, 40])
      .rotate([97, 0, 0])
      .parallels([50, 70])
      .scale(970)
      .translate([width / 2, height / 2]);
    var path = d3.geoPath()
        .projection(choroProjection);
    //use Promise.all to parallelize asynchronous data loading
    var promises = [];
    //promises.push(d3.csv("data/choropleth/choroplethData.csv"));  //placeholder csv file name
    promises.push(d3.json("data/choropleth/US_states.json"));
    promises.push(d3.json("data/choropleth/countries.json"));
    Promise.all(promises).then(callback);

    function callback(data){
      //csvChoropleth = data[0];
      usStates = data[0];
      countries = data[1]
      // Translate TopoJSON data with topojson.js
      var states = topojson.feature(usStates, usStates.objects.US_states).features;
      var country = topojson.feature(countries, countries.objects.ne_50m_admin_0_countries);
      console.log(states)

      var countryPath = choropleth.append("path")
        .datum(country)
        .attr("class", "countries")
        .attr("d", path);

      var statePath = choropleth.selectAll(".states")
        .data(states)
        .enter()
        .append("path")
        .attr("class", function(d){
          console.log('hello')
          return "state " + d.properties.postal; //placeholder name
        })
        .attr("d", path);
    };
};


// Draw Paths from TopoJSON data
// Join GeoJSON features (States) with CSV data (of state repatriation raw numbers)
// Create ColorScale (which color? which Classification method?)
// Color Enumeration Units
// Create Reexpress Method -- Menu Select that changes Expressed data for each State (different types of artifacts)
// Recreate Color Scale and Recolor Each Enumeration Unit based on changed Expressed data
// Create Retrieve Method -- onMouseover or onClick methods
// Create Dynamic Label with State Name and Number of Returned Artifacts of Chosen Type
// Create Dynamic Legend for ColorScale for expressed dataset

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
