console.log('This is a console test');

// all javascript needs to be written within the .ready()
$(document).ready(function(){
    
    var cities;
    var map = L.map('map', {
        center: [-9.526115, -77.528778],
        zoom: 6,
        minZoom: 5,
        maxZoom: 7,
    });

   // L.tileLayer(
        var darktheme = L.tileLayer('https://api.mapbox.com/styles/v1/hoovco/ck7th62ul3vdy1imk5gvmpc85/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiaG9vdmNvIiwiYSI6ImNrODJia3p4NzB6cDIzZXBha3Fzb3RiOW0ifQ.dzT0EQXtMyS-ME9Ut3rIzQ', { attribution: '&copy; <a href= "https://www.mapbox.com/about/maps/">Mapbox </a> | <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> | Author: Corey K. S. Hoover: <a href= "mailTo:corey.k.s.hoover@gmail.com">corey.k.s.hoover@gmail.com</a>'
        }).addTo(map);//using add.To to make the dark theme the default theme
        
        var lighttheme = L.tileLayer('https://api.mapbox.com/styles/v1/hoovco/ck898puj327cx1in0bwdwh47x/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiaG9vdmNvIiwiYSI6ImNrODJia3p4NzB6cDIzZXBha3Fzb3RiOW0ifQ.dzT0EQXtMyS-ME9Ut3rIzQ', { attribution: '&copy; <a href= "https://www.mapbox.com/about/maps/">Mapbox </a> | <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> | Author: Corey K. S. Hoover: <a href= "mailTo:corey.k.s.hoover@gmail.com">corey.k.s.hoover@gmail.com</a>'
        });
    
        var baseMaps = {
            "Dark Theme": darktheme,
            "Light Theme": lighttheme
        };
    
    //var popupinfo = L.popup({ //heard you can do neat things with this. might mess around with it later 
        //closeButton: false,
        //autoClose: false
        //})
        //.setLatLng([39.7392, -104.9903])
        //.setContent('<p>Text box on a map</p>')
        //.openOn(map);
    
    
    L.control.layers(baseMaps).addTo(map); //adding my control to the map
    
    function processData(data) {
        var timestamps = [];
        var min = Infinity;
        var max = -Infinity;
        
        for (var feature in data.features) {
            
            var properties = data.features[feature].properties;
            
            for (var attribute in properties) {
            
                if (attribute != 'id' &&
                    attribute != 'name' &&
                    attribute != 'lat' &&
                    attribute != 'lon' ) 
                {
                
                    if ( $.inArray(attribute,timestamps) === -1) {
                            timestamps.push(attribute);
                    }
                
                    if (properties[attribute] < min) {
                            min = properties[attribute];        
                    }
                
                    if (properties[attribute] > max) {
                            max = properties[attribute];        
                    }
                }
            }
        }
    
        return{
                timestamps : timestamps,
                min : min,
                max : max
        }
    }
    
    //haphazardly added this code. check this twice
    
    //var layers = {};
    function createPropSymbols(timestamps, data) {

		districts = L.geoJson(data, {//can I use this as a toggle point?

			pointToLayer: function(feature, latlng) {

				return L.circleMarker(latlng, {

				    fillColor: "red",
				    color: 'red',
				    weight: 1,
				    fillOpacity: 0.25

				}).on({

					mouseover: function(e) {
						this.openPopup();
						this.setStyle({color: 'white'});
					},
					mouseout: function(e) {
						this.closePopup();
						this.setStyle({color: 'red'});

					}
				});
			}
		}).addTo(map);

		updatePropSymbols(timestamps[0]);
        
   // var myLayersControl = L.control.layers(cities, layers).addTo(map); //figure this out - have a button thing going but dont know how to get it going.


	} 
    
    // end createPropSymbols()
    // defining the function updatePropSymbols below
    //timestamp vs timestamps below? Be sure to double check this. 
    function updatePropSymbols(timestamp)   {
        
        districts.eachLayer(function(layer) {
            
            var props = layer.feature.properties; // check into this
            var radius = calcPropRadius(props[timestamp]); // function defined below - basically creating fucntion to calculate the radius. Probably modify based on my map scale?
            
            //var popupContent = props.name + ' year ' + timestamp + ' dengue cases: ' + String(props[timestamp]) // think of how to edit this into sayig what you want it to say more fluidly. 
            
            // working on a secondary way to represent this:
            var popupContent = '<p><b>District: </b>' + props.name + '<p><b>Year: </b>' + timestamp + '<p><b>Dengue Cases: </b>' + String(props[timestamp])
            
            layer.setRadius(radius);  // Leaflet method for setting the radius of a circle
            layer.bindPopup(popupContent, { offset: new L.Point(0,-radius) }); // bind the popup content, with an offset - look into what offset does for sure
            
            // dialogue on roll over - modfied for dengue. Change this up later? for now, keeping it simple. 
        });
        
    }
    
    // calculate the radius of the proportional symbols based on area
    function calcPropRadius(attributeValue) {

        var scaleFactor = 0.5;   // scale factor - adjust accordingly based on application 
        var area = attributeValue * scaleFactor;

        return Math.sqrt(area/Math.PI);  // the function return the radius of the circle to be used in the updatePropSymbols()
        
    }
    
    // creating circle legend here - compare this to the class example to try different things: - this is the thing I messed up last 21:11
    
    function createLegend(min, max) {
        if (min < 10) {
            min = 1000; //changed to 1000 as minimum to be impactful on the legend. 
        }
        function roundNumber(inNumber) {
        
        return (Math.round(inNumber/10) * 10);
        }
        
        var legend = L.control( {position: 'bottomright'} );
        
        legend.onAdd = function(map) {
            
        var legendContainer = L.DomUtil.create("div", "legend"); //using DomUtil to create these two entities
        var symbolsContainer = L.DomUtil.create("div", "symbolsContainer");
        //var classes = [roundNumber(min), roundNumber((max-min)/2), roundNumber(max)]; //creating the mathematical cutoffs for the symbol classes. changed this for usability
        var classes = [1000, 15000, 45000]; // new cutoffs for better interface on a static legend
        var legendCircle;
        var lastRadius = 0;
        var currentRadius;
        var margin;
            
        L.DomEvent.addListener(legendContainer, 'mousedown', function(e) {
            L.DomEvent.stopPropagation(e);
        });
        
        $(legendContainer).append("<h2 id='legendTitle'>Dengue Cases</h2>");
            
        for (var i = 0; i <= classes.length-1; i++) {
            
            legendCircle = L.DomUtil.create("div", "legendCircle");
            
            currentRadius = calcPropRadius(classes[i]);
            
            margin = -currentRadius - lastRadius - 2;
            
            $(legendCircle).attr("style", "width: " +currentRadius*2 +
                "px; height: " + currentRadius*2 +
                "px; margin-left: " + margin + "px" );
            $(legendCircle).append("<span class='legendValue'>"+classes[i]+"</span>");
            
            $(symbolsContainer).append(legendCircle);
            
            lastRadius = currentRadius;
            
        }
            
        $(legendContainer).append(symbolsContainer);
            
        return legendContainer;
        
        };
        
        legend.addTo(map);
        
    } // end createLegend();
    
    
    // creating a time slider here:
    
    function createSliderUI(timestamps) { //creating the function
        var sliderControl = L.control({position: 'bottomleft'} ); //slider position
        sliderControl.onAdd = function(map) {
            var slider = L.DomUtil.create("input", "range-slider");
            L.DomEvent.addListener(slider, 'mousedown', function(e) {
                L.DomEvent.stopPropagation(e);
            });
            
        // chucking some labels down
        var labels = ["2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017"];
    // adding slider        
        $(slider)
            .attr({
                'type':'range',
                'max': timestamps[timestamps.length-1],
                'min':timestamps[0],
                'step': 1, // Change this to match the numeric interval between adjacent timestamps
                'value': String(timestamps[0])
        })
        .on('input change', function() {
            updatePropSymbols($(this).val().toString());// update the map - look into this and see how it works and why it works
            var i = $.inArray(this.value,timestamps);
            $(".temporal-legend").text(labels[i]); // this automatically updates the labels - utilizing the i variable
        });
        return slider;
    }
    sliderControl.addTo(map);
    createTimeLabel("2000");//starting label
    }
    
    // putting labels on the slider - review this and tweak it
    function createTimeLabel(startTimestamp) {
    var temporalLegend = L.control({position: 'bottomleft' }); // same position as the slider
                       // One more use of L.control !!
    temporalLegend.onAdd = function(map) {
      var output = L.DomUtil.create("output", "temporal-legend");
        
        
      $(output).text(startTimestamp);
      return output;
    }
    temporalLegend.addTo(map);
    }
    
    // working the pseudo code: to this point - adjust max and min zoom - focus on peru. no reason to need all of south america in the screen. with this in perspective, adjust the relative size of the largest circle. in 2017, Piura takes over the map to the point where I think some functionality is lost. take a look at the documentation and ensure I know what is going on with everything involved. Make small tweaks to the code to customize it and make it more usable. 
    // make slider longer
    // add header to the top of the map
    // add sidebar with additional functionality
    // can I add color redundancy?
    // adding collapsible menu
    var coll = document.getElementsByClassName("collapsible");
    var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    } 
  });
}
    //finished with menu
    
    $.getJSON('data/dengueData.js')
            .done(function(data){
                var info = processData(data);
                var propsymbols = createPropSymbols(info.timestamps, data); //putting in command to create prop symbols - use this for switch?
                createSliderUI(info.timestamps); // putting in command to create slider
                createLegend(info.min, info.max); //this creates the proportional legend on my map. 
            })
    .fail(function(){ alert('there has been a problem loading the data')});
});