var crearExp = function(searchText) {
	// this is a dumb implementation
	var parts = searchText.trim().split(/[ \-\:]+/);
	var re= new RegExp("(" + parts.join('|') + ")", "ig");
	return {"$where":re.test(searchText)};
}
var marcarMensajesLeidos=function(usuario)
{
Meteor.call("marcarMensajesLeidos",usuario,Meteor.userId(),function(err,res){
 
})
}
var _getImporte=function(arr)
{
  var sum=0;
  for(var i=0;i<arr.length;i++)sum+=arr[i].importe;
    return sum;
}
function rellenarOs()
{
	var datos = $.map(ObrasSociales.find().fetch(), function (obj) {
  return {text:obj.nombreOs,id:obj._id}
});
	$("#idObraSocial").select2({data:datos});
}
Template.facturarMasivoOs.rendered=function(){
	Meteor.subscribe('obrasSociales.all')
	setTimeout(function(){rellenarOs()},500)
}

Template.facturarMasivoOs.helpers({
	"os":function(){
		return Session.get("osMasivo")
	},
	"cantidad":function()
	{
		return this.facturas.length;
	},
	"estado":function()
	{
		return this.estado
	},
	"importe":function()
	{
		var sum=0;
		for(var i=0;i<this.facturas.length;i++)sum+=this.facturas[i].importe;
		return sum.formatMoney(2)
	}
})

