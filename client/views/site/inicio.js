Template.inicio.onRendered(function(){
console.log("cosultando");
Meteor.subscribe('settings.all')
  Meteor.call("listArchivosExcelNomenclador",function(err,res){
    if(err)swal("ops","Hay errores, llamar al administrador del sistema");
    Session.set("archivosExcel",res);
    console.log(res);
  })
})
Template.inicio.helpers({
	'settings': function(){
        return {
 collection: Session.get("archivosExcel"),
 rowsPerPage: 100,
 class: "table table-hover table-condensed",
 showFilter: false,
 fields: [

	   {
        key: 'nombreOs',
			 label:"Obra Social",
      },
      {
              key: 'ultimaModificacion',
              label: 'Actualizado',
              headerClass:"col-md-1",
              fn:function(value,obj){
                if(value)
                return new Spacebars.SafeString(value.getFecha())
              }
            },
            {
          label: '',
         // headerClass: 'col-md-1',
          tmpl: Template.accionesExcel
        }

      
  
 ]
 };
    }

});
Template.inicio.events({
"click .descargar":function(){
var val=Settings.findOne({ clave: "direccionNomencladoresExcel"  });
  var direccion=(val?val.valor:"")+this.archivo;
  window.location.replace(direccion)
}
})