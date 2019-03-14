var app;

require([
    // ArcGIS
    "esri/map",
    "esri/dijit/Search",

    // Calcite Maps
    "calcite-maps/calcitemaps-v0.10",
    "esri/dijit/Directions",
    "dojo/parser",
    "esri/urlUtils",
    "esri/layers/FeatureLayer",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/dijit/Legend",
    "esri/dijit/Print",
    "esri/toolbars/draw",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/Color",
    "esri/graphic", 
    "esri/layers/GraphicsLayer",
    // Bootstrap
    "bootstrap/Collapse", 
    "bootstrap/Dropdown",
    "bootstrap/Tab",

    "dojo/domReady!"
], function(Map, Search,  CalciteMaps,
    Directions,parser,
    urlUtils,FeatureLayer,ArcGISDynamicMapServiceLayer,Legend,Print,Draw,SimpleMarkerSymbol,SimpleLineSymbol,Color,Graphic,GraphicsLayer) {
        
    parser.parse();
    //all requests to route.arcgis.com will proxy to the proxyUrl defined in this object.
    urlUtils.addProxyRule({
        urlPrefix: "route.arcgis.com",
        proxyUrl: "../proxy/proxy.ashx"
    });
    urlUtils.addProxyRule({
        urlPrefix: "traffic.arcgis.com",
        proxyUrl: "../proxy/proxy.ashx"
    });
    // App 
    app = {
        map: null,
        basemap: "dark-gray",
        center: [-40, 40], // lon, lat
        zoom: 3,
        initialExtent: null,
        searchWidgetNav: null,
        searchWidgetPanel: null,
        urlMapaDinamico:"https://sampleserver6.arcgisonline.com/arcgis/rest/services/Wildfire/MapServer",
        urlFeatureLayer:"https://sampleserver6.arcgisonline.com/arcgis/rest/services/Earthquakes_Since1970/MapServer/0",
        urlPrint:"https://sampleserver5.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
        idCapaGrafica:"micapa"
        
    }

    // Map 
    app.map = new Map("mapViewDiv", {
        basemap: app.basemap,
        center: app.center,
        zoom: app.zoom
    });

    app.map.on("load", function(){
        app.initialExtent = app.map.extent;
        app.tb = new Draw(app.map);
        app.tb.on("draw-end", addGraphic);
        app.map.addLayer(new GraphicsLayer({
            id:app.idCapaGrafica
        }));
    });

    _enlazarEventos();

    _creaciondeWidgets();

    
    
    function _creaciondeWidgets(){
        // Search
        app.searchDivNav = _createSearchWidget("searchNavDiv");
        app.searchWidgetPanel = _createSearchWidget("searchPanelDiv");

        //Direcciones
        var directions = new Directions({
            map:  app.map
          },"dir");
          //directions.startup();
        //Leyenda
        var legend = new Legend({
            map: app.map,
            }, "leyenda");
        legend.startup();
        //Impresion
        app.printer = new Print({
            map: app.map,
            url: app.urlPrint
          }, document.getElementById("btnImprimir"));
        app.printer.startup();
    }
   
    function addGraphic(evt) {
        app.tb.deactivate(); 
        app.map.enableMapNavigation();
        let capa= app.map.getLayer(app.idCapaGrafica);
        capa.add(new Graphic(evt.geometry,app.markerSymbol));
    }

    function _createSearchWidget(parentId) {
        var search = new Search({
            map: app.map,
            enableHighlight: false
        }, parentId);
        search.startup();
        return search;
    }

    function _enlazarEventos(){
        try{
            document.getElementById("btnCargarFeatureLayer").onclick =_cargarFeatureLayer;
            document.getElementById("btnCargarMapa").onclick =_cargarMapa;
            document.getElementById("btnDibujarPunto").onclick =_dibujarPunto;
            
            
        }catch(ex){
            console.error("Error al enlazar eventos")
        }
    }
    /**Eventos*/
    //Carga una capa de tipo featureLayer
    function _cargarFeatureLayer(){
        let nombreCapa="featureLayer";
        if(app.map.graphicsLayerIds.indexOf(nombreCapa)>-1){
            app.map.getLayer(nombreCapa).setVisibility(!app.map.getLayer(nombreCapa).visible);
        }else{
            let featureLayer= new FeatureLayer(app.urlFeatureLayer, {
                showAttribution :false,
                id:nombreCapa
            });
            
            app.map.addLayer(featureLayer);
        }
    }
    //Carga una capa de tipo ArcGISDynamicMapServiceLayer
    function _cargarMapa(){
        let nombreCapa="dinamic";
        if(app.map.layerIds.indexOf(nombreCapa)>-1){
            app.map.getLayer(nombreCapa).setVisibility(!app.map.getLayer(nombreCapa).visible);
        }else{
            let  dinamic = new ArcGISDynamicMapServiceLayer(app.urlMapaDinamico, {
                "showAttribution": false,
                id:nombreCapa
              });
            app.map.addLayer(dinamic);
        }
    }
    // Basemaps
    document.getElementById("selectBasemapPanel").onchange=function(e){
        app.map.setBasemap(e.target.options[e.target.selectedIndex].value);
    };
    //Dibujo
    function _dibujarPunto(){
        app.map.disableMapNavigation();
        app.tb.activate("point");
    }

    (function _crearSimbologias(){
        app.markerSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 20,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
            new Color([255,0,0]), 1),
            new Color([255,0,255,0.5]));
    })();


    

});