Template.facturarMasivoOs.events({
	"click #syncServidor":function(){
    var idOs=this.idObraSocial;
    var idLiquidacion=this.idLiquidacion;
     swal({
      title: "Estas Seguro de inyectar esta liquidacion?",
      text: "Una vez realizada no podrás cambiar la información!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Si  !",
      closeOnConfirm: true
    }, function() {
     
       UIBlock.block('Sincronizando, aguarde un momento...');
        Meteor.call("remote.syncLiquidacion",idLiquidacion,idOs,function(res,err){
          UIBlock.unblock();
          if(!err){
            swal("Genial!","Se han sincronizado con el server de la asociacion!","success");
            //Liquidaciones.update({_id:data._id},{$set:{estado:"INYECTADO"}});
          }
          else swal("Ops",err,'error');
      })
      
    });
  },
	"click #btnBuscar":function(){
		var mes=$("#mes").val()-1;
		var idObraSocial=$("#idObraSocial").val();
		var fechaDesde=new Date($("#ano").val(),mes,1);
		var fechaHasta=new Date($("#ano").val(),mes,31);
		Meteor.call("liquidaciones.buscarMasivo",fechaDesde,fechaHasta,idObraSocial,function(err,res){
			
			Session.set("osMasivo",res);
		})
		
	}
})
Template.layoutApp.events({
    "click .salirSistema":function(){
      swal({   title: "Estas Seguro de salir?",   text: "Una vez que hecho debes vovler a ingresar con tus datos!",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Si, salir!",   closeOnConfirm: true },
      function(){ Meteor.logout();Router.go('/');  });

    },
    "click #btnLiquidarMasivo":function(){
    	Modal.show("facturarMasivoOs")
    },
    "click #nuevoPaciente":function(){
    	Modal.show("nuevoPaciente")
    },
    "click #nuevoMedicamento":function(){
    	Modal.show("nuevoMedicamento")
    },
    "click #nuevaReceta":function(){
    	Modal.show("nuevaReceta")
    },
     "click #nuevoLoginObraSocial":function(){
    	Modal.show("nuevoLoginObraSocial")
    },
    "click #nuevoEstudio":function(){
    	Modal.show("nuevoEstudio")
    },
    "click #btnSync":function()
  {
  	 swal({   title: "Estas Seguro de sincronizar con la asociacion?",   text: "Una vez realizado estaran sincronizados!",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#337ab7",   confirmButtonText: "Si!!",   closeOnConfirm: true },
      function(){ 
      	 UIBlock.block('Sincronizando, aguarde un momento...');
		    Meteor.call("remote.syncOs",function(err){
		      UIBlock.unblock();
		      if(!err)swal("Genial!","Se han sincronizado las bases de obra sociales y nomencladores!");
		      else swal("Ops","Ha ocurrido un error, por favor contactese con el administrador del sistema");
		  })
        });

   
  },

  	"autocompleteselect #buscadorSocio": function(event, template, doc) {
		$("#buscadorSocio").val("");
      Router.go("/fichaSocio/"+doc._id);
	},
		"click #btnBuscarSocio": function() {
			UIBlock.block('Buscando Socio...');
	Meteor.call("consultarSocio",($("#nroSocioGenerico").val()*1),false,function(err,res){
		UIBlock.unblock();
		if(res) Router.go("/fichaSocio/"+res._id);
			else swal("Ops..","No se encontro el nro de socio!")
	})
		
			
	},
})
Template.inicio.rendered=function(){
	Meteor.subscribe("obrasSociales.all");
}
Template.inicio.helpers({
	'empresa': function(){
     return Settings.findOne({clave:"nombreEmpresa"}).valor;
     },
	'usuario': function(){
     return Meteor.user()
     },
	  'esAdmin': function(){
     if(!Meteor.user())return false;
     if(Meteor.user().profile==="admin")return true;
       return false;
     },
})
var consultarMensajesNuevos=function()
{

Meteor.call("consultarMensajesNuevos",Meteor.userId(),function(err,res){
 $(".usuariosChat").attr("style","");
 var audio=new Audio("/sonidos/tono-mensaje-4-.mp3");
 for(var i=0;i<res.length;i++){
 	
 	if(res[i].cantidadMensajesNoLeidos>0){
 		$("#usuario_"+res[i]._id).attr("style","color:red");
 		audio.play();
 		$("#cantidadMensajes_"+res[i]._id).show();
 		$("#cantidadMensajes_"+res[i]._id).html(res[i].cantidadMensajesNoLeidos);
 		
 	}else{
 	$("#usuario_"+res[i]._id).attr("style","");
 	 $("#cantidadMensajes_"+res[i]._id).hide();
 	 
 	 }
 }
})
}
Template.layoutApp.rendered=function(){
// Meteor.setInterval(consultarMensajesNuevos, 5000);
// Meteor.call("usuariosChat",Meteor.userId(),function(err,res){
//  Session.set("usuariosChat",res);
// })
buscarUsuarios();
}
var buscarUsuarios=function()
{
  Meteor.call("users.list",function(err,res){
    Session.set("usuarios",res)
          })
}
Template.usuarioChat.events({
"click #abrirChat":function()
{
marcarMensajesLeidos(this._id);
var act=this;
$(document).on('hide.bs.modal','#chatModal', function () {
console.log(Session.get("idChat"));
Meteor.clearInterval(Session.get("idChat"))
})
	   Modal.show('mensajesInternos',function(){
			return act;
			
		});
}
})
Template.usuarioChat.helpers({
"nombreUsuario":function()
{
return this.username.substring(0,3);

},
"id":function()
{
return this._id

},



})
Template.layoutApp.helpers({
"puedeVerAux":function(){
	if(Meteor.user().profile.idProfesional=="13")return true;
	return false;
},
"usuarios":function()
{
return Session.get("usuariosChat");
}
,
"muestraSync":function(){
    if(Meteor.user()) return Meteor.user().profile.rol=="secretaria"?"none":"";
    
    return "none";
  },
	"usuario":function(){
		if(Meteor.user()) return Meteor.user().profile.nombres;
	},
	"esAdmin":function(){
	
	if( Meteor.user().profile=="admin") return true;
    if(Meteor.user())  return Meteor.user().profile.rol=="administrador";
  },
  "puedeSync":function(){
    if(Meteor.user()) return Meteor.user().profile.rol!="secretaria";
  },
     "estaLogueado":function(){
         if(!Meteor.user())return false;
         return true;
     },
	  
  "settings": function() {

		return {
			position: "bottom",
			limit: 15,
			rules: [{
				token: '',
				collection: Socios,
				field: "nroSocio",
				matchAll: false,
				selector: function(match) {
					var search = new RegExp(match, 'i');
					var exp="/^"+match+"*/";
					var buscaNro=null;
					//if(!isNaN(match)) buscaNro=};
					return {$or:[{dni:{$regex:search}},{nroSocio:{$eq:match}},{apellido:{$regex:search}}]};
				},
				template: Template.buscadorSocios
			}, ]
		};
	},
  'nombreUsuario':function(){
    if(!Meteor.user())return "";
    return Meteor.user().username;
  }
});