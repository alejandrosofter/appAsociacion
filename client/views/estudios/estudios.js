Template.estudios.onCreated(function () {
  Meteor.subscribe('pacientes.all');
   Meteor.subscribe('obrasSociales.all');
   Meteor.subscribe('estudios.all');
   Meteor.subscribe('nomencladores.all');
  // this.filter = new ReactiveTable.Filter('buscadorObras', ['nombreOs']);

});
Template.facturarEstudio.events({
  "click #btnAceptar":function(){
    Meteor.call("inyectarPracticas",$("#idLiquidacion").val(),this._id,function(err,res){
      swal("Genial!","Se han ingresado estas practicas a tu liquidacion selecionada!");
      Modal.hide()
    })
  }
})
Template.facturarEstudio.rendered=function () {
 buscarNomencladoresPaciente(this.data.idPaciente,this.data.idNomenclador);
 buscarLiquidaciones(Session.get("idLiquidacionSeleccionAux"))
}
Template.estudios_practicas.rendered=function () {
 buscarPracticasEstudio()
 buscarPracticasNomenclador(this.data);
}
function getCantidadFacturar(items)
{
  var cant=0;
  for(var i=0;i<items.length;i++)
    if(items[i].estado=="APROBADO")cant++;
  return cant
}
Template.accionesEstudios.helpers({
  "rangos":function(){
    return Nomencladores.find({idObraSocial:this.id}).fetch();
        
  },
  "cantidadFacturar":function(){
    if(this.estado=="PENDIENTE"){
      var cantidad= getCantidadFacturar(this.practicas);
      if(cantidad>0)return cantidad
    }
    
  },
  "puedeFacturar":function(){
    if(this.estado=="PENDIENTE")return true;
    return false
    
  }
})
Template.nuevoEstudio.rendered=function(){
   Meteor.subscribe('pacientes.all');
}
function select2_search ($el, term) {
  $el.select2('open');
  
  // Get the search box within the dropdown or the selection
  // Dropdown = single, Selection = multiple
  var $search = $el.data('select2').dropdown.$search || $el.data('select2').selection.$search;
  // This is undocumented and may change in the future
  
  $search.val(term);

  $search.trigger('input');
   setTimeout(function() { $('.select2-results__option').trigger("mouseup"); }, 500);
}
Template.modificarEstudio.rendered=function(){
   buscarNomencladoresPaciente(this.data.idPaciente,this.data.idNomenclador);
   var paciente=Pacientes.findOne({_id:this.data.idPaciente});
   var selector=getSelectorPaciente();
   var $select = $("#idPaciente");
  select2_search($select, paciente.nombrePaciente);
  $select.val(this.data.idPaciente);
  $select.trigger('change');
}
//////////////////BUSQUEDA

function buscarPracticasNomenclador(datos)
{
  Meteor.call("buscarPracticasNomenclador",datos.idNomenclador,function(err,res){
    Session.set("allPracticas",res);
     var data = $.map(res, function (obj) {
  obj.id = obj._id // replace pk with your identifier
  obj.text=""+obj.nombreNomenclador+"  "+obj.codigoNomenclador;
  return obj;
});

  $("#practica").select2({data:data,placeholder:"Seleccione...",allowClear:true,width:"resolve"});
  
  })
}
function buscarPracticasEstudio()
{
  Meteor.call("buscarPracticasEstudio",Session.get("idEstudioSeleccion"),function(err,res){
    Session.set("practicasAux",res);
  })
}
function buscarNomencladoresPaciente(idPaciente,idNomencladorSeleccion)
{
  Meteor.call("buscarNomencladoresPaciente",idPaciente,function(err,res){
     var data = $.map(res, function (obj) {
  obj.id = obj._id // replace pk with your identifier
  obj.text="desde "+obj.fechaDesde.getFecha()+" hasta "+obj.fechaHasta.getFecha();
  return obj;
});
  $("#idNomenclador").select2({data:data,placeholder:"Seleccione...",allowClear:true,width:"resolve"});
  if(idNomencladorSeleccion) $('#idNomenclador').val(idNomencladorSeleccion).trigger('change');
  })
}
function buscarLiquidaciones(idLiquidacionSeleccion)
{
  Meteor.call("buscarLiquidaciones",Meteor.user()._id,function(err,res){
     var data = $.map(res, function (obj) {
  obj.id = obj._id // replace pk with your identifier
  obj.text=""+obj.detalle+" "+obj.fecha.getFecha();
  return obj;
});
  $("#idLiquidacion").select2({data:data,placeholder:"Seleccione...",allowClear:true,width:"resolve"});
  if(idLiquidacionSeleccion) $('#idLiquidacion').val(idLiquidacionSeleccion).trigger('change');
  })
}

