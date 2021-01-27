import { Meteor } from 'meteor/meteor';

var consultarUsuarios=function()
{
   Meteor.call("users.list",function(err,res){
        Session.set("usuarios",res);
      })
}
var resetearClave=function(id,clave)
{
  console.log("cambia clave"+id)
   Meteor.call("users.resetPassword",id,clave,function(err,res){
    swal("Bien!","se ha reseteado la clave!","success");
    if(!Meteor.user())Router.go('/login');
      })
}
Template.usuarios.onCreated(function () {
  Meteor.subscribe('usuarios.all');
});

Template.usuarios.helpers({
	'settings': function(){
     consultarUsuarios();
        return {
 collection: Session.get("usuarios"),
 rowsPerPage: 100,
 class: "table table-hover table-condensed",
 showFilter: false,
 fields: [
 {
        key: '_id',
       label:"ID",
      },
	   {
        key: 'username',
			 label:"Usuario",
      },
      {
        key: 'profile.nombres',
        label: 'Nombres',
      },
       {
        key: 'profile.profesional',
        label: 'Profesional Asignado',
      },
	 {
        key: 'profile.rol',
        label: 'Perfil de...',
      },
      {
          label: '',
          //headerClass: 'col-md-1',
          tmpl: Template.accionesUsuarios
        }
      
  
 ]
 };
    }

});

Template.usuarios.events({
  "click #btnPrint":function(){
    window.print()
  },

  'mouseover tr': function(ev) {
    $("#tabla").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();

  },
  "click #btnAgregar":function(){
    Modal.show('nuevoUsuario',function(){ return null; });
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
     Meteor.call("users.remove",id,function(err,res){
      if(!err)swal("Bien!","Se ha eliminado el usuario ","success")
      else swal("Ops..","hay un problema con la carga del nuevo usuario: "+err.message,"error")
    });
      
      
    });

  },
   'click #modificar': function(ev) {
    var data=this;
    Modal.show("modificarUsuario",function(){
      return data
    })

  },
});
Template.modificarUsuario.helpers({
"data":function(){
  return this;
},
"imagenFirma":function(){
  return  Session.get("imgFirma");

}
});
function setImagenFirma(id)
{
  Meteor.call("getImagen",id,function(err,res){
        Session.set("imgFirma",res);
      })
}
Template.modificarUsuario.rendered=function(){
  $("#tipoUsuario").val(this.data.profile.rol);
  Meteor.subscribe('archivos.all');
  setImagenFirma(this.data.profile.idImagenFirma);
}
Template.modificarUsuario.events({
  'change .imagenFirma': function(event, template) {
    var files = event.target.files;
    for (var i = 0, ln = files.length; i < ln; i++) {
      Archivos.insert(files[i], function (err, fileObj) {
    setImagenFirma(fileObj._id);
        $("#idImagenFirma").val(fileObj._id);
      });
    }
  },
"click #btnAgregar":function(){
  var perfil={
    
    idProfesional:$("#idProfesional").val(),
    profesional:$("#profesional").val(),
    nombres:$("#nombres").val(),
    email:$("#email").val(),
    telefono:$("#telefono").val(),
    contactos:$("#contactos").val(),
    mp:$("#mp").val(),
    nm:$("#nm").val(),
    
    rol:$( "#tipoUsuario option:selected" ).val()
  };
  var idFirma=$("#idImagenFirma").val();
  console.log(idFirma)
  if(idFirma!="")perfil.idImagenFirma=idFirma

  var usuario=$("#usuario").val();
  var clave=$("#password").val();
  var _id=this._id;

if(clave!="")resetearClave(_id,clave);
UIBlock.block('Realizando consulta, aguarde por favor...');
Meteor.call("users.update",_id,usuario,perfil,function(err,res){
  UIBlock.unblock();
if(!err){
  consultarUsuarios();
  Modal.hide();
}
      else swal("Ops..","hay un problema con la carga del nuevo usuario: "+err.message,"error")
  })
}
})
Template.nuevoUsuario.events({
   'change .imagenFirma': function(event, template) {
    var files = event.target.files;
    console.log(this,event)
    for (var i = 0, ln = files.length; i < ln; i++) {
      Archivos.insert(files[i], function (err, fileObj) {
    
        $("#idImagenFirma").val(fileObj._id);
      });
    }
  },
  "click #btnAgregarUsuario":function(){
    console.log("acet")
    var perfil={
    
    idProfesional:$("#idProfesional").val(),
    profesional:$("#profesional").val(),
    nombres:$("#nombres").val(),
    email:$("#email").val(),
    contactos:$("#contactos").val(),
    mp:$("#mp").val(),
    nm:$("#nm").val(),
    telefono:$("#telefono").val(),
    idImagenFirma:$("#idImagenFirma").val(),
    rol:$( "#tipoUsuario option:selected" ).val()
  };
  var usuario=$("#usuario").val();
    var clave=$("#password").val();
    UIBlock.block('Realizando consulta, aguarde por favor...');
    Meteor.call("users.add",usuario,clave,perfil,function(err,res){
      UIBlock.unblock();
      if(!err){
        consultarUsuarios();
        Modal.hide();

      }
      else swal("Ops..","hay un problema con la carga del nuevo usuario: "+err.message,"error")
    });

  },
})