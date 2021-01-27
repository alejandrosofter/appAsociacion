var addHooks = {

  onSuccess: function(formType, result) {
    swal("Bien!","Se ha agregado el registro!","success");
    Modal.hide()
  },
  onError: function(formType, error) {
    console.log(error)
    swal("Ops!","Hay errores en el formulario, por favor verifique y vuelva a intentar","error");
  },

};
var updateHooks = {
  onSuccess: function(formType, result) {
    swal("Bien!","Se ha modificado el registro!","success");
    Modal.hide()
  },
  onError: function(formType, error) {
    console.log(error)
    swal("Ops!","Hay errores en el formulario, por favor verifique y vuelva a intentar","error");
  },
 
};
var agrego=false;
var addHooksLiquidacion = {

  onSuccess: function(formType, result) {
    swal("Bien!","Se ha agregado el registro de liquidacion!","success");
    if(!agrego){ Meteor.call("settings.autoincrementaNroLiquidacion"); agrego=true;buscarLiquidaciones()}
    setTimeout(function(){ agrego=false  }, 1000);
    Modal.hide()
  },
  onError: function(formType, error) {
    console.log(error)
    swal("Ops!","Hay errores en el formulario, por favor verifique y vuelva a intentar","error");
  },

};
var updateHooks = {
  onSuccess: function(formType, result) {
    swal("Bien!","Se ha modificado el registro!","success");
    Modal.hide()
  },
  onError: function(formType, error) {
    console.log(error)
    swal("Ops!","Hay errores en el formulario, por favor verifique y vuelva a intentar","error");
  },
 
};
var updateHooksLiquidacion = {
  onSuccess: function(formType, result) {
    swal("Bien!","Se ha modificado el registro!","success");
    setTimeout(function(){ buscarLiquidaciones(); }, 300);
    Modal.hide();

  },
  onError: function(formType, error) {
    console.log(error)
    swal("Ops!","Hay errores en el formulario, por favor verifique y vuelva a intentar","error");
  },
 
};
var addHooksNueva = {

  onSuccess: function(formType, result) {
    Session.set("dataUltimaCarga",this.insertDoc);
    setLiquidacion();
    Modal.hide()
    setTimeout(function(){ 
      
    Modal.show("nuevaLiquidacion_factura",function(){
      return Session.get("liquidacion");
    });
     }, 1000);
    
    //swal("Bien!","Se ha agregado el registro!","success");
    
  },
  onError: function(formType, error) {
    console.log(error)
    swal("Ops!","Hay errores en el formulario, por favor verifique y vuelva a intentar","error");
  },

};
var updateHooksFact = {
  before:{
    update:function(doc){
      console.log(doc)
      if(doc.$unset)delete doc.$unset; // (borro el registro unset)SIN ESTO, BORRA TODAS LAS OTRAS Y LAS DEJA EN NULL.. NO ENCONTRE OTRA SOLUCION.. 
      return doc
    }
},
  onSuccess: function(formType, result) {
    swal("Bien!","Se ha modificado el registro!","success");
    setLiquidacion();
    Modal.hide()
  },
  onError: function(formType, error) {
    console.log(error)
    swal("Ops!","Hay errores en el formulario, por favor verifique y vuelva a intentar","error");
  },
 
};

AutoForm.addHooks(['nuevaLiquidacionFactura_',"nuevaLiquidacionFactura_"], addHooksNueva);
AutoForm.addHooks(['modificarLiquidacionFactura_','modificarLiquidacionFactura_'], updateHooksFact);

AutoForm.addHooks(['nuevaLiquidacion_',"nuevaLiquidacion_"], addHooksLiquidacion);
AutoForm.addHooks(['modificarLiquidacion_','modificaSettings_'], updateHooksLiquidacion);

AutoForm.addHooks(['nuevoMedicamento_',"nuevoMedicamento_"], addHooks);
AutoForm.addHooks(['nuevaReceta_',"nuevaReceta_"], addHooks);

AutoForm.addHooks(['modificarMedicamento_',"modificarMedicamento_"], updateHooks);
AutoForm.addHooks(['modificarReceta_',"modificarReceta_"], updateHooks);

function buscarLiquidaciones()
{
  var desde=$("#fechaDesde").val().getFechaFormato();
  var hasta=$("#fechaHasta").val().getFechaFormato();
  var usuario=$("#usuario").val().getUsuario(true);
  SUIBlock.block('Buscando liquidaciones, aguarde un momento...');
  Meteor.call("liquidaciones.buscar",desde,hasta,usuario,function(err,res){
    Session.set("liquidaciones",res);
    SUIBlock.unblock(); 
    
  });
}