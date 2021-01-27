Template.ConexionObraSocial.onCreated(function () {
   Meteor.subscribe('ConexionObraSocial.all');
    Meteor.subscribe('obrasSociales.all');
  // this.filter = new ReactiveTable.Filter('buscadorObras', ['nombreOs']);

});

Template.ConexionObraSocial.helpers({
  
	'settings': function(){
        return {
 collection: ConexionObraSocial.find(),
 rowsPerPage: 100,
 class: "table table-hover table-condensed", 
 // filters: ['buscadorObras'],
 showFilter: false,
 fields: [
{
        key: 'urlLogin',
       label:"Url Login",
       // headerClass: 'col-md-3',
      },
     {
        key: 'selectorResultado',
       label:"Selector Resultado",
       headerClass: 'col-md-2',
      },
       {
        key: 'resultadoPositivo',
       label:"Resultado Positivo",
       headerClass: 'col-md-2',
      },
      
      {
        key: 'idObraSocial',
       label:"OS",
       headerClass: 'col-md-3',
       fn: function (value, object, key) {
          var d=ObrasSociales.findOne({_id:value});
         if (d)return d.nombreOs;
         return "s/n"
         }
      },
     
       
      {
          label: '',
          headerClass: 'col-md-1',
          tmpl: Template.accionesConexionObraSocial
        }
      
  
 ]
 };
    }

});
Template.modificarConexionObraSocial.helpers({
  "docu":function(){
    return this
  }
})
Template.nuevoConexionObraSocial.rendered=function(){
   Meteor.subscribe('ConexionObraSocial.all');
    Meteor.subscribe('obrasSociales.all');
}
Template.ConexionObraSocial.events({

'mouseover tr': function(ev) {
    $("#tabla").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();

  },

  "click #update":function(){
    var act=this;
   Modal.show('modificarConexionObraSocial',function(){ return act; });
  },
  "click #btnAgregar":function(){
    var act=this;
   Modal.show('nuevoConexionObraSocial',function(){ return act; });
  },

  "click #delete":function(){
    var data=this;
    swal({   title: "Estas Seguro de eliminar el registro?",   text: "Una vez aceptado se borrara toda la informacion del socio..",   type: "error",   showCancelButton: true,   confirmButtonColor: "#F27474",   confirmButtonText: "Si, QUITAR!",   closeOnConfirm: true },
               function(){
           ConexionObraSocial.remove({_id:data._id});
          });
  }

})
//HOOKS/////////////////////////////
AutoForm.hooks({

  'nuevoConexionObraSocial_': {

    onSuccess: function(operation, result, template) {
      
        Modal.hide();
        swal("GENIAL!", "Se ha ingresado el registro!...", "success");
    },
    onError: function(operation, error, template) {
UIBlock.unblock();
      console.log(operation);console.log(error);console.log(template);
      swal("Ops!", "ha ocurrido un error, por favor chequee los datos ingresados: " + error, "error");


    }
  },
  'modificarConexionObraSocial_': {

    onSuccess: function(operation, result, template) {
      UIBlock.unblock();
      swal("GENIAL!", "Se ha modificado el registro!", "success");
      Modal.hide();

    },
    onError: function(operation, error, template) {
      swal("Ops!", "ha ocurrido un error, por favor chequee los datos ingresados: " + error, "error");


    }
  }
})