Template.estudios.helpers({
  
  'settings': function(){
        return {
 collection: Estudios.find(),
 rowsPerPage: 100,
 class: "table table-hover table-condensed", 
 // filters: ['buscadorObras'],
 showFilter: true,
 fields: [
{
        key: 'fecha',
       label:"Fecha",
       headerClass: 'col-md-1',
       fn: function (value, object, key) {
        return value.getFecha()
       }
      },
     {
        key: 'diagnostico',
       label:"Diagnostico",
      },
      
      {
        key: 'idPaciente',
       label:"Paciente",
       headerClass: 'col-md-3',
       fn: function (value, object, key) {
          var d=Pacientes.findOne({_id:value});
           return d.nombrePaciente;
         }
      },
      {
        key: 'idNomenclador',
       label:"Nomenclador",
       headerClass: 'col-md-2',
       fn: function (value, object, key) {
          var d=Nomencladores.findOne({_id:value});
        
          if(d) return "desde "+d.fechaDesde.getFecha()+" hasta "+d.fechaHasta.getFecha();
          return "Sin Nomenclador!"
         }
      },
      {
        key: 'estado',
       label:"Estado",
       headerClass: 'col-md-1',
      },
      


    

       
      {
          label: '',
         // headerClass: 'col-md-1',
          tmpl: Template.accionesEstudios,
          headerClass: 'col-md-2',
        }
      
  
 ]
 };
    }

});
function getNombrePractica(idPractica)
{
  for (var i = 0;i<Session.get("allPracticas").length;i++)
    if(Session.get("allPracticas")[i]._id==idPractica)return Session.get("allPracticas")[i].codigoNomenclador;
  return "s/n"
}
Template.estudios_practicas.helpers({
  "docu":function(){
    console.log(this)
    return this
  },
  'settings': function(){
  
        return {
 collection: Session.get("practicasAux"),
 rowsPerPage: 100,
 class: "table table-hover table-condensed", 
 // filters: ['buscadorObras'],
 showFilter: false,
 fields: [

     {
        key: 'nro',
       label:"Nro",
       headerClass: 'col-md-1',
      },
      {
        key: 'cantidad',
       label:"Cantidad",
       headerClass: 'col-md-1',
      },
      
      {
        key: 'practica',
       label:"Practica",
       headerClass: 'col-md-3',
       fn: function (value, object, key) {
           return  getNombrePractica(value)
         }
      },
      {
        key: 'estado',
       label:"Estado",
       fn: function (value, object, key) {
        var color="red";

        if(value=="APROBADO")color="green";
        var salida="<span style='color:"+color+"'>"+value+"</span>";
        return new Spacebars.SafeString(salida);
       },
       headerClass: 'col-md-1',
      },
      


    

       
      {
          label: '',
         // headerClass: 'col-md-1',
          tmpl: Template.accionesEstudios_practicas,
          headerClass: 'col-md-2',
        }
      
  
 ]
 };
    }

});
function getSelectorPaciente()
{
  return {
                    // theme: 'bootstrap',
                    allowClear: true,
                    placeholder:"Selecccione...",
                    minimumInputLength: 3,
                    ajax: {
                        data: function (params) {
                            return params;
                        },
                        transport: function (args,success,failure) {
                            if (Meteor.isClient) {
                                // Meteor method call
                                Meteor.call('consultaPacientes', args.data, function (err, results) {
                                    if (err) {
                                        failure(err);
                                        return;
                                    }
                                    success(results);
                                });
                            }
                        },
                        processResults: function (data) {
                             var options = [];
                              _.each(data, function (c) {
                                  options.push({
                                      id: c._id,
                                      text: c.nombrePaciente
                                  });
                              });
                              return { results: options };
                        }
                    }
                }
}
Template.modificarEstudio.helpers({
  "selectorPaciente":function()
  {
    console.log(getSelectorPaciente())
    return getSelectorPaciente();
  },
  "docu":function(){
    return this
  }
})

Template.nuevoEstudio.helpers({

  "idUsuario":function(){
    return Meteor.user()._id;
  }
})

