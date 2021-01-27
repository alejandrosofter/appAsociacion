var getColumnaAcciones=function(ancho)
{

return ({
        label: '',
        headerClass: 'col-md-'+ancho,
        tmpl:Template.accionesSubItemsGral
      })
}
AutoForm.hooks({

  'nuevoSubItemsGral_': {


  
    onSuccess: function(operation, result, template) {
      UIBlock.unblock();
      swal("GENIAL!", "Se ha creado el registro!", "success");
      Modal.hide();

    },
    onError: function(operation, error, template) {
UIBlock.unblock();
      swal("Ops!", "ha ocurrido un error, por favor chequee los datos ingresados: " + error, "error");


    }
  },
  'modificarSubItemsGral_': {

  
    onSuccess: function(operation, result, template) {
      UIBlock.unblock();
      swal("GENIAL!", "Se ha modificado el registro!", "success");
      Modal.hide();

    },
    onError: function(operation, error, template) {
UIBlock.unblock();
      swal("Ops!", "ha ocurrido un error, por favor chequee los datos ingresados: " + error, "error");


    }
  }
});
Template.accionesSubItemsGral.helpers({
  "tmplAcciones":function()
{
  return Session.get("dataModuloSubitemsGral").tmplAcciones
},
"tieneItems":function()
{
  return Session.get("dataModuloSubitemsGral").tieneItems?true:false;
}
})

Template.accionesSubItemsGral.events({
  "click .ver":function(){
    Session.set("subItems_gralitems",this.items?this.items:[]);
    mostrarItems()
  },

 "click .delete":function(){
        console.log(this)
        var id=this._id;
         swal({   title: "Estas Seguro de quitar este registro?",   text: "",   type: "success",   showCancelButton: true,   confirmButtonColor: "#4cae4c",   confirmButtonText: "Si, QUITARLO!",   closeOnConfirm: true },
               function(){
             UIBlock.block('Consultando datos, aguarde un momento...');
    Meteor.call("quitarItemGenerico", Session.get("dataModuloSubitemsGral").nombreModulo,Session.get("dataModuloSubitemsGral").parent._id,Session.get("dataModuloSubitemsGral").scope,id,function(err,res){
        UIBlock.unblock();
        console.log(res)
     Session.set("subItemsGral",res);
    })
         })
   
    },
})



var getAcciones=function()
{
  return  {
        label: '',
        headerClass: 'col-md-2',
        tmpl:Template.accionesSubItemsGral
      }
}
Template.subItemsGral.helpers({

"nombreTabla":function()
{
  return "tablaItems_"+this.nombreModulo
},
    'settings': function(){
      var cols=this.columnas;
      cols.push(getAcciones())
      Session.set("subItemsGral",this.parent.cierres);
        return {
         collection: Session.get("subItemsGral"),
         rowsPerPage: 10,
         class: "table table-condensed",
         showFilter: false,
         fields: cols
         };
    },
    'settingsItems': function(){
      var cols=this.colsItems;
      console.log(this)
        return {
         collection: Session.get("subItems_gralitems"),
         rowsPerPage: 10,
         class: "table table-condensed",
         showFilter: false,
         fields: cols
         };
    },

    
      "nombreModuloMayu":function(){
        console.log(this)
        return this.nombreModulo.toUpperCase();
  },
});
Template.subItemsGral.onRendered(function(){

 Session.set("dataModuloSubitemsGral",(this.data));


})
Template.nuevoSubItemsGral.rendered=function(){
 var callback=this.data.callbackCambiaValor;
 $(".formulario").on("keydown",function(){
  callback();
 })
 this.data.callbackInit();
}

Template.subItemsGral.events({
  'click #btnAgregar': function(){
    var data=this;
    data.dataGral=Session.get("dataModuloSubitemsGral");
         Modal.show('nuevoModuloGral',function(){ return data; });
    },
    
   "click #btnVolver":function()
  {
    mostrarFormulario();
    
  },
  'mouseover tr': function(ev) {
    var tabla="#tablaItems_"+Session.get("dataModuloSubitemsGral").nombreModulo;
    console.log(tabla)
    $(tabla).find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();
    
  },
  'mousemove tr': function(ev) {
    
  },
 
  
  'click .update': function(ev) {
   var data=this;
   data.dataGral=Session.get("dataModuloSubitemsGral");
     Session.set("idSeleccionGral",this._id);
    Modal.show('modificarModuloGral',function(){ return data; });
  },
});
var mostrarItems=function()
{
  $("#items").show();
  $("#formulario").hide();
}
var mostrarFormulario=function()
{
  $("#items").hide();
  $("#formulario").show();
}
var getVarsForm=function()
{
  var sal={};
  $(".formulario").get().forEach(function(entry, index, array) {
    var elem=$(entry);
    sal[elem.attr("name")]=elem.val();
});
  console.log(sal);
  return sal;
}
var buscarItems=function(nombreFuncion,vars,callback)
{
  UIBlock.block('Consultando datos, aguarde un momento...');
  Meteor.call(nombreFuncion,vars,getVarsForm(),function(err,res){
    UIBlock.unblock();
    callback(res);
    Session.set("itemsSubColeccionGral",ripData(res) );
    mostrarItems()
  })
}
var ripData=function(data)
{
  for(var i=0;i<data.length;i++){
      data[i].campos=getCampos(data[i]);
    data[i].cont=i;
  }
console.log(data)
  return data;
}
var getCampos=function(data)
{
  var sal=[];
  $.each(data, function(index, value) {
    
    sal.push(index)
}); 
  return sal;
}
Template.nuevoSubItemsGral.events({
  "keydown .formulario":function(ev){

    },
  "click #btnItems":function()
  {
    mostrarItems();
    console.log(this)
    var vars=this.varsBuscaItems;
    vars["parent"]=this.parent;
    buscarItems(this.nombreFuncionServer,this.varsBuscaItems,this.callbackSuma);
  },
  "click #btnVolver":function()
  {
    mostrarFormulario();
    
  }
})

Template.nuevoSubItemsGral.helpers({
    "getValorCampo":function(item,campo)
  {
    return item[campo]
  },
  "nombreCampoItems":function()
  {
    return this.subColeccion;
  },
"tieneItems":function()
{
return this.tieneItems!=null;
},
"items":function()
{
  return Session.get("itemsSubColeccionGral");
},
"documento":function()
{
return this.parent
},

"nombreModulo":function()
{
  return this.nombreModulo;

},

"scope":function()
{
  return this.scope;

},
"Coleccion":function()
{
  return eval(this.nombreModulo);

},
"tmpl":function()
{
  return (this.tmpl);

},
'settingsItems': function(){
        return {
 collection: Session.get("itemsSubColeccionGral"),
 rowsPerPage: 10,
 class: "table table-condensed",
 showFilter: false,
rowClass(  data ) {
    
  },
 fields: this.colsItems
 };
    },
"colsItems":function()
{
  return this.colsItems
},
"funcionBuscaItems":function()
{
  return this.funcionBuscaItems
},
"varsBuscaItems":function()
{
  return this.varsBuscaItems
},


})
