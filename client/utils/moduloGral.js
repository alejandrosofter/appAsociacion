var getColumnaAcciones=function(ancho)
{

return ({
        label: '',
        headerClass: 'col-md-'+ancho,
        tmpl:Template.accionesModuloGral
      })
}
AutoForm.hooks({

  'nuevoGral_': {

  
    onSuccess: function(operation, result, template) {
      UIBlock.unblock();
      swal("GENIAL!", "Se ha creado el registro!", "success");
      Modal.hide();

    },
    onError: function(operation, error, template) {
UIBlock.unblock();
      swal("Ops!", "ha ocurrido un error, por favor chequee los datos ingresados: " + error, "error");


    }
  },
  'modificarGral_': {

  
    onSuccess: function(operation, result, template) {
      UIBlock.unblock();
      swal("GENIAL!", "Se ha modificado el registro!", "success");
      Modal.hide();

    },
    onError: function(operation, error, template) {
UIBlock.unblock();
      swal("Ops!", "ha ocurrido un error, por favor chequee los datos ingresados: " + error, "error");


    }
  }
});
Template.accionesModuloGral.helpers({
"tmplAcciones":function()
{
  return Session.get("dataModuloGral").tmplAcciones;
}
})
Template.moduloGral.helpers({

"nombreTabla":function()
{
  return "tabla_"+this.nombreModulo
},
    'settings': function(){
      var cols=this.columnas;
      var ancho=!this.anchoAcciones?"1":(this.anchoAcciones)+"";
      cols.push(getColumnaAcciones(ancho));
      var coleccion=eval(this.nombreColeccion);
        return {
 collection: coleccion,
 rowsPerPage: 10,
 class: "table table-condensed",
 showFilter: true,
 fields: cols
 };
    }
    ,
      "nombreModuloMayu":function(){
        console.log(this)
        return this.nombreModulo.toUpperCase();
  },
});
Template.moduloGral.rendered=function(){
 Session.set("dataModuloGral",(this.data))
}

Template.moduloGral.events({
  'click #btnAgregar': function(){
    var data=this;
    data.dataGral=Session.get("dataModuloGral");
         Modal.show('nuevoModuloGral',function(){ return data; });
    },
  
  'mouseover tr': function(ev) {
    var tabla="#tabla_"+Session.get("dataModuloGral").nombreModulo;
    console.log(tabla)
    $(tabla).find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();
    
  },
  'mousemove tr': function(ev) {
    
  },
  'click .delete': function(ev) {
    var id=this._id;
    var Coleccion=eval(Session.get("dataModuloGral").nombreModulo);
    swal({   title: "Estas Seguro de quitar el registro?",   text: "Una vez que lo has quitado sera permanente!",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Si, borralo!",   closeOnConfirm: false }, function(){ 

      Coleccion.remove(id); swal("Quitado!", "El registro ha sido borrado", "success"); });

  },
  
  'click .update': function(ev) {
   var data=this;
   data.dataGral=Session.get("dataModuloGral");
     Session.set("idSeleccionGral",this._id);
    Modal.show('modificarModuloGral',function(){ return data; });
  },
});
Template.modificarModuloGral.rendered=function(){
  console.log(this)
}

Template.modificarModuloGral.helpers({
"idFormulario":function()
{
  return "formulario_"+this.dataGral.nombreModulo;

},
"nombreModulo":function()
{
  return this.dataGral.nombreModulo;

},
"Coleccion":function()
{
  return eval(this.dataGral.nombreModulo);

},
"tmplUpdate":function()
{
  return (this.dataGral.tmplUpdate);

},
"tmplNuevo":function()
{
  return (this.dataGral.tmplNuevo);

},
"tmplAcciones":function()
{
  return (this.dataGral.tmplAcciones);

}
})
Template.nuevoModuloGral.helpers({
"idFormulario":function()
{
  return "nuevo"+this.dataGral.nombreModulo+"_";

},
"nombreModulo":function()
{
  return this.dataGral.nombreModulo;

},
"Coleccion":function()
{
  return eval(this.dataGral.nombreModulo);

},
"tmplUpdate":function()
{
  return (this.dataGral.tmplUpdate);

},
"tmplNuevo":function()
{
  return (this.dataGral.tmplNuevo);

},
"tmplAcciones":function()
{
  return (this.dataGral.tmplAcciones);

}
})
