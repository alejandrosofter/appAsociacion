Template.settings.onCreated(function () {
  Meteor.subscribe('settings.all');
});

Template.settings.helpers({
	'settings_': function(){
        return {
 collection: Settings.find(),
 rowsPerPage: 100,
 class: "table table-hover table-condensed",
 showFilter: false,
 fields: [

	   {
        key: 'clave',
        headerClass: 'th-sm',
			 label:"Clave",
      },
      {
        key: 'valor',
        label: 'Valor',
      },
       
      {
          label: '',
          headerClass: 'th-sm',
          tmpl: Template.accionesSettings
        }
      
  
 ]
 };
    }

});
Template.modificarSettings.helpers({

})
Template.settings.events({

  'mouseover tr': function(ev) {
    $("#tabla").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();

  },
  "click #btnAgregar":function(){
    UIBlock.block('Consultando al servidor, aguarde un momento...');
    Meteor.call("settings.generarVariables",function(err){
      UIBlock.unblock();
    	if(!err)swal("Genial!","Se han generado las variables!","success");
    	else swal("Opss..",err.message,"error");
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
     Meteor.call("settings.remove",id,function(err,res){
      if(!err)swal("Bien!","Se ha eliminado el registro ","success")
      else swal("Ops..","hay un problema con la carga del nuevo usuario: "+err.message,"error")
    });
      
      
    });

  },
   'click #modificar': function(ev) {
    var data=this;
    Modal.show("modificarSettings",function(){
      return data
    })

  },
});