var app;

require([
    // ArcGIS
    "esri/map",
    "esri/dijit/Search",

    // Calcite Maps
    "calcite-maps/calcitemaps-v0.10",
    
    // Bootstrap
    "bootstrap/Collapse", 
    "bootstrap/Dropdown",
    "bootstrap/Tab",

    "dojo/domReady!"
], function(Map, Search,  CalciteMaps) {
        
    // App 
    app = {
    map: null,
    basemap: "dark-gray",
    center: [-40, 40], // lon, lat
    zoom: 3,
    initialExtent: null,
    searchWidgetNav: null,
    searchWidgetPanel: null
    }

    // Map 
    app.map = new Map("mapViewDiv", {
    basemap: app.basemap,
    center: app.center,
    zoom: app.zoom
    });

    app.map.on("load", function(){
        app.initialExtent = app.map.extent;
    });

    // Search
    app.searchDivNav = createSearchWidget("searchNavDiv");
    app.searchWidgetPanel = createSearchWidget("searchPanelDiv");

    function createSearchWidget(parentId) {
        var search = new Search({
            map: app.map,
            enableHighlight: false
        }, parentId);
        search.startup();
        return search;
    }
    // Basemaps
    document.getElementById("selectBasemapPanel").onchange=function(e){
        app.map.setBasemap(e.target.options[e.target.selectedIndex].value);
    };
    
});