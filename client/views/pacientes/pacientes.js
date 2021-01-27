Template.pacientes.onCreated(function () {
  Meteor.subscribe('pacientes.all');
   Meteor.subscribe('obrasSociales.all');
   Meteor.subscribe('LoginObraSocial.all');
   Meteor.subscribe('ConexionObraSocial.all');
  // this.filter = new ReactiveTable.Filter('buscadorObras', ['nombreOs']);

});
Template.accionesPacientes.helpers({
  "rangos":function(){
    return Nomencladores.find({idObraSocial:this.id}).fetch();
        
  }
})
Template.checkWebPaciente.rendered=function()
{
  
}
function getConexion(idOs)
{
  var logins=LoginObraSocial.find().fetch();
  
  for(var i=0;i<logins.length;i++){
    var conexion=ConexionObraSocial.findOne({_id:logins[i].idConexionOs});
    if(conexion)
      if(conexion.idObraSocial==idOs)return conexion;
  }
}
function getLogin(idOs)
{
  var logins=LoginObraSocial.find().fetch();
  
  for(var i=0;i<logins.length;i++){
    var conexion=ConexionObraSocial.findOne({_id:logins[i].idConexionOs});
    if(conexion)
      if(conexion.idObraSocial==idOs)return logins[i];
  }
}
Template.rtaOs.helpers({
"rtaOs":function(){
  if(this.rtaOs)return new Spacebars.SafeString("<b>"+this.rtaOs+"</b>");
  return  new Spacebars.SafeString("<b>S/rta</b>")
},
"fechaUpdateEstado":function()
{
  if(this.fechaUpdateEstado)return this.fechaUpdateEstado.getFecha();
  return " | s/fecha"
},
"puedeConsultar":function()
{
  var conexion=getConexion(this.idObraSocial);
  if(conexion)return true;
  return false;
},


  })
Template.pacientes.helpers({
  
	'settings': function(){
        return {
 collection: Pacientes.find(),
 rowsPerPage: 100,
 class: "table table-hover table-condensed", 
 // filters: ['buscadorObras'],
 showFilter: true,
 fields: [
{
        key: 'nroAfiliado',
       label:"Nro Afi.",
       headerClass: 'col-md-1',
      },
     {
        key: 'nombrePaciente',
       label:"Paciente",
      },
      
      {
        key: 'idObraSocial',
       label:"Obra Social",
       fn: function (value, object, key) {
          var d=ObrasSociales.findOne({_id:value});
         if (d)return d.nombreOs;
         return "s/n"
         }
      },
      {
        key: 'dni',
       label:"DNI",
       headerClass: 'col-md-1',
      },
      {
        key: 'telefono',
       label:"Tel.",
      },
      {
        key: 'email',
       label:"Email",
      },
      {
        key: 'estado',
       label:"Estado",
       headerClass: 'col-md-1',
      },


    
      {
          label: 'Rta O.S',
          headerClass: 'col-md-2',
          tmpl: Template.rtaOs
        }
       ,
      {
          label: '',
         // headerClass: 'col-md-1',
          tmpl: Template.accionesPacientes
        }
      
  
 ]
 };
    }

});
Template.modificarPaciente.helpers({
  "docu":function(){
    return this
    console.log(this)
  }
})
Template.nuevoPaciente.rendered=function(){
   Meteor.subscribe('obrasSociales.all');
}

Template.pacientes.events({
  "keyup #idObraSocial": function (event, template, doc) {

      var input = $(event.target).val();
      console.log(input)
     if(input=="")template.filter.set("");
      else template.filter.set(input);
      
   },
'mouseover tr': function(ev) {
    $("#tabla").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();

  },

  "click #update":function(){
    var act=this;
   Modal.show('modificarPaciente',function(){ return act; });
  },
  "click #checkWeb":function(){
    var act=this;
    
    var conexion=getConexion(this.idObraSocial);
    var login=getLogin(this.idObraSocial);
    var nroDni=this.dni;

    
  
    SUIBlock.block('Aguarde un momento, chequeando '+nroDni+' en la OBRA SOCIAL...');
  Meteor.call("checkWebPaciente",conexion,login,act,function(err,res){
       SUIBlock.unblock();
       console.log(res)
        swal(res, "Es la rta de la obra social!...", "success");
      
      })
  },
  "click #delete":function(){
    var paciente=this;
    swal({   title: "Estas Seguro de eliminar a "+paciente.nombrePaciente+"?",   text: "Una vez aceptado se borrara toda la informacion del socio..",   type: "error",   showCancelButton: true,   confirmButtonColor: "#F27474",   confirmButtonText: "Si, QUITAR!",   closeOnConfirm: true },
               function(){
           Pacientes.remove({_id:paciente._id});
          });
  }

})
//HOOKS/////////////////////////////
AutoForm.hooks({

  'nuevoPaciente_': {

    onSuccess: function(operation, result, template) {
      
      Meteor.call("ultimoIdSocioCargado",function(err,res){
        Modal.hide();
        swal("GENIAL!", "Se ha ingresado el registro!...", "success");
      
      })
      

    },
    onError: function(operation, error, template) {
UIBlock.unblock();
      console.log(operation);console.log(error);console.log(template);
      swal("Ops!", "ha ocurrido un error, por favor chequee los datos ingresados: " + error, "error");


    }
  },
  'modificarPaciente_': {

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