Template.nuevoEstudio.events({
"change #idPaciente": function (event, template, doc) {
  Session.set("idPacienteSeleccion",$("#idPaciente").val());
  buscarNomencladoresPaciente($("#idPaciente").val())
   },
})
Template.modificarEstudio.events({
"change #idPaciente": function (event, template, doc) {
  Session.set("idPacienteSeleccion",$("#idPaciente").val());
  buscarNomencladoresPaciente($("#idPaciente").val())
   },
})
Template.estudios_practicas.events({

'mouseover tr': function(ev) {
    $("#tablaPracticas").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();
  },

  "click #update":function(){
    var act=this;
   Modal.show('modificarEstudio',function(){ return act; });
  },
  

  "click #rechazar":function(){
    var act=this;
   swal({   title: "Estas Seguro de rechazar la practica?",   text: "..",   type: "error",   showCancelButton: true,   confirmButtonColor: "#F27474",   confirmButtonText: "Si, RECHAZAR!",   closeOnConfirm: true },
               function(){
           Meteor.call("estadoPracticaEstudio",Session.get("idEstudioSeleccion"),act._id,"RECHAZADO",function(err,res){
            buscarPracticasEstudio();
           })
          });
  },

  "click #aprobar":function(){
    var act=this;
   swal({   title: "Estas Seguro de aprobar la practica?",   text: "..",   type: "success",   showCancelButton: true,   confirmButtonColor: "#5cb85c",   confirmButtonText: "Si, aprobar!",   closeOnConfirm: true },
               function(){
           Meteor.call("estadoPracticaEstudio",Session.get("idEstudioSeleccion"),act._id,"APROBADO",function(err,res){
            buscarPracticasEstudio();
           })
          });
  },

  "click #delete":function(){
    var registro=this;
    console.log(this)
    swal({   title: "Estas Seguro de eliminar el registro?",   text: "Una vez aceptado se borrara toda la informacion del socio..",   type: "error",   showCancelButton: true,   confirmButtonColor: "#F27474",   confirmButtonText: "Si, QUITAR!",   closeOnConfirm: true },
               function(){
           Meteor.call("quitarItemGenerico","Estudios",Session.get("idEstudioSeleccion"),"practicas",registro._id,function(err,res){
            buscarPracticasEstudio();
           })
          });
  }

})
Template.imprimirEstudio.events({
"click #btnPrint":function(){
  import printJS from 'print-js'
  printJS({
    printable: 'printable',
    type: 'html',
    targetStyles: ['*']
 })
}
})

Template.imprimirEstudio.helpers({
"paciente_nombres":function(){
 
  var paciente=Pacientes.findOne({_id:this.idPaciente});
  if(paciente)return paciente.nombrePaciente;
  return "s/n"
},
"fecha":function(){
  return this.fecha.getFecha()
},
"fechaGral":function(){
  return moment().lang("es").format("DD/MM/Y"); 
},
"paciente_dni":function(){

  var paciente=Pacientes.findOne({_id:this.idPaciente});
  if(paciente)return paciente.dni;
  return "s/n"
},
"paciente_nroAfiliado":function(){

  var paciente=Pacientes.findOne({_id:this.idPaciente});
  if(paciente)return paciente.nroAfiliado;
  return "s/n"
},
"paciente_obraSocial":function(){
var paciente=Pacientes.findOne({_id:this.idPaciente});
  var os=ObrasSociales.findOne({_id:paciente.idObraSocial});
  if(os)return os.nombreOs;
  return "s/n"
},
})
Template.estudios.events({
  "keyup #idObraSocial": function (event, template, doc) {

      var input = $(event.target).val();
     if(input=="")template.filter.set("");
      else template.filter.set(input);
      
   },
'mouseover tr': function(ev) {
    $("#tabla").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();

  },
 "click #facturar":function(){
    var act=this;
   Modal.show('facturarEstudio',function(){ return act; });
  },
  "click #imprimir":function(){
    var act=this;
   Modal.show('imprimirEstudio',function(){ return act; });
  },
  "click #update":function(){
    var act=this;
   Modal.show('modificarEstudio',function(){ return act; });
  },
  "click #practicas":function(){
    var act=this;
    Session.set("idEstudioSeleccion",this._id);
   Modal.show('estudios_practicas',function(){ return act; });
  },
  "click #delete":function(){
    var registro=this;
    swal({   title: "Estas Seguro de eliminar el registro?",   text: "Una vez aceptado se borrara toda la informacion del socio..",   type: "error",   showCancelButton: true,   confirmButtonColor: "#F27474",   confirmButtonText: "Si, QUITAR!",   closeOnConfirm: true },
               function(){
           Estudios.remove({_id:registro._id});
          });
  }

})
//HOOKS/////////////////////////////
AutoForm.hooks({

  'agregarPracticaEstudio_': {

    onSuccess: function(operation, result, template) {
      buscarPracticasEstudio();
      buscarPracticasNomenclador(this.currentDoc)
      swal("GENIAL!", "Se ha ingresado la practica!", "success");
   

    },
    onError: function(operation, error, template) {
UIBlock.unblock();
      console.log(operation);console.log(error);console.log(template);
      swal("Ops!", "ha ocurrido un error, por favor chequee los datos ingresados: " + error, "error");


    }
  },
  'nuevoEstudio_': {

    onSuccess: function(operation, result, template) {
      
      swal("GENIAL!", "Se ha modificado el registro!", "success");
      Modal.hide();

    },
    onError: function(operation, error, template) {
UIBlock.unblock();
      console.log(operation);console.log(error);console.log(template);
      swal("Ops!", "ha ocurrido un error, por favor chequee los datos ingresados: " + error, "error");


    }
  },
  'modificarEstudio_': {

    onSuccess: function(operation, result, template) {
      UIBlock.unblock();
      swal("GENIAL!", "Se ha modificado el registro!", "success");
      Modal.hide();

    },
    onError: function(operation, error, template) {
      swal("Ops!", "ha ocurrido un error, por favor chequee los datos ingresados: " + error, "error");


    }
  }
})