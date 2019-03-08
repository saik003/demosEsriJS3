define(["componentes/def1"],function(compo1){
    debugger;
    let comp={
        val:3,
        valComp1Mod:compo1.val,
        valComp1Nuevo:new compo1().val,
    }
    return comp;
})