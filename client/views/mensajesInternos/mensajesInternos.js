var agregarMensaje=function(usuario)
{
if($("#cuerpoMensaje").val()!="")
Meteor.call("agregarMensajeInterno",$("#cuerpoMensaje").val(),Meteor.userId(),usuario._id,function(err,res){
	$("#cuerpoMensaje").val("")
	});
	else swal("Ops!","Debes poner un mensaje!","error")
}
Template.mensajesInternos.events({
"click .agregarMensaje":function(){
agregarMensaje(this)
	},
	"keypress #cuerpoMensaje":function(ev,temp){
		if (ev.which === 13)agregarMensaje(this);
	}
})
var consultarChat=function(emisor,rectp)
{
	Meteor.call("consultaMensajesChat",emisor,rectp,function(err,res){
	console.log(res)
	Session.set("mensajesChat_"+rectp+"_"+emisor,res)
	});
}
Template.mensajesInternos.rendered=function()
{
var idu=this.data._id;
consultarChat(idu,Meteor.userId());
var nombreSesion="mensajesChat_"+Meteor.userId()+"_"+idu;
Session.set(nombreSesion,[])
Session.set("idChat",Meteor.setInterval(function(){consultarChat(idu,Meteor.userId()) }, 2000));
}
Template.mensajesInternos.helpers({
 "mensajeChat":function(){
     var object=this;
     var d=new Date(object.created);
          var hoy=new Date();
          var aux_fecha="";
          if(d.toLocaleDateString()===hoy.toLocaleDateString()) aux_fecha= d.toLocaleTimeString();
           else aux_fecha= d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
           var clase=object.idUsuarioReceptor==Meteor.userId()?"text-danger":"text-success";
//            var separador=object.idUsuarioReceptor==Meteor.userId()?"&nbsp&nbsp&nbsp":"&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp";
var separador="&nbsp&nbsp&nbsp"
            var usaurio=object.idUsuarioReceptor==Meteor.userId()?"(SECTOR)":"(YO)";
           var mens="<i><small>"+aux_fecha+" </small></i> "+"<span class='"+clase+"'>"+separador+usaurio+object.mensaje+"</span>";
           console.log(mens)
           return new Spacebars.SafeString(mens) 
 },
 "items":function(){
     var user=this._id;
   var nombreSesion="mensajesChat_"+Meteor.userId()+"_"+user;
return Session.get(nombreSesion)  
 },
'settings': function(){
var user=this._id;
var nombreSesion="mensajesChat_"+Meteor.userId()+"_"+user;
console.log(nombreSesion)
//consultarMensajes(Meteor.userId(),this._id);
//Meteor.subscribe('MensajesInternos',{usuarioSesion:Meteor.userId() ,usuarioChat:this._id});
        return {
 collection: Session.get(nombreSesion),
 rowsPerPage: 20,
 class: "table table-condensed",
 showFilter: false,
 multiColumnSort:false,
// rowClass: function(item) {
// if(item.idUsuarioReceptor==Meteor.userId())return "danger";
// return "warning"
// },
 fields: [
      {
        key: 'mensaje',
        label: 'Mensaje',
        headerClass: 'col-md-4',sortable: false,
        sortOrder: 0, 
         fn: function (value, object, key) {
          var d=new Date(object.created);
          var hoy=new Date();
          var aux_fecha="";
          if(d.toLocaleDateString()===hoy.toLocaleDateString()) aux_fecha= d.toLocaleTimeString();
           else aux_fecha= d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
           var clase=object.idUsuarioReceptor==Meteor.userId()?"text-danger":"text-success";
//            var separador=object.idUsuarioReceptor==Meteor.userId()?"&nbsp&nbsp&nbsp":"&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp";
var separador="&nbsp&nbsp&nbsp"
            var usaurio=object.idUsuarioReceptor==Meteor.userId()?"(SECTOR)":"(YO)";
           var mens="<i><small>"+aux_fecha+" </small></i> "+"<span class='"+clase+"'>"+separador+usaurio+object.mensaje+"</span>";
           console.log(mens)
           return new Spacebars.SafeString(mens) 
         }
      },
    
    
      


 ]
 };
    },
  'nombreUsuario':function(){
    if(!Meteor.user())return "";
    return Meteor.user().username;
  }
});