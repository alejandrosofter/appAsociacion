Template.medicamentos.onCreated(function () {
  Meteor.subscribe('medicamentos.all');

});

Template.medicamentos.helpers({
  
	'settings': function(){
        return {
 collection: Medicamentos.find(),
 rowsPerPage: 100,
 class: "table table-hover table-condensed", 
 // filters: ['buscadorObras'],
 showFilter: true,
 fields: [

     {
        key: 'nombreComercial',
       label:"Nombre Comercial",
      },
      {
        key: 'nombreGenerico',
       label:"Nombre Generico",
      },
      {
        key: 'presentacion',
       label:"Presentación",
       fn: function (value, object, key) {
        var sal="";
        return value
       }
      },


    

       
      {
          label: '',
         // headerClass: 'col-md-1',
          tmpl: Template.accionesMedicamentos
        }
      
  
 ]
 };
    }

});

Template.medicamentos.events({

'mouseover tr': function(ev) {
    $("#tabla").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();

  },

  "click #modificar":function(){
    var data=this;
   Modal.show("modificarMedicamento",function(){
    return data
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
     
      Medicamentos.remove({_id:id})
     swal("Bien!","Se ha eliminado el registro ","success");
      
      
    });

  },

})