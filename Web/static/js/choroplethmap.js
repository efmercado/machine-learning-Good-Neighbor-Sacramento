var link = "../static/data/police_beats.geojson"
var districts = "../static/data/police_districts.geojson"

var beatCrimeCount2 = [];

// Adding the tile layer
var runBikeHike = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 10,
  minZoom: 10,
  id: "mapbox.run-bike-hike",
  accessToken: API_KEY
});

var light = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/light-v10',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: API_KEY
});

var beatsCrime = {};

// ---------------------------------------------------------------------------------------- //

// Grabbing the GeoJSON data
d3.json(link, function(data) {

  // Grapping the crime data
  d3.json(crime, function(crimeData) {

    // Navigating through the json objects to display relevant data features
    var crimeData = crimeData.features.map(crimeData => crimeData.attributes)

    var crimeData = crimeData.filter(crime => crime.Beat != null)
    var crimeData = crimeData.filter(crime => crime.Beat != "UI")

    // Grouping crime data by Beat
    const groupedBeat = _.groupBy(crimeData, 'Beat')

    // Creating an array of offense for each Beat
    const crimeByBeat =  _.mapValues(groupedBeat, items => _.map(items, 'Offense_Category'))
  
    // Counting the number of offenses for each beat and storing in a dictionary
    var beatDictionary = {}
    Object.entries(crimeByBeat).forEach(function(item){
        var beat = item[0];

        beatDictionary[beat] = parameterCount(item[1])
           
    })
    
    // Converting beatDictionary into an array
    var beatArr = Object.entries(beatDictionary)
    
    // Storing beat and offense count into an array of arrays
    var beatCrimeCount = []
    for(var i=0; i<beatArr.length; i++){

        beatCrimeCount.push([beatArr[i][0], objectIter(beatArr)[i]])
    }

    // First sorting beatCrimeCount by letter
    beatCrimeCount.sort(function(a,b){
      
      if(a[0][1] < b[0][1]) { return -1; }
      if(a[0][1] > b[0][1]) { return 1; }

        return 0;
    });

    // Sorting once again by number
    beatCrimeCount.sort(function(a,b) {
        return a[0][0] - b[0][0];
    });

    //Joy's Code
    
    beatCrimeCount2 = [... beatCrimeCount];

    beatCrimeCount2.sort(function(a, b) {
      return a[1] - b[1];
    });

    //End: Joy's code

    // Creating a new GeoJSON dictionary/object that will hold crime count by beat
    dataDictionary = data.features.map(object => object.properties)

    // Sorting dataDictionary by letter
    dataDictionary.sort(function(a,b){
      
      if(a.BEAT[1] < b.BEAT[1]) { return -1; }
      if(a.BEAT[1] > b.BEAT[1]) { return 1; }

        return 0;
    });

    // Sorting once again by number
    dataDictionary.sort(function(a,b) {
      return a.BEAT[0] - b.BEAT[0];
    });

   // Adding the crime count by beat onto the GeoJSON dictionary/object
    for(var i=0; i<beatCrimeCount.length; i++){
      for(var j=0; j<dataDictionary.length; j++){
        if(beatCrimeCount[i][0] === dataDictionary[j].BEAT){
        dataDictionary[j]["Crime__Count"] = beatCrimeCount[i][1]
      }
      }
      
    }
  
// ---------------------------------------------------------------------------------------- //
        
    // Creating a GeoJSON layer with the retrieved GeoJSON data
    var geojson = L.choropleth(data, {

              // Defining what propety in the features to use
              valueProperty: "Crime__Count",

              // Setting the color Scale
              scale: ["#ffffb2", "#b10026"],

              // Number of breaks in step range
              steps: 10,

              // q for quartile, e for equidistant, k for k-means this case we are using quartile
              mode: "q",

              // Adding style
              style: {
                // Border color
                color: "#fff",
                weight: 1,
                fillOpacity: 0.8
              },

              // Bindind a pop-up to each layer
              onEachFeature: function(feature, layer){
                layer.bindPopup(`Beat: ${feature.properties.BEAT} <hr> Crime Count: ${feature.properties.Crime__Count}`)
                layer.on("mouseover", function() {
                  this.openPopup();
                });
                layer.on("mouseout", function() {
                  this.closePopup();
                });
              }
              })

    d3.json(districts, function(districtData) {

      // Grouping crime data by District
      const groupedDistrict = _.groupBy(crimeData, 'Police_District')
      

      // Creating an array of offense for each District
      const crimeByDistrict =  _.mapValues(groupedDistrict, items => _.map(items, 'Offense_Category'))

      // Counting the number of offenses for each district and storing in a dictionary
      var districtDictionary = {}
      Object.entries(crimeByDistrict).forEach(function(item){
        var district = item[0];

        districtDictionary[district] = parameterCount(item[1])
           
      })

      // Converting districtDictionary into an array
      var districtArr = Object.entries(districtDictionary)

      // Storing district and offense count into an array of arrays
      var districtCrimeCount = []
      for(var i=0; i<districtArr.length; i++){

          districtCrimeCount.push([districtArr[i][0], objectIter(districtArr)[i]])
      }
      
      // // Creating a new GeoJSON dictionary/object that will hold crime count by district
      districtDataDictionary = districtData.features.map(object => object.properties)
      
      // // Adding the crime count by district onto the GeoJSON dictionary/object
      for(var i=0; i< (districtCrimeCount.length); i++){
        districtDataDictionary[i]["Crime__Count"] = districtCrimeCount[i][1]
      }
      
      // Creating a GeoJSON layer with the retrieved data
      var district = L.choropleth(districtData, {
        
        // Defining what propety in the features to use
        valueProperty: "Crime__Count",
    
        // Setting the color Scale
        scale: ["#ffffb2", "#b10026"],
    
        // Number of breaks in step range
        steps: 10,
    
        // q for quartile, e for equidistant, k for k-means this case we are using quartile
        mode: "q",
    
        // Adding style
        style: {
          // Border color
          color: "#ffffb2",
          weight: 1,
          fillOpacity: 0.8
        },

        // Bindind a modal to each layer
        onEachFeature: function(feature, layer){
            layer.bindPopup(`District: ${feature.properties.DISTRICT} <hr> Crime Count: ${feature.properties.Crime__Count}`);
            layer.on("mouseover", function() {
              this.openPopup();
            });
            layer.on("mouseout", function() {
              this.closePopup();
            });
            layer.on({
              click: whenClicked
              })
        }
        })

      var mainBaseMaps = {
        "Green": runBikeHike,
        "Light": light
      } 

      var mainOverlayMaps = {
        "Districts": district
      }

      var modalBaseMaps = {
        "Green": runBikeHike,
        "Light": light
      }

      var modalOverlayMaps = {
        "Beats": geojson
      }

     
      // Creating the map object
      var mainMap = L.map("main-map", {
        center: [38.5816, -121.4944],
        zoom: 10,
        layers: [runBikeHike, district],
        zoomControl: false,
        draggable: false
      });

      L.control.layers(mainBaseMaps, mainOverlayMaps, {
                    collapsed: false
                  }).addTo(mainMap)

      var modalMap = L.map("modal-map", {
        center: [38.5716, -121.4944],
        zoom: 10,
        layers: [light, geojson],
        zoomControl: false,
        draggable: false
      });

      L.control.layers(modalBaseMaps, modalOverlayMaps, {
        collapsed: false
      }).addTo(modalMap)

// ------------------------------------------------------------------------------------------ //
      // Creating legend
      var legend = L.control({position: "bottomright"});
        
      legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var limits = geojson.options.limits;
        var colors = geojson.options.colors;
        var labels = []

        // Add min & max
        var legendInfo = "<center>Crime count from Jan 2020 to today</center>"+
        "<div class=\"labels\">"+
          "<div class=\"min\">" + limits[0] + "</div>" +
          "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
          "</div>";

        div.innerHTML = legendInfo;

        limits.forEach(function(limit, index) {
          labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;

      }
      // Appending legend
      legend.addTo(modalMap)

    // Creating legend
    var mainLegend = L.control({position: "bottomright"});
        
    mainLegend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
      var limits = district.options.limits;
      var colors = district.options.colors;
      var labels = []

      // Add min & max
      var legendInfo = "<center>Crime count from Jan 2020 to today</center>"+
      "<div class=\"labels\">"+
        "<div class=\"min\">" + limits[0] + "</div>" +
        "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
        "</div>";

      div.innerHTML = legendInfo;

      limits.forEach(function(limit, index) {
        labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
      });

      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
      return div;

    }
    // Appending legend
    mainLegend.addTo(mainMap)

  })

  })
});