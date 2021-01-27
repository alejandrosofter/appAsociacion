Template.recetas.onCreated(function () {
  Meteor.subscribe('recetas.all');
  Meteor.subscribe('medicamentos.all');
  Meteor.subscribe('pacientes.all');

});
Template.nuevaReceta.onCreated(function () {
  Meteor.subscribe('recetas.all');
  Meteor.subscribe('medicamentos.all');

});
function select2_search ($el, term) {
  $el.select2('open');
  
  // Get the search box within the dropdown or the selection
  // Dropdown = single, Selection = multiple
  var $search = $el.data('select2').dropdown.$search || $el.data('select2').selection.$search;
  // This is undocumented and may change in the future
  
  $search.val(term);

  $search.trigger('input');
   setTimeout(function() { $('.select2-results__option').trigger("mouseup"); }, 500);
}
function setPresentacion()
{
   var nro=this.name.split(".")[1];
          var lab="medicamentos."+nro+".idMedicamento";
          var labPres="medicamentos."+nro+".idPresentacion";
          $("select[name='"+labPres+"']").empty().trigger("change");
           $("select[name='"+labPres+"']").val(null).trigger('change');
          var selector=document.getElementsByName(lab);
       
            var idMedicamento=$("select[name='"+lab+"']").val();
            var medicamento=Medicamentos.findOne({_id:idMedicamento});
            var items=_.map(medicamento.presentaciones, function (c, i) { return {text: c.cantidad, value: c._id};});
            
            // $("select[name='"+labPres+"']").empty();
            $("select[name='"+labPres+"']").select2({data:items,placeholder:"Seleccione...",allowClear:true,width:"resolve"});
            // $("select[name='"+labPres+"']").trigger('change');
         
}
Template.modificarReceta.rendered=function(){
  var paciente=Pacientes.findOne({_id:this.data.idPaciente});
  var $select = $("#idPaciente");
  select2_search($select, paciente.nombrePaciente);
  $select.val(this.data.idPaciente);
  $select.trigger('change');


}
function getMedicamento(idMedicamento,generico)
{
  var medicamento=Medicamentos.findOne({_id:idMedicamento});
  
  if(medicamento)
    return generico?medicamento.nombreGenerico:medicamento.nombreComercial;

  return "s/n"

}
function getPresentacion(idMedicamento,idPresentacion)
{
  var medicamento=Medicamentos.findOne({_id:idMedicamento});
  
  if(medicamento)
    for(var i=0;i<medicamento.presentaciones.length;i++)
      if(medicamento.presentaciones[i]._id==idPresentacion)return medicamento.presentaciones[i].cantidad;
    

  return "s/n"

}
function setImagenFirma()
{
  Meteor.call("getImagenUsuario",function(err,res){
        Session.set("imgFirma",res);
      })
}
Template.imprimirReceta.rendered=function()
{
  setImagenFirma();
}
Template.cadaMedicamento.helpers({
"cantidad":function(){
  return this.cantidad;
},
"medicamento":function(){
  return getMedicamento(this.idMedicamento)
},
"generico":function(){
  return getMedicamento(this.idMedicamento,true)
},
"presentacion":function(){
  return  getPresentacion(this.idMedicamento,this.idPresentacion)
}
})
Template.imprimirReceta.helpers({
"paciente_nombres":function(){
 
  var paciente=Pacientes.findOne({_id:this.idPaciente});
  if(paciente)return paciente.nombrePaciente;
  return "s/n"
},
"imagenFirma":function()
{
  return Session.get("imgFirma")
},
"profesional":function()
{
  return Meteor.user().profile.profesional
},
"contactos":function()
{
  return Meteor.user().profile.contactos
},
"fecha":function(){
  return this.fecha.getFecha()
},
"nm":function(){
  return Meteor.user().profile.nm
},
"mp":function(){
  return Meteor.user().profile.mp
},
"medicamentos":function(){
  return this.medicamentos
},
"fechaGral":function(){
  return moment().lang("es").format("DD/MM/Y"); 
},
"paciente_dni":function(){

  var paciente=Pacientes.findOne({_id:this.idPaciente});
  if(paciente)return paciente.dni;
  return "s/n"
},
"paciente_nroAfiliado":function(){

  var paciente=Pacientes.findOne({_id:this.idPaciente});
  if(paciente)return paciente.nroAfiliado;
  return "s/n"
},
"paciente_obraSocial":function(){
var paciente=Pacientes.findOne({_id:this.idPaciente});
  var os=ObrasSociales.findOne({_id:paciente.idObraSocial});
  if(os)return os.nombreOs;
  return "s/n"
},
})
Template.recetas.helpers({
  
	'settings': function(){
        return {
 collection: Recetas.find(),
 rowsPerPage: 100,
 class: "table table-hover table-condensed", 
 // filters: ['buscadorObras'],
 showFilter: true,
 fields: [

     {
        key: 'fecha',
       label:"Fecha",
       fn: function (value, object, key) {
        return value.getFecha()
       }
      },
      {
        key: 'idPaciente',
       label:"Paciente",
       fn: function (value, object, key) {
        var paciente=Pacientes.findOne({_id:value});
        if(paciente)return paciente.nombrePaciente;
        return "s/n"
       }
      },
      {
        key: 'medicamentos',
       label:"Medicamentos",
       fn: function (value, object, key) {
        var sal="";
        for(var i=0;i<value.length;i++){
          var medicamento=getMedicamento(value[i].idMedicamento);
          var presentacion=getPresentacion(value[i].idMedicamento,value[i].idPresentacion);
          sal+=" | "+ medicamento+" ("+presentacion+")"+value[i].cantidad+" unidades | ";
        }
        return sal;
       }
      },


    

       
      {
          label: '',
         // headerClass: 'col-md-1',
          tmpl: Template.accionesRecetas
        }
      
  
 ]
 };
    }

});

Template.recetas.events({

'mouseover tr': function(ev) {
    $("#tabla").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();

  },

  "click #imprimir":function(){
    var data=this;
   Modal.show("imprimirReceta",function(){
    return data
   })
  },

  "click #modificar":function(){
    var data=this;
   Modal.show("modificarReceta",function(){
    return data
   })
  },
  'click #delete': function(ev) {
    var id = this._id;
    swal({
      title: "Estas Seguro de quitar?",
      text: "Una vez que lo has quitado sera permanente!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Si, borralo!",
      closeOnConfirm: true
    }, function() {
     
      Recetas.remove({_id:id})
     swal("Bien!","Se ha eliminado el registro ","success");
      
      
    });

  },

})