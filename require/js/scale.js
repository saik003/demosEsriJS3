define(["esri/dijit/Scalebar","componentes/map"],function(Scalebar,map){
    debugger;
    var scale = new Scalebar({
        map: map,
        // "dual" displays both miles and kilometers
        // "english" is the default, which displays miles
        // use "metric" for kilometers
        scalebarUnit: "dual"
      });
      return scale;
});