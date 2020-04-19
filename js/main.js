// Pseudocode for Choropleth Map
// Collect TopoJSON data for US states and Promise data to SetMap() function
// Translate TopoJSON data with topojson.js
// Create map svg container and set projection using d3 -- Push translated TopoJSON data (see week 9)
// Draw Paths from TopoJSON data
// Join GeoJSON features (States) with CSV data (of state repatriation raw numbers)
// Create ColorScale (which color? which Classification method?)
// Color Enumeration Units
// Create Reexpress Method -- Menu Select that changes Expressed data for each State (different types of artifacts)
// Recreate Color Scale and Recolor Each Enumeration Unit based on changed Expressed data
// Create Retrieve Method -- onMouseover or onClick methods
// Create Dynamic Label with State Name and Number of Returned Artifacts of Chosen Type
// Create Dynamic Legend for ColorScale for expressed dataset
//
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
// Create Reexpress method to dynamically call Flow Creation Method when a new Tribe/Institution is selected
// Create Overlay/Reexpress method to overlay historical tribal bounds when a Reservation/Tribe is selected
// Create Information Panel update method to dynamically update InfoPanel when new item selected
// Create (Dynamic?) Legend for Flowline sizes
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
