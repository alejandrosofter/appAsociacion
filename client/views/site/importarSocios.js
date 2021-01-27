/*eslint-disable no-undef */
Template.importarSocios.onCreated(function () {
  
});

Template.importarSocios.helpers({
 "info":function(){
  return Settings.findOne({clave:"cadenaLugarImportacionSocio"}).valor;
 }
});
var file=null;
var cargarArchivo=function(){
  var reader = new FileReader();
   reader.onload = function(fileLoadEvent) {
     UIBlock.block('Subiendo Archivo, aguarde por favor...');
      Meteor.call('fileUploadSocios', file, reader.result,function(err,res){
         UIBlock.unblock();
        if(!err){
          swal({   title: "Estas Seguro de proceder?",   text: "Una vez aceptado se borraran todos los socios y se cargaran los que estan en la planilla que subiste..",   type: "warning",   showCancelButton: true,   confirmButtonColor: "#4ba42e",   confirmButtonText: "Si, cargar!",   closeOnConfirm: true },
               function(){
             UIBlock.block('Ingresando Socios, aguarde por favor...');
            Meteor.call('cargarSocios',$("#borrarDatosAnteriores:checked").val(),$("#formatoFecha").val(),$("#tieneApellidoJunto").val(),$("#campos").val(),function(err,res){
            UIBlock.unblock();
            swal("Genial!","Se han importado los socios! "+res,"success"); 
          });
          });
          
        }
      });
   };
   reader.readAsBinaryString(file);
}
Template.importarSocios.events({
 "change .file-upload-input": function(event, template){
   file = event.currentTarget.files[0];
},
 "click #btnAceptar":function(){
  if(file) cargarArchivo(); else swal("Ops..","Tenes que seleccionar un archivo!","error")
 }
});