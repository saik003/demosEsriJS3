var app;

require([
    // ArcGIS
    "esri/map",
    "esri/dijit/Search",
    "esri/dijit/Scalebar",
    "esri/graphic",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/layers/GraphicsLayer",
    "esri/toolbars/draw",
    "esri/Color",
    // Calcite Maps
    "calcite-maps/calcitemaps-v0.10",
    
    // Bootstrap
    "bootstrap/Collapse", 
    "bootstrap/Dropdown",
    "bootstrap/Tab",

    "dojo/domReady!"
], function(Map, Search, Scalebar,Graphic,SimpleMarkerSymbol,SimpleLineSymbol,GraphicsLayer,Draw, Color,CalciteMaps) {
        
    // App 
    app = {
        map: null,
        basemap: "streets",
        center: [-40, 40], // lon, lat
        zoom: 5,
        initialExtent: null,
        searchWidgetNav: null,
        searchWidgetPanel: null
    }
    esri.bundle.toolbars.draw.addPoint = "Hola!!!! Agregue un punto ";
    // Map 
    app.map = new Map("mapViewDiv", {
        basemap: app.basemap,
        center: app.center,
        zoom: app.zoom
    });

    app.map.on("load", function(){
        app.initialExtent = app.map.extent;

        app.map.on("extent-change",function(args){
            console.log(JSON.stringify(args.extent));
        });
        app.capaGrafica= new GraphicsLayer({
            id:"miCapaGrafica"
        });
        app.map.addLayer(app.capaGrafica);

        document.getElementById("limpiarCapa").onclick=function(){
            app.capaGrafica.clear();
            //app.capaGrafica.remove(app.capaGrafica.graphics[app.capaGrafica.graphics.length-1]);
        }
        document.getElementById("punto").onclick=function(){
            dibujar("point");
        }
        document.getElementById("linea").onclick=function(){
            dibujar("polyline");
        }
        document.getElementById("poligono").onclick=function(){
            dibujar("polygon");
        }
        //Creamos la tool de dibujo
        app.toolDibujo= new Draw(app.map);

        //Capturamos su evento draw-complete
        app.toolDibujo.on("draw-complete",function(args){
            var simbologia;
            switch(args.target._geometryType){
                case "point":
                    simbologia=args.target.markerSymbol;
                break;
                case "polyline":
                case "line":
                    simbologia=args.target.lineSymbol;
                break;
                case "polygon":
                    simbologia= args.target.fillSymbol;
                break;
            }
            var g= new Graphic(args.geometry,simbologia);
            app.capaGrafica.add(g);
        })
    });
    function dibujar(tipoGeo){
        app.toolDibujo.activate(tipoGeo);
    }

    var scalebar = new Scalebar({
        map: app.map,
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
    app.map.on("click", function(evt) {
        // console.log(evt.mapPoint);
        // var s= new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 30,
        //     new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
        //     new Color([255,255,0]), 1),
        //     new Color([0,255,0,1]));

        // var g= new Graphic(evt.mapPoint,s);
        // //app.map.graphics.add(g);
        // app.capaGrafica.add(g);
    });
});