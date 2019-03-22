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
    "esri/symbols/SimpleFillSymbol",
    "esri/renderers/UniqueValueRenderer",
    "esri/renderers/ClassBreaksRenderer",
    "esri/Color",
    "esri/graphic", 
    "esri/layers/GraphicsLayer",
    "esri/tasks/query",
    "esri/InfoTemplate",
    // Bootstrap
    "bootstrap/Collapse", 
    "bootstrap/Dropdown",
    "bootstrap/Tab",

    "dojo/domReady!"
], function(Map, Search,  CalciteMaps,
    Directions,parser,
    urlUtils,FeatureLayer,ArcGISDynamicMapServiceLayer,Legend,Print,
    Draw,SimpleMarkerSymbol,SimpleLineSymbol,SimpleFillSymbol,UniqueValueRenderer,
    ClassBreaksRenderer,Color,Graphic,GraphicsLayer,Query,InfoTemplate) {
        
    parser.parse();
    //all requests to route.arcgis.com will proxy to the proxyUrl defined in this object.
    urlUtils.addProxyRule({
        urlPrefix: "route.arcgis.com",
        proxyUrl: "../../proxy/proxy.ashx"
    });
    urlUtils.addProxyRule({
        urlPrefix: "traffic.arcgis.com",
        proxyUrl: "../../proxy/proxy.ashx"
    });
    // App 
    app = {
        map: null,
        basemap: "streets",
        center: [-40, 40], // lon, lat
        zoom: 3,
        initialExtent: null,
        searchWidgetNav: null,
        searchWidgetPanel: null,
        urlMapaDinamico:"https://sampleserver6.arcgisonline.com/arcgis/rest/services/Wildfire/MapServer",
        urlFeatureLayer:"https://sampleserver6.arcgisonline.com/arcgis/rest/services/Earthquakes_Since1970/MapServer/0",
        urlPrint:"https://sampleserver5.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
        idCapaGrafica:"micapa",
        idNombreFeature:"featureL",
        idCapaDinamica:"dinamic"
        
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
        let capaGrafica= new GraphicsLayer({
            id:app.idCapaGrafica
        })
        app.map.addLayer(capaGrafica);

        // let renderer = new UniqueValueRenderer(app.markerSymbol, "TEMATICO");
        // renderer.addValue("1", app.markerSymbolSeleccionado);

        var renderer = new ClassBreaksRenderer(app.markerSymbol, "magnitude");
        renderer.addBreak(6, 7, app.markerSymbolSeleccionado);
        capaGrafica.setRenderer(renderer);

        app.dinamic = new ArcGISDynamicMapServiceLayer(app.urlMapaDinamico, {
            "showAttribution": false,
            id:app.idCapaDinamica,
            visible:false
          });
        app.map.addLayer(app.dinamic);
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
          directions.startup();
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
        //Limpiamos la capa grafica
        capa.clear();
        //capa.add(new Graphic(evt.geometry,app.markerSymbol));
        capa.add(new Graphic(evt.geometry,app.fillSymbol));
        
        ejecutarConsulta(evt.geometry);
    }
    function ejecutarConsulta(geo){

        

        //Creamos el objeto Query
        let query = new Query();
        //Establecemos la propiedad geometry de la Query con la pasada por parametro
        query.geometry= geo;
        //Establecemos los campos de retorno
        query.outFields= ["*"];
        //Aplicamos el where
        //query.where = "magnitude >6 AND magnitude < 7"; 
        //Ejecutamos la funcion queryFeatures y obtenemos los resultados
        let f= app.map.getLayer(app.idNombreFeature);
        f.queryFeatures(query,function(resultado){
            pintarElementos(resultado.features);  
            console.log("El número de elementos seleccionados es: " + resultado.features.length)
        });

    }

    function pintarElementos(elementos){
        let capa= app.map.getLayer(app.idCapaGrafica);

        var infoTemplate = new InfoTemplate("Terremotos","Magnitud: ${magnitude} <br> Nombre: ${name}");
        for(var i=0;i<elementos.length;i++){
            if(elementos[i].attributes.magnitude>6 && elementos[i].attributes.magnitude<7){
                elementos[i].attributes.TEMATICO="1"
            }else{
                elementos[i].attributes.TEMATICO="0"
            }
           // elementos[i].attributes.magnitude=elementos[i].attributes.magnitude*10
            let g= new Graphic(elementos[i].geometry, 
                null,
                elementos[i].attributes,
                infoTemplate);
            capa.add(g);
        }
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
            document.getElementById("btnConsultaCapa").onclick =_consultaFeature;
            document.getElementById("btnDibujarPoligono").onclick =_dibujarPoligono;
        }catch(ex){
            console.error("Error al enlazar eventos")
        }
    }
    /**Eventos*/
   
    //Aplica Query a feature
    function _consultaFeature(){
        let f= app.map.getLayer(app.idNombreFeature);
        var query = new Query();
        query.where = "MAGNITUDE >6 AND MAGNITUDE < 7"; 
        f.selectFeatures(query,FeatureLayer.SELECTION_NEW);
        f.refresh();
    }
    //Carga una capa de tipo featureLayer
    function _cargarFeatureLayer(){
        if(app.map.graphicsLayerIds.indexOf(app.idNombreFeature)>-1){
            app.map.getLayer(app.idNombreFeature).setVisibility(!app.map.getLayer(app.idNombreFeature).visible);
        }else{
            let featureLayer= new FeatureLayer(app.urlFeatureLayer, {
                showAttribution :false,
                id:app.idNombreFeature,
                // mode:FeatureLayer.MODE_SELECTION
            });
            
            app.map.addLayer(featureLayer);
        }
    }
    //Carga una capa de tipo ArcGISDynamicMapServiceLayer
    function _cargarMapa(){
        app.dinamic.setVisibility(!app.dinamic.visible);
        // let nombreCapa="dinamic";
        // if(app.map.layerIds.indexOf(nombreCapa)>-1){

        //     if(app.map.getLayer(nombreCapa).visible==true){
        //         app.map.getLayer(nombreCapa).setVisibility(false);
        //     }else{
        //         app.map.getLayer(nombreCapa).setVisibility(true);
        //     }
        //   //  app.map.getLayer(nombreCapa).setVisibility(!app.map.getLayer(nombreCapa).visible);
        // }else{
        //     let  dinamic = new ArcGISDynamicMapServiceLayer(app.urlMapaDinamico, {
        //         "showAttribution": false,
        //         id:nombreCapa
        //       });
        //     app.map.addLayer(dinamic);
        // }
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
    function _dibujarPoligono(){
        app.map.disableMapNavigation();
        app.tb.activate("polygon");
    }

    (function _crearSimbologias(){
        app.markerSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_DIAMOND, 20,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
            new Color([255,255,0]), 1),
            new Color([255,255,0,1]));

        app.markerSymbolSeleccionado = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_DIAMOND, 20,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
            new Color([255,0,0]), 1),
            new Color([255,0,0,1]));

        app.fillSymbol= new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
            new Color([255,0,0]), 2),new Color([255,255,0,0.25])
            );
    })();

    _cargarFeatureLayer();
    

});