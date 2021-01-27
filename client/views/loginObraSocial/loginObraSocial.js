Template.loginObrasSociales.onCreated(function () {
  Meteor.subscribe('LoginObraSocial.all');
   Meteor.subscribe('ConexionObraSocial.all');
   Meteor.subscribe('obrasSociales.all');

  // this.filter = new ReactiveTable.Filter('buscadorObras', ['nombreOs']);

});

Template.loginObrasSociales.helpers({
  
	'settings': function(){
        return {
 collection: LoginObraSocial.find(),
 rowsPerPage: 100,
 class: "table table-hover table-condensed", 
 // filters: ['buscadorObras'],
 showFilter: false,
 fields: [
{
        key: 'usuario',
       label:"Usuario",
       headerClass: 'col-md-1',
      },
     {
        key: 'clave',
       label:"Clave",
       headerClass: 'col-md-1',
      },
      
      {
        key: 'idConexionOs',
       label:"Conexion OS",
       fn: function (value, object, key) {
          var d=ConexionObraSocial.findOne({_id:value});
           var os=ObrasSociales.findOne({_id:d.idObraSocial});
         if (os)return os.nombreOs+" ---> "+d.urlLogin;
         return "s/n"
         }
      },
     
       
      {
          label: '',
          headerClass: 'col-md-1',
          tmpl: Template.accionesLoginObrasSociales
        }
      
  
 ]
 };
    }

});
Template.modificarLoginObraSocial.helpers({
  "docu":function(){
    return this
  }
})
Template.nuevoLoginObraSocial.helpers({
  "idUsuario":function(){
    return Meteor.user()._id
  }
})
Template.nuevoLoginObraSocial.rendered=function(){
    Meteor.subscribe('ConexionObraSocial.all');
    Meteor.subscribe('obrasSociales.all');

}
Template.loginObrasSociales.events({

'mouseover tr': function(ev) {
    $("#tabla").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();

  },

  "click #update":function(){
    var act=this;
   Modal.show('modificarLoginObraSocial',function(){ return act; });
  },

  "click #delete":function(){
    var data=this;
    swal({   title: "Estas Seguro de eliminar el registro?",   text: "Una vez aceptado se borrara toda la informacion del socio..",   type: "error",   showCancelButton: true,   confirmButtonColor: "#F27474",   confirmButtonText: "Si, QUITAR!",   closeOnConfirm: true },
               function(){
           LoginObraSocial.remove({_id:data._id});
          });
  }

})
//HOOKS/////////////////////////////
AutoForm.hooks({

  'nuevoLoginObraSocial_': {

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
  'modificarLoginObraSocial_': {

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