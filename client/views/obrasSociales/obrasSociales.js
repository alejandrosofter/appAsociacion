Template.obrasSociales.onCreated(function () {
  Meteor.subscribe('obrasSociales.all');
Meteor.subscribe('nomencladores.all');
  this.filter = new ReactiveTable.Filter('buscadorObras', ['nombreOs']);

});
Template.accionesObrasSociales.helpers({
  "rangos":function(){
    return Nomencladores.find({idObraSocial:this.id}).fetch();
        
  }
})
Template.accionesObrasSociales.helpers({
"fechaNomenclador":function(){
    return this.fechaDesde.getFecha()
  },
})
Template.obrasSociales.helpers({
  
	'settings': function(){
        return {
 collection: ObrasSociales.find(),
 rowsPerPage: 100,
 class: "table table-hover table-condensed", 
 filters: ['buscadorObras'],
 showFilter: false,
 fields: [

     {
        key: 'nombreOs',
       label:"Nombre",
      },


    

       
      {
          label: '',
         // headerClass: 'col-md-1',
          tmpl: Template.accionesObrasSociales
        }
      
  
 ]
 };
    }

});

Template.obrasSociales.events({
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

  "click .nomenclador":function(){
   Router.go("/nomencladores/"+this._id)
  }

})