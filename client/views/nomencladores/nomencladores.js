Template.nomencladores.rendered=function () { 
   this.filter = new ReactiveTable.Filter('buscadorNomencladores', ['codigoNomenclador']);
   this.filterNombre = new ReactiveTable.Filter('buscadorNombre', ['nombreNomenclador']);
}
Template.nomencladores.events({
   "keyup #codigoNomenclador": function (event, template, doc) {

      var input = $(event.target).val();
      console.log(input)
     if(input=="")template.filter.set("");
      else template.filter.set(input);
      
   },
   "keyup #nombreNomenclador": function (event, template, doc) {

      var input = $(event.target).val();
      console.log(input)
     if(input=="")template.filterNombre.set("");
      else template.filterNombre.set(input);
      
   },
'mouseover tr': function(ev) {
    $("#tabla").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();

  },
"click #btnSync":function()
{
  Meteor.call("remote.syncNomencladores",function(err){
    if(!err)swal("Genial!","Se han sincronizado las bases de liquidaciones");
    else swal("Ops","Ha ocurrido un error, por favor contactese con el administrador del sistema");
  })
}
})

Template.nomencladores.helpers({
	'settings': function(){
    var data=this.nomencladores;
        return {
 collection: data?data:[],
 rowsPerPage: 100,
  filters: ['buscadorNomencladores',"buscadorNombre"],
 class: "table table-hover table-condensed",
 showFilter: false,
 fields: [

	   {
        key: 'nombreNomenclador',
			 label:"Clave",
      },
      {
        key: 'codigoNomenclador',
			 label:"Codigo",
      },

      {
        key: 'importe',
        label: '$ importe',
      },

      
  
 ]
 };
    }

});