Template.accionesArchivos.events({
   "click .restaurar":function(){
      UIBlock.block('Restaurando DB...');
     console.log(this)
     Meteor.call('googleDriveRestaurar',this.id,function(err,res){
       swal("OK..","Se ha restaurado los datos!","success");
       UIBlock.unblock();
      });
  },
})
Template.googleDrive.events({
    "click #autorizar":function(){
      UIBlock.block('Autorizando a GOOGLE DRIVE...');
     Meteor.call('googleDriveAutorizar',function(err,res){
       window.open(res, "_blank");
         UIBlock.unblock();
       console.log(res)
      });
  },
  "click #backupear":function(){
    UIBlock.block('Subiendo a GOOGLE DRIVE...');
     Meteor.call('googleDriveBackup',function(err,res){
        console.log("BACKUP OK de archivo "+res+" !")
        Meteor.call('googleDriveUpload',res,function(err,res){
       swal("Genial!!..","SUBIDO A GOOGLE DRIVE OK!","success");
           UIBlock.unblock();
      });
      });
  },
  
    "click #archivos":function(){
       UIBlock.block('Buscando archivos de backup en GOOGLE DRIVE...');
     Meteor.call('googleGetArchivos',function(err,res){
        UIBlock.unblock();
       Session.set("archivosGoogle",res);
      });
  },
   "click #solicitarToken":function(){
     UIBlock.block('Solicitando TOKEN a GOOGLE DRIVE...');
     Meteor.call('googleDriveSolicitarToken',function(err,res){
        UIBlock.unblock();
       var id=Settings.findOne({clave:"googleDrive_token"})._id;
       Settings.update({_id:id},{$set:{valor:JSON.stringify(res),clave:"googleDrive_token"}});
          swal("OK..",res,"success");
        console.log(err);
      });
  },
})
Template.googleDrive.helpers({
  'settings': function(){
        return {
 collection: Session.get("archivosGoogle"),
 rowsPerPage: 30,
 showFilter: false,
class: "table table-condensed",
 fields: [
      {
        key: 'name',
        label: 'Nombre',
        headerClass: 'col-md-3',
      },
   {
        key: 'modifiedTime',
        label: 'Fecha Creacion',
     fn: function (value, object, key) {
          return value
         }
      },
   {
        key: 'id',
        label: 'ID',
     fn: function (value, object, key) {
          return value
         }
      },
   
   {
        label: '',
        headerClass: 'col-md-2',
        tmpl:Template.accionesArchivos
      }
 ]
 };
    },
  "archivos":function(){
    return Session.get("archivosGoogle")
  },
   "venceToken":function()
  {
    var token=JSON.parse(Settings.findOne({clave:"googleDrive_token"}).valor);
    console.log(token)
    var a = new Date(token.expiry_date);
    return a.getFecha();
  },
  "getToken":function()
  {
    var to=Settings.findOne({clave:"googleDrive_token"}).valor;
    return to!="---"?"TOKEN OK":"FALTA TOKEN";
  },
})
Template.tablaSistema.helpers({
   'settings': function(){
        return {
 collection: Settings.find(),
 rowsPerPage: 30,
 showFilter: false,
class: "table table-condensed",
 fields: [
      {
        key: 'clave',
        label: 'Clave',
        headerClass: 'col-md-2',
      },
   {
        key: 'valor',
        label: 'Valor',
     fn: function (value, object, key) {
       var masde40=value.length>40?"...":"";
          return value;
         }
      },
   
   {
        label: '',
        headerClass: 'col-md-2',
        tmpl:Template.accionesDatosSistema
      }
 ]
 };
    }
})
Template.datosSistema.helpers({
 
   
});

var getImagen=function(tipo)
{
  Meteor.call("getImagen",tipo,function(err,res){
    if(res) {
      $("#"+tipo).attr("class","");
      $("#"+tipo).attr("src",res)
    } 
    else $("#"+tipo).attr("class","imagenGris")
})
  
}
var getArchivo=function(tipo)
{
  Meteor.call("getArchivo",tipo,function(err,res){
    if(res) {
      $("#"+tipo).attr("class","");
    } 
    else $("#"+tipo).attr("class","imagenGris")
})
  
}
var getImagenes=function()
{
   getImagen("logoEmpresa");
  getArchivo("frenteTarjeta")
  getImagen("dorsoTarjeta")

}
Template.imagenesSistema.rendered=function(){
 getImagenes()
};
Template.subirImagenSistema.events({
   "change .file-upload-input": function(event, template){
   var func = this;
   var file = event.currentTarget.files[0];
   
   var reader = new FileReader();
   reader.onload = function(fileLoadEvent) {
     UIBlock.block('Subiendo Archivo, aguarde por favor...');
     console.log(file)
      console.log(reader)
     var arr=file.type.split("/");
     var tipoImagen=$('input:radio[name=nombreImagen]:checked').val();
     
      Meteor.call('subirImagen',tipoImagen, arr[1], reader.result,function(err,res){
         UIBlock.unblock();
         $(".file-upload-input").val('');
          swal("GENIAL!","Se han actualizado los datos","success");
        getImagenes();
      });
  
   
   };
   reader.readAsBinaryString(file);
}
})
Template.tablaSistema.events({
    'click #generarVariables': function(ev) {
     Meteor.call("generarVariables",function(err,res){   
 swal("GENIAL!","Se han actualizado los datos","success");
 });
  },
  'click #pasarCuentasDebito': function(ev) {
      UIBlock.block("Espere, estamos pasando las cuentas de los perfiles..");
     Meteor.call("pasarCuentasDebito",function(err,res){   
         UIBlock.unblock();
        swal("GENIAL!","Se han actualizado los datos","success");
 });
  },
  
  'mouseover tr': function(ev) {
    $("#tablaDatosSistema").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();
    
  },
  'mousemove tr': function(ev) {
    
  },
  'click .delete': function(ev) {
    var id=this._id;
    swal({   title: "Estas Seguro de quitar?",   text: "Una vez que lo has quitado sera permanente!",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#DD6B55",   confirmButtonText: "Si, borralo!",   closeOnConfirm: true }, function(){ Settings.remove(id); swal("Quitado!", "El registro ha sido borrado", "success"); });

  },
  'click .update': function(ev) {
    Router.go('/modificarDatosSistema/'+this._id);
  },
  
});
AutoForm.hooks({
  'nuevoDatosSistema_': {
    onSuccess: function (operation, result, template) {
     swal("GENIAL!","Se ha ingresado!","success");
    },
    onError: function(operation, error, template) {
     swal("Ops!","ha ocurrido un erro al ingresar el registro:"+error,"error");
    }
  },
    'modificarDatosSistema_': {
    onSuccess: function (operation, result, template) {
     swal("GENIAL!","Se ha modificado !","success");
      Router.go('/datosSistema/');
    },
    onError: function(operation, error, template) {
     swal("Ops!","ha ocurrido un erro al ingresar el registro:"+error,"error");
    }
  }
});