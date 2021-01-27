
var buscarUsuarios=function()
{
  Meteor.call("users.list",function(err,res){
    Session.set("usuarios",res);
    setUsuarios();
          })
}
function setFechas(mes,ano){
  if(!Session.get("fechaDesde_liquidacion")){
    var dias= new Date(ano, 1, 0).getDate()-1;
    var desde="01/"+mes+"/"+ano;
    var hasta=dias+"/"+mes+"/"+ano;
  
    if(Meteor.user().profile.rol=="secretaria"){
    desde="01/01/"+ano;

    hasta=dias+"/12/"+ano;
  }
    Session.set("fechaDesde_liquidacion",desde);
    Session.set("fechaHasta_liquidacion",hasta);

  }
  
  
  
  $("#fechaDesde").val(Session.get("fechaDesde_liquidacion"))
  $("#fechaHasta").val(Session.get("fechaHasta_liquidacion"))
}
function setUsuarios()
{
  var data = $.map(Session.get("usuarios"), function (obj) {
  obj.id = obj._id // replace pk with your identifier
  obj.text=obj.profile.profesional;
  return obj;
});
  $("#usuario").select2({data:data,placeholder:"Seleccione...",allowClear:true,width:"resolve"});
}


function buscarLiquidaciones()
{
  var desde=$("#fechaDesde").val().getFechaFormato();
  var hasta=$("#fechaHasta").val().getFechaFormato();
  var usuario=getUsuario(Session.get("usuario_liquidacion"),true);
  SUIBlock.block('Buscando liquidaciones, aguarde un momento...');
 
  Meteor.call("liquidaciones.buscar",desde,hasta,usuario,function(err,res){
    Session.set("liquidaciones",res);
    console.log(res)
    SUIBlock.unblock();
    
  });
}
function setUsuarioMuestra()
{
  setTimeout(function(){
    
   
    if(Meteor.user().profile.rol=="secretaria"){
      $("#usuario").val(Meteor.userId()).trigger('change')
      $("#conteUsuario").hide();
    }else $("#usuario").val(Session.get("usuario_liquidacion")).trigger('change');

     console.log(Session.get("usuario_liquidacion"))
   
  },400)
}
function setFechaInicio()
{

}
Template.liquidaciones.rendered=function(){
  var d=new Date();
  setFechas((d.getMonth()+1),d.getFullYear());
  setUsuarioMuestra();
  buscarLiquidaciones();
  
   $('.botonAccion').tooltip()
}
Template.liquidaciones.onCreated(function () {
  buscarUsuarios();
  Meteor.subscribe('settings.all');
})
Array.prototype.groupBy = function (groupingKeyFn) {
    if (typeof groupingKeyFn !== 'function') {
        throw new Error("groupBy take a function as only parameter");
    }
    return this.reduce((result, item) => {
        let key = groupingKeyFn(item);
        if (!result[key])
            result[key] = [];
        result[key].push(item);
        return result;
    }, {});
}
Template.modificarLiquidacion_factura.rendered=function(){
  cargarDataFactura(this.data)
}

var cargarDataFactura=function(data)
{
  var idAsoc=ObrasSociales.findOne({_id:data.idObraSocial}).id;
   var noms=Nomencladores.find({_id:data.idRangoNomenclador}).fetch();
  setOpcionesNomencladores(noms,data.idNomenclador);
}
var getImporteTotal=function(data)
{
  var sum=0;
  if(data instanceof Array)
  for(var i=0;i<data.length;i++){
    sum+=data[i].importe;
  } 
    return sum.formatMoney(2);
}
Template.accionesFiltroOs.helpers({
  "puedeInyectar":function(){
    return Meteor.user().profile.rol!="secretaria"
  },
})
Template.filtroOs.events({
"click .os":function(){
  console.log(this)
},
 // "click .btnObraSocial":function(ev,template)
 //  {
 //    console.log(template)
 //    //if(template) template.view.filter.set({'$eq': this.idObraSocial});
 //  },
 "click #syncServidor":function(){
    var idOs=this.idObraSocial;
    var idLiquidacion=Session.get("liquidacion")._id;
     swal({
      title: "Estas Seguro de inyectar esta liquidacion?",
      text: "Una vez realizada no podrás cambiar la información!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Si  !",
      closeOnConfirm: true
    }, function() {
     
       UIBlock.block('Sincronizando, aguarde un momento...');
        Meteor.call("remote.syncLiquidacion",idLiquidacion,idOs,function(res,err){
          UIBlock.unblock();
          if(!err){
            swal("Genial!","Se han sincronizado con el server de la asociacion!","success");
            //Liquidaciones.update({_id:data._id},{$set:{estado:"INYECTADO"}});
          }
          else swal("Ops",err,'error');
      })
      
    });
  },
 "click #btnImprimir":function()
  {
    var data=this;
     Modal.show("imprimirLiquidacion",function(){
      return data
    })
  },
})
Template.filtroOs.helpers({
  
  'settingsOs': function(){
        return {
           collection: Session.get('liquidacionGroup'),
           rowsPerPage: 7,
           class: "table table-sm",
           showColumnToggles:false, 
           showFilter:false,
           showRowCount:false,
           showNavigationRowsPerPage:false,
           showNavigation:"auto",
           fields: [
           {
              key: 'nroOrden',
              label: 'Orden',
              headerClass:"col-md-1",
              fn:function(value,obj){
var label="<span style='mouse:pointer' class='os'>"+obj.nombreOs+"<b>("+obj.cantidad+")</b></span> <br> <span class='importeOs'>$"+obj.importe+"</span>"
return new Spacebars.SafeString(label)
              }
            },
           
             
            {
              key:"accionesFiltroOs",
              headerClass:"col-md-1",
                label: '',
                tmpl: Template.accionesFiltroOs
              }
      
  
 ]
 };
    },
  puedeInyectar:function(){
    if(Meteor.user().profile.tipoUsuario=="secretaria")return false;
    // if(Session.get("liquidacion").estado=="CHECKEADO")return true;
    return true;
  },
color:function(){
if(this.tieneCambios)return "#204d74"
  },
total:function(){
  var sum=0;
  var facturas=Session.get('liquidacion')?Session.get('liquidacion').facturas:[];
  if(facturas)
  for(var i=0;i<facturas.length;i++)sum+=facturas[i]?facturas[i].importe:0;
  return sum.formatMoney(2);
},
obrasSociales: function() {
    return Session.get('liquidacionGroup');
  }
})
var setListadoOs=function()
{
  var facturas=Session.get('liquidacion')?Session.get('liquidacion').facturas:[];
    console.log("cambia os")
    var data=[];
    var sal=[];
    if(facturas) data = facturas.groupBy((item) => item?item.idObraSocial:"s/n");
  for (var k in data){
    if(data[k][0])
    if(data[k]) sal.push({importe:getImporteTotal(data[k]),cantidad:data[k].length, nombreOs: data[k][0].nombreOs,tieneCambios:(data[k].length>0?(data[k][0].importeNuevo?true:false):false), idObraSocial:data[k][0].idObraSocial}); 
  }
  console.log(sal)
  Session.set('liquidacionGroup',sal)
    
}
Template.liquidaciones_facturas.rendered=function () {
  //FILTROS//**********************
  this.filter = new ReactiveTable.Filter('filtroOs', ['idObraSocial']);

  // this.filterOtros = new ReactiveTable.Filter('filtroOtros', []);
  //********************************************
  
  //Meteor.subscribe('liquidaciones.one',idLiquidacion);
  Meteor.subscribe('obrasSociales.all');
   Meteor.subscribe('pacientes.all');
    Meteor.subscribe('nomencladores.all');
   setLiquidacion();

  
}
Template.nuevaLiquidacion_factura.rendered=function () {  setTimeout(function(){
     setValoresFormulario();
 }, 1000);
}


setLiquidacion=function()
{
  var idLiquidacion=Router.current().params._id;
  UIBlock.block('Buscando, aguarde un momento...');
       
  Meteor.call("liquidaciones.one",idLiquidacion,function(err,res){
   
    Session.set("liquidacion",res?res:null);
    setListadoOs();
    UIBlock.unblock();
})  
}
function getNomenclador(id,campo,arr)
{
  var data=Session.get("nomencladores");
 if(arr)data=arr;
  if(!campo)campo="idNomencladorAsociacion";
  if(data) for(var i=0;i<data.length;i++){
   if(data[i][campo]==id)return data[i]
  }
  
  return null;
}

function setOpcionesNomencladores(data,idSeleccion)
{
  var sal=[];
  var nomencladores=[];
  if(data){
    nomencladores=data.length>0?data[0].nomencladores:[];
    var rango=data.length>0?data[0]:null;
  }
 
  if(rango){
    $("#idRangoNomenclador").val(rango.idAsociacion); 
$("#rangoNomenclador").html("<b>NOMENCLADOR</b> "+rango.fechaDesde.getFecha());
$("#rangoNomenclador").attr("idRango",rango.idAsociacion);
  }
    else $("#idRangoNomenclador").val("");
  Session.set("nomencladores",nomencladores);
 
  $('#idNomenclador').empty();
  console.log(data)
  if(data) if(data.length==0)swal("Ops!","No hay nomencladores asociados a esa fecha de la consulta!.. por favor verifique la fecha de la consulta o bien llame a secretaria de la asociacion para consultar nomencladores..","warning")
  for(var i=0;i<nomencladores.length;i++){
      var lab=nomencladores[i].codigoNomenclador+" | "+nomencladores[i].nombreNomenclador;
      var seleccionado=idSeleccion==nomencladores[i].idNomencladorAsociacion?true:false;
      var auxOption=new Option(lab, nomencladores[i].idNomencladorAsociacion, seleccionado, seleccionado);
      
      $('#idNomenclador').append(auxOption)
    }
    $('#idNomenclador').trigger('change');
    // Append it to the select
    return sal;
}
var getNuevoImporte=function(){

  var nom=getNomenclador($("#idNomenclador").val());

  var coef=Number($("#coeficiente").val());
  var cantidad=Number($("#cantidad").val());
  var nuevoImporte=0;
  
  if(nom) {
    var aplica=(coef/100);
    nuevoImporte= (Number(nom.importe)*aplica)*cantidad;
  }
  return nuevoImporte;
}
var guardarPaciente=function()
{
  var data={idObraSocial:$("#idObraSocial").val(), nombrePaciente:$("#paciente").val(), fechaUpdate:new Date(),nroAfiliado:$("#nroAfiliado").val(),idUsuarioCambia:Meteor.user()._id };
  Meteor.call("pacientes.save",data,function(err,res){
    
  })
}
var getNomencladores=function(idObraSocial,fechaConsulta)
{
  var res=$('#idObraSocial').find(':selected');
  var idOs=idObraSocial?idObraSocial:($(res).val());
  var fechaDesde=fechaConsulta?fechaConsulta:new Date($("#fechaConsulta").val());

  var os=ObrasSociales.findOne({_id:idOs});

  if(os)return Nomencladores.find({idObraSocial:os.id,fechaDesde:{$lte:(fechaDesde)}},{ sort: { fechaDesde: -1 } }).fetch();
  return []
}
var setProxNroOrden=function()
{
  var res=$('#idObraSocial').find(':selected');
  var idOs=($(res).val());
  var os=ObrasSociales.findOne({_id:idOs});

  $("#nroOrden").val(getProxNroOrden(idOs))
}
Template.nuevaLiquidacion_factura.events({
"click #btnAceptarSetear":function(dat,arr){
Session.set("nuevaCarga",true);
},
"focusout #fechaConsulta":function(dat,arr){
var res=$('#idObraSocial').find(':selected');
  var idOs=($(res).val());
  var os=ObrasSociales.findOne({_id:idOs});
$('#idObraSocial').trigger('change');
  
  if(os){
     $("#nombreOs").val(os.nombreOs);
     setProxNroOrden();
     setOpcionesNomencladores(getNomencladores());
    $("#idNomenclador").val('').change();
    $("#idNomenclador").focus();
    $('#idNomenclador').select2('open');
  }
  
},
"click #rangoNomenclador":function(dat,arr){
  var id=$("#rangoNomenclador").attr("idRango");
  window.open("/nomencladores/"+id,'_blank');
},
"keyup #nroAfiliado":function(ev){
  var datos=Pacientes.findOne({idObraSocial:$("#idObraSocial").val(),nroAfiliado:$("#nroAfiliado").val() });
  if(datos){
    $("#paciente").val(datos.nombrePaciente)
    // $("#paciente").focus()
  }
},
"click #btnAceptar":function(dat,arr){
Session.set("nuevaCarga",false);
},
"change #idObraSocial":function(dat,arr){
 
  
  var res=$('#idObraSocial').find(':selected');
  var idOs=($(res).val());
  var os=ObrasSociales.findOne({_id:idOs});

  
  if(os){
     $("#nombreOs").val(os.nombreOs);
     setProxNroOrden();
     setOpcionesNomencladores(getNomencladores());
    $("#idNomenclador").val('').change();
    $("#idNomenclador").focus();
    $('#idNomenclador').select2('open');
  }
  
 
  
},
"focusout #paciente":function(ev){
  guardarPaciente()
},
"select2:select #idNomenclador":function(ev){
  var nom=getNomenclador($("#idNomenclador").val());
  if(nom) $("#nombreNomenclador").val(nom.codigoNomenclador+" | "+nom.nombreNomenclador);
  
  if(nom){
    importe=nom.importe;
    setTimeout(function(){ if(Session.get("nuevaCarga"))$("#btnAceptarSetear").focus(); else $("#nroAfiliado").focus() }, 500);
  }
  var nuevoImporte=getNuevoImporte();
  $("#importe").val(nuevoImporte);
  

},
"change #coeficiente":function(ev){
  var nuevoImporte=getNuevoImporte();
  $("#importe").val(nuevoImporte);
},
"change #cantidad":function(ev){
  var nuevoImporte=getNuevoImporte();
  $("#importe").val(nuevoImporte);
},
})
Template.accionesLiquidaciones_facturas.helpers({
"puedeCargar":function()
{
 if(Meteor.user().profile.rol=="administrador")return true;
  if(Session.get("liquidacion").estado=="PENDIENTE")return true;
  return false
}, 

})
Template.liquidaciones_facturas.helpers({
  "puedeFacturar":function()
{
  if(Meteor.user().profile.rol=="administrador")return true;
  if(Session.get("liquidacion").estado=="PENDIENTE")return true;
  return false
}, 
"puedeCargar":function()
{
  if(Meteor.user())
  if(Meteor.user().profile.rol=="administrador")return true;
  return false
},
"detalleLiquidacion":function(){
  if(Session.get("liquidacion")) return Session.get("liquidacion").detalle
},
  'settings': function(){

    var facturas=Session.get("liquidacion")?Session.get("liquidacion").facturas:[];
        return {
           collection: facturas,
           rowsPerPage: 10,
           class: "table table-sm",
           filters: ['filtroOs',"filtroOtros"],
           showColumnToggles:false, 
           showFilter:false,
           showRowCount:false,
           showNavigationRowsPerPage:false,
           showNavigation:"auto",
           fields: [
           {
              key: 'nroOrden',
              label: 'Orden',
              headerClass:"col-md-1",
              fn:function(value,obj){return Number(value)}
            },
           {
              key: 'fechaConsulta',
             label:"Fecha",
             // headerClass:"col-md-2",
              fn: function (value, object, key) {
                var fechaDesdeNuevo=Nomencladores.findOne({_id:object.idRangoNomenclador})?Nomencladores.findOne({_id:object.idRangoNomenclador}).fechaDesde.getFecha():"";
                var fechaDesde=object.idRangoNomencladorNuevo?(Nomencladores.findOne({_id:object.idRangoNomencladorNuevo}).fechaDesde.getFecha()):"";
                var nom=' <span id="rangoNomenclador" title="Fecha desde NOMENCLADOR" style="cursor:pointer;" idRango="'+object.idRangoNomenclador+'" class="label label-primary">'+fechaDesde+'</span>';
                var nomNuevo=' <span id="rangoNomenclador" title="Fecha desde NOMENCLADOR NUEVO" style="cursor:pointer;" idRango="'+object.idRangoNomencladorNuevo+'" class="label label-warning">'+fechaDesdeNuevo+'</span>';
                var nomFinal=object.idRangoNomencladorNuevo?nomNuevo:nom;
               if(value)  return new Spacebars.SafeString(value.getFecha()+nomFinal)
                 return "-"
               },
            },
            {
              key: 'paciente',
              label: 'Paciente',

              fn: function (value, object, key) {
               if(value)  return object.paciente+" ("+object.nroAfiliado+")";
                 return "-"
               },
            },
             
            {
              key: 'nombreNomenclador',
              label: 'Nomenclador',
              headerClass:"col-md-1",
              fn:function(val,obj){
                var arr=val.split("|");
                return new Spacebars.SafeString("<span title='"+arr[1]+"'>"+arr[0]+"</span>")

              }
              
            },
            {
              key: 'coeficiente',
              label: 'Coef.',
               fn: function (value, object, key) {
                return new Spacebars.SafeString("<small>"+object.cantidad+" al "+object.coeficiente+" % </small>");
               }
              
            },
            {
              key: 'importe',
              label: '$ ',
              headerClass:"col-md-1",
              fn:function(val,obj){
                var importe=val;
                var color="";
                var importeViejo="";
                if(obj.importeNuevo){
                  importeViejo="<small><small style='color:red'>"+obj.importeNuevo.formatMoney(2)+"</small></small>";
                  color="red";
                }
                return new Spacebars.SafeString(importeViejo+"<span style='float:right;'>"+importe.formatMoney(2)+"</span>");
              }
            },
             
            {
              key:"accionesFacturas",
              headerClass:"col-md-2",
                label: '',
                tmpl: Template.accionesLiquidaciones_facturas
              }
      
  
 ]
 };
    }

})

var getUsuario=function(id,obj){
  var usuarios=Session.get("usuarios");
  if(usuarios)
  for(var i=0;i<usuarios.length;i++)
    if(usuarios[i]._id==id)return obj?usuarios[i]:usuarios[i].profile.nombres;
  
  return id
}
Template.accionesLiquidaciones.helpers({
  "puedeCargar":function(){
    if(Meteor.user().profile.rol=="administrador")return true;
    if(Meteor.user().profile.rol!="secretaria") return true;
return this.estado=="PENDIENTE"
},
 "puedeInyectar":function(){
  if(Meteor.user().profile.rol=="secretaria") return false;
  if(this.estado=="ENVIADO")return true;
    return this.estado=="CHECKEADO";
},
"puedeEnviar":function(){
    return this.estado=="PENDIENTE";
},
 "puedeCambiarEstado":function(){
  if(Meteor.user().profile.rol!="secretaria") return true;
return this.estado=="PENDIENTE"
},
  })
Template.liquidaciones.helpers({

 
  'settings': function(){
        return {
 collection: Session.get("liquidaciones"),
 rowsPerPage: 100,
 class: "table table-hover table-condensed",
 showFilter: false,
 fields: [
 {
        key: 'nroLiquidacion',
       label:"Nro",
        fn: function (value, object, key) {
         if(value)  return value.lpad("0",5);
           return "-"
         },
      },
     {
        key: 'fecha',
       label:"Fecha",
        fn: function (value, object, key) {
         if(value)  return moment(value).format("DD/MM/YYYY");
           return "-"
         },
      },
      {
        key: 'detalle',
        label: 'Detalle',
        fn:function(valor,ob){
          return new Spacebars.SafeString("<h6 style='color:blue'><b><span data-toggle='tooltip'  data-html='true' title='Modulo de <b>Facturas</b> cargadas en esta liquidacion' idLiquidacion='"+ob._id+"' class='detalleClick' style='cursor:pointer;'>"+ob.detalle+"</span></b></h6>")
        }
      },
      {
        key: 'estado',
        label: 'Estado',
        fn:function(valor,ob){
          var color="label label-warning";
          if(ob.estado=="PROCESANDO")color="label label-info";
          if(ob.estado=="CHECKEADO")color="label label-primary";
          if(ob.estado=="ENVIADO")color="label label-success";
          
          return new Spacebars.SafeString("<span  class='"+color+"' style=''>"+ob.estado+"</span>")
        }
      },
       {
        key: 'idUsuario',
        label: 'Usuario',
        // hidden:function(ob){
        //   if(Meteor.user())
        //   if(Meteor.user().profile.rol=="secretaria")return false;
        //   return true;
        // },
        key:"accionesLiquidaciones",
        fn:function(val,ob){
          return getUsuario(ob.idUsuario)
        
      }
    },
      {
        key: 'importe',
        label: '$ Importe',
        fn:function(val,obj){
          var sum=0;
          if(obj.facturas)
          for(var i=0;i<obj.facturas.length;i++)sum+=obj.facturas[i]?obj.facturas[i].importe:0;
            return sum.formatMoney(2)
        }
      },
       
      {
          label: '',
         // headerClass: 'col-md-1',
          tmpl: Template.accionesLiquidaciones
        }
      
  
 ]
 };
    }

})
var getProxNroOrden=function(idObraSocial)
{
  var prox=0;
  var facturas=[];
  if(Session.get("liquidacion").facturas)facturas=Session.get("liquidacion").facturas;
  for(var i=0;i<facturas.length;i++)
    if(facturas[i].nroOrden)
      if(Number(facturas[i].nroOrden)>prox && facturas[i].idObraSocial==idObraSocial)
      prox=Number(facturas[i].nroOrden)?facturas[i].nroOrden:0;
  if(Session.get("nuevaCarga") && Session.get("dataUltimaCarga")) return Number(prox);
 
  return Number(prox)+1
}
var setValoresFormulario=function()
{
  $("#cantidad").val(1);
   
  if(Session.get("nuevaCarga") && Session.get("dataUltimaCarga")){
    var fecha=Session.get("dataUltimaCarga").fechaConsulta.toISOString().substr(0, 10);
    $("#fechaConsulta").val(fecha);
    $("#idObraSocial").val(Session.get("dataUltimaCarga").idObraSocial);
   
    $("#nroAfiliado").val(Session.get("dataUltimaCarga").nroAfiliado);
    $("#paciente").val(Session.get("dataUltimaCarga").paciente);
    $("#coeficiente").val(Session.get("dataUltimaCarga").coeficiente);
    $("#cantidad").val(Session.get("dataUltimaCarga").cantidad);

    // $("#idNomenclador").focus(); 
    // $('#idNomenclador').select2('open');
    $('#idObraSocial').trigger('change');
}else{
  $("#cantidad").val("1");
  $("#coeficiente").val("100");
  if(Session.get("dataUltimaCarga"))$("#idObraSocial").val(Session.get("dataUltimaCarga").idObraSocial);

  $("#fechaConsulta").focus();
}

 

}
Template.nuevaLiquidacion_factura.helpers({

PacientesIndex: function() {
    return new Index({
  collection: Pacientes,
  fields: ['nombrePaciente',"_id","idObraSocial"],
  engine: new MinimongoEngine(),
})
  },
Liquidaciones:function()
{
  return Liquidaciones;
},
doc:function()
{
  return this;
},
 obrasSociales: function () {
    return ObrasSociales.find().map(function (c) {
      return {label: c.nombreOs, value: c._id};
    });
  },
  nomencladores: function () {
    return Nomencladores.find().map(function (c) {
      return {label: c.nombreNomenclador, value: c._id};
    });
  }
});

var buscarIndice=function(busca)
{
  var arr=Session.get("liquidacion").facturas;
  for (var i = 0; i < arr.length; i++)
    if(arr[i]._id==busca)return i;
  return -1;
}
Template.modificarLiquidacion_factura.events({
"change #idObraSocial":function(dat,arr){
  var res=$('#idObraSocial').find(':selected');
  var idOs=($(res).val());
  var os=ObrasSociales.findOne({_id:idOs});
  $("#nombreOs").val(os.nombreOs);

  setOpcionesNomencladores(getNomencladores());
  $("#idNomenclador").focus();
  $('#idNomenclador').select2('open');
},
"click #rangoNomenclador":function(dat,arr){
  console.log(this)
  var id=$("#rangoNomenclador").attr("idRango");
  window.open("/nomencladores/"+id,'_blank');
},
"change #idNomenclador":function(ev){
  var nom=getNomenclador($("#idNomenclador").val());
  if(nom) $("#nombreNomenclador").val(nom.codigoNomenclador+" | "+nom.nombreNomenclador);
  var nuevoImporte=getNuevoImporte();
  $("#importe").val(nuevoImporte);
  $("#nroAfiliado").focus();
},
"change #coeficiente":function(ev){
  var nuevoImporte=getNuevoImporte();
  $("#importe").val(nuevoImporte);
},
"change #cantidad":function(ev){
  var nuevoImporte=getNuevoImporte();
  $("#importe").val(nuevoImporte);
},


})

Template.modificarLiquidacion_factura.helpers({
doc:function()
{
  var doc=Session.get("liquidacion");

  return doc
},
Liquidaciones:function()
{
  return Liquidaciones;
},
esAdmin:function()
{
  if(Meteor.user().profile.rol=="administrador")return true;
  return false;
},
obrasSociales: function () {
  console.log(this)
    return ObrasSociales.find().map(function (c) {
      return {label: c.nombreOs, value: c._id};
    });
  },
  nomencladores: function () {
    var idAsoc=ObrasSociales.findOne({_id:this.idObraSocial}).id;
    var noms=Nomencladores.findOne({idObraSocial:idAsoc,fechaDesde:{$lte:(this.fechaConsulta)}},{ sort: { fechaDesde: -1 } });
    return noms.nomencladores.map(function (c) {
      return {label: c.nombreNomenclador, value: c._id};
    });
  },
 eti_fechaConsulta: function () {
  var idSeleccion=this._id;
    var ind=buscarIndice(idSeleccion);
  var indice= 'facturas.'+ind+'.fechaConsulta';
  return indice;
  },
  eti_scope: function () {
  var idSeleccion=this._id;
    var ind=buscarIndice(idSeleccion);
  var indice= 'facturas.'+ind+'.';
  return indice;
  },
  eti_paciente: function () {
  var idSeleccion=this._id;
    var ind=buscarIndice(idSeleccion);
  return'facturas.'+ind+'.paciente';
  },
  eti_nroAfiliado: function () {
  var idSeleccion=this._id;
    var ind=buscarIndice(idSeleccion);
  return'facturas.'+ind+'.nroAfiliado';
  },
  eti_nroOrden: function () {
  var idSeleccion=this._id;
    var ind=buscarIndice(idSeleccion);
  return'facturas.'+ind+'.nroOrden';
  },
  
  eti_idObraSocial: function () {
  var idSeleccion=this._id;
    var ind=buscarIndice(idSeleccion);
  return'facturas.'+ind+'.idObraSocial';
  },
  eti_idRangoNomenclador: function () {
  var idSeleccion=this._id;
    var ind=buscarIndice(idSeleccion);
  return'facturas.'+ind+'.idRangoNomenclador';
  },
  eti_idNomenclador: function () {
  var idSeleccion=this._id;
    var ind=buscarIndice(idSeleccion);
  return'facturas.'+ind+'.idNomenclador';
  },
  eti_al50: function () {
  var idSeleccion=this._id;
    var ind=buscarIndice(idSeleccion);
  return'facturas.'+ind+'.al50';
  },
  eti_al75: function () {
  var idSeleccion=this._id;
    var ind=buscarIndice(idSeleccion);
  return'facturas.'+ind+'.al75';
  },
  eti_nombreOs: function () {
  var idSeleccion=this._id;
    var ind=buscarIndice(idSeleccion);
  return'facturas.'+ind+'.nombreOs';
  },
  eti_coeficiente: function () {
  var idSeleccion=this._id;
    var ind=buscarIndice(idSeleccion);
  return'facturas.'+ind+'.coeficiente';
  },
  eti_cantidad: function () {
  var idSeleccion=this._id;
    var ind=buscarIndice(idSeleccion);
  return'facturas.'+ind+'.cantidad';
  },
  eti_nombreNomenclador: function () {
  var idSeleccion=this._id;
    var ind=buscarIndice(idSeleccion);
  return'facturas.'+ind+'.nombreNomenclador';
  },
  eti_esImporteFijo: function () {
  var idSeleccion=this._id;
    var ind=buscarIndice(idSeleccion);
  return'facturas.'+ind+'.esImporteFijo';
  },
  eti_importe: function () {
  var idSeleccion=this._id;
    var ind=buscarIndice(idSeleccion);
  return'facturas.'+ind+'.importe';
  },
 
  
});
Template.nomencladoresModificados.events({
"click #btnGuardar":function(){
  swal({
      title: "Estas Seguro de guardar?",
      text: "Una vez realizadolos cambios seran permanente!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Si, guarda!",
      closeOnConfirm: true
    }, function() {
      UIBlock.block('Aguarde un momento...');
     Meteor.call("liquidaciones.guardar",Session.get("liquidacion")._id,Session.get("nomencladoresModificados"),function(err,res){
      UIBlock.unblock();
      setLiquidacion();
      swal("genial!","se han guardado los datos!","success")  
     })
    });
    
}
})
Template.nomencladoresModificados.helpers({
  'settings': function(){
        return {
           collection: Session.get('nomencladoresModificados'),
           rowsPerPage: 10,
           class: "table table-sm",
           showColumnToggles:false, 
           showFilter:false,
           showRowCount:false,
           showNavigationRowsPerPage:false,
           showNavigation:"auto",
           fields: [
           {
              key: 'nombreOs',
              label: 'Obra Social',
              headerClass:"col-md-1",
              fn:function(value,obj){
              
                if(value)
                return new Spacebars.SafeString(value)
              }
            },
            {
              key: 'fechaConsulta',
              label: 'Fecha',
              headerClass:"col-md-1",
              fn:function(value,obj){
                if(value)
                return new Spacebars.SafeString(value.getFecha())
              }
            },
            {
              key: 'paciente',
              label: 'Paciente',
              headerClass:"col-md-1",
              fn:function(value,obj){
                if(value)
                return new Spacebars.SafeString(value)
              }
            },
            {
              key: 'importe',
              label: '$ Importe',
              headerClass:"col-md-1",
              fn:function(value,obj){
                console.log(value)
                if(value)
                return new Spacebars.SafeString(value)
              }
            },
            {
              key: 'importeNuevo',
              label: '$ Nuevo',
              headerClass:"col-md-1",
              fn:function(value,obj){
                if(value)
                return new Spacebars.SafeString(value)
              else return "-"
              }
            },
           
             
         
      
  
 ]
 };
    }
})
Template.liquidaciones_facturas.events({
  "click #btnImprimir":function()
  {
    var data=this;
     Modal.show("imprimirLiquidacion",function(){
      return data
    })
  },
  "click #syncServidor":function(){
    var idOs=this.idObraSocial;
    var idLiquidacion=Session.get("liquidacion")._id;
     swal({
      title: "Estas Seguro de inyectar esta liquidacion?",
      text: "Una vez realizada no podrás cambiar la información!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Si  !",
      closeOnConfirm: true
    }, function() {
     
       UIBlock.block('Sincronizando, aguarde un momento...');
        Meteor.call("remote.syncLiquidacion",idLiquidacion,idOs,function(res,err){
          UIBlock.unblock();
          if(!err){
            swal("Genial!","Se han sincronizado con el server de la asociacion!","success");
            //Liquidaciones.update({_id:data._id},{$set:{estado:"INYECTADO"}});
          }
          else swal("Ops",err,'error');
      })
      
    });
  },
  "click #btnGuardar":function()
  {
    swal({
      title: "Estas Seguro de guardar?",
      text: "Una vez realizadolos cambios seran permanente!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Si, guarda!",
      closeOnConfirm: true
    }, function() {
     Meteor.call("liquidaciones.guardar",Session.get("liquidacion")._id,Session.get("liquidacion").facturas,function(err,res){
      swal("genial!","se han guardado los datos!","success")  
     })
    });
  },
  "click #rangoNomenclador":function(ev){
    var idRango=$(ev.target).attr("idrango")
  window.open("/nomencladores/"+idRango,'_blank');
},
   "click #btnCheck":function()
  {
    UIBlock.block('Aguarde un momento...');
   Meteor.call("checkImportes",Session.get("liquidacion")._id,function(err,res){
    UIBlock.unblock();
    console.log(res)
Session.set("nomencladoresModificados",res);
Modal.show("nomencladoresModificados",function(){ return res; })
      // if(res.length>0)Modal.show("nomencladoresModificados",function(){
      //   return res;
      // }) else swal("Bien!","No hay modificaciones sobre nomencladores!")
    })
 
   
  },
   "click .btnObraSocial":function(ev,template)
  {
   template.filter.set({'$eq': this.idObraSocial});
   $(".btnObraSocial").removeClass("active");
   var input = $(event.target).addClass("active");
  },
  // "autocompleteselect #filtroOs": function (event, template, doc) {
  //     var input = $(event.target).val();
  //    template.filter.set(doc._id);
      
  //  },
  //  "keypress #filtroOs": function (event, template, doc) {
  //    if(event.originalEvent.code=="Enter"){
  //      var input = $(event.target).val();
  //     template.filter.set();
  //    }
      
  //  },
  "click #btnconsulta":function(){
    setLiquidacion();
  },
'mouseover tr': function(ev) {
    $("#tabla").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();

  },
  "click #btnAgregar":function(){
   var data=Session.get("liquidacion");
   Session.set("nuevaCarga",false);
    Modal.show("nuevaLiquidacion_factura",function(){
      return data
    })
  },
  "click #modificar":function(){
   var data=this;
    Modal.show("modificarLiquidacion_factura",function(){
      return data
    })
  },
  'click #delete': function(ev) {
    var id = this._id;
    var idLiquidacion=Session.get("liquidacion")._id;
    swal({
      title: "Estas Seguro de quitar?",
      text: "Una vez que lo has quitado sera permanente!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Si, borralo!",
      closeOnConfirm: true
    }, function() {
     Meteor.call("liquidaciones_factura.remove",idLiquidacion,id,function(err,res){
      setLiquidacion(); 
      if(!err)swal("Bien!","Se ha eliminado el registro ","success")
      else swal("Ops..","hay un problema con la carga del nuevo usuario: "+err.message,"error")
    });
      
      
    });

  },

})
Template.nuevaLiquidacion.helpers({
  "idUsuario":function(){
    return Meteor.user()._id;
  },
  Liquidaciones:function()
{
  return Liquidaciones;
},
  "nroLiquidacion":function(){
    return Settings.findOne({clave:"proxNroLiquidacion"}).valor;
  }
});
Template.modificarLiquidaciones.rendered=function(){

}
Template.modificarLiquidaciones.helpers({
  "idUsuario":function(){
    return Meteor.user()._id;
  },
  esAdmin:function()
{
  if(Meteor.user().profile.rol=="administrador")return true;
  return false;
},
})

Template.resumenOs.helpers({
"importe":function()
{
  return this.importe.formatMoney(2)
},
"nomenclador":function()
{
  return this.nombreNomenclador.substring(0,55)+"..."
},
"detalle":function()
{
  return Session.get("liquidacion").detalle;
},
"paciente":function()
{
  return this.paciente+" ("+this.nroAfiliado+")"
},
"fechaConsulta":function()
{
  return this.fechaConsulta.getFecha()
},
"coef":function()
{
  return this.cantidad+" al "+this.coeficiente+" %"
},
"importeTotal":function(){
  var total=0;
  for(var i=0;i<this.facturas.length;i++ ) 
    total+=this.facturas[i].importe;
  
  return total.formatMoney(2)
},
})
Template.imprimirLiquidacion.events({
"click #btnImprimirLiq":function(){
  import printJS from 'print-js'
  printJS({
    printable: 'printable',
    type: 'html',
    targetStyles: ['*']
 })
}
})
var getFacturasOs=function(arr,idOs)
{
  var sal=[];
    for(var i=0;i<arr.length;i++)
     if(arr[i].idObraSocial==idOs)sal.push(arr[i]);
     return sal;
   
  return sal;
}
Template.imprimirLiquidacion.helpers({
"fecha":function(){
  return Session.get("liquidacion").fecha.getFecha()
},
"nroLiquidacion":function(){
  return Session.get("liquidacion").nroLiquidacion.lpad("0",5)
},
"detalle":function(){
  return Session.get("liquidacion").detalle
},
"profesional":function(){
  
  Meteor.call("users.perfil",Session.get("liquidacion").idUsuario,function(err,res){
    Session.set("usuarioLiquidacion",res);
  })
  if(Session.get("usuarioLiquidacion"))return Session.get("usuarioLiquidacion").profesional;
  return '-'
},

"obrasSociales":function(){
  var data=[];
  var sal=[];
  var facturas=getFacturasOs(Session.get("liquidacion").facturas,this.idObraSocial).sort(function(a, b){
  return Number(a.nroOrden) == Number(b.nroOrden) ? 0 : +(Number(a.nroOrden) > Number(b.nroOrden)) || -1;
});
  console.log(facturas)
  var idObraSocial=this.idObraSocial;
  sal.push({facturas:facturas,importe:getImporteTotal(facturas),cantidad:facturas.length, nombreOs: facturas[0].nombreOs, idObraSocial:facturas[0].idObraSocial}); 

  return sal;
}
})
Template.imprimirGral.events({
"click #btnImprimirLiq":function(){
  import printJS from 'print-js'
  printJS({
    printable: 'printable',
    type: 'html',
    targetStyles: ['*']
 })
}
})
var _getImporte=function(arr)
{
  var sum=0;
  for(var i=0;i<arr.length;i++)sum+=arr[i].importe;
    return sum;
}
Template.imprimirGral.helpers({
"fecha":function(){
  return Session.get("liquidacion").fecha.getFecha()
},
"importe":function()
{
  return this.importe.formatMoney(2)
},
"nroLiquidacion":function(){
  return Session.get("liquidacion").nroLiquidacion.lpad("0",5)
},
"detalle":function(){
  return Session.get("liquidacion").detalle
},
"profesional":function(){
  
  Meteor.call("users.perfil",Session.get("liquidacion").idUsuario,function(err,res){
    Session.set("usuarioLiquidacion",res);
  })
  if(Session.get("usuarioLiquidacion"))return Session.get("usuarioLiquidacion").profesional;
  return '-'
},
"importeTotal":function()
{
  var sum=0;
  var arr= this.facturas;
  for (var i=0;i<arr.length;i++)sum+=arr[i].importe;
  return sum.formatMoney(2) 
},
"obrasSociales":function(){
  var data=[];
  var sal=[];
  var arr= this.facturas.groupBy((item) => item.idObraSocial);

  for (var idOs in arr) sal.push({idObraSocial:idOs,nombreOs:(arr[idOs].length>0?arr[idOs][0].nombreOs:"-"),tieneCambios:(arr[idOs].length>0?(arr[idOs][0].importeNuevo?true:false):false),cantidad:arr[idOs].length,importe:_getImporte(arr[idOs])})
    console.log(sal)
  return sal;
}
})
Template.liquidaciones.events({
  "keyup #fechaDesde":function(){
    console.log($("#fechaDesde").val())
    Session.set("fechaDesde_liquidacion",$("#fechaDesde").val());
  },
  "keyup #fechaHasta":function(){
    Session.set("fechaHasta_liquidacion",$("#fechaHasta").val());
  },
  "change #usuario":function(){
    if($("#usuario").val()) Session.set("usuario_liquidacion",$("#usuario").val());
    console.log( Session.get("usuario_liquidacion"))
  },
    'click #btnAyuda': function(ev) {
   Modal.show("ayudaLiquidacion",function(){ })

  },
  "click #btnBuscar":function(){
    buscarLiquidaciones()
  },
  "click #syncServidor":function(){
    var data=this;
     swal({
      title: "Estas Seguro de inyectar esta liquidacion?",
      text: "Una vez realizada no podrás cambiar la información!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Si  !",
      closeOnConfirm: true
    }, function() {
     
       UIBlock.block('Sincronizando, aguarde un momento...');
        Meteor.call("remote.syncLiquidacion",data,function(res,err){
          UIBlock.unblock();
          if(!err){
            swal("Genial!","Se han sincronizado con el server de la asociacion!","success");
            //Liquidaciones.update({_id:data._id},{$set:{estado:"INYECTADO"}});
          }
          else swal("Ops",err,'error');
      })
      
    });
  },
  "click #enviar":function()
  {
    var data=this;
     swal({
      title: "Estas Seguro de enviar la liquidacion?",
      text: "Una vez realizada no podrás cambiar la información!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Si, enviar!",
      closeOnConfirm: true
    }, function() {
     Liquidaciones.update({_id:data._id},{$set:{estado:"PROCESANDO"}});
      
      
    });
  },
  
  'mouseover tr': function(ev) {
    $("#tabla").find(".acciones").hide();
    $(ev.currentTarget).find(".acciones").show();

  },
  "click #btnImprimir":function(){
   var data=this;

    Modal.show("imprimirGral",function(){
      return data
    })
  },
  "click #btnAgregar":function(){
   var data=this;

    Modal.show("nuevaLiquidacion",function(){
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
     Meteor.call("liquidaciones.remove",id,function(err,res){
      if(!err){
        swal("Bien!","Se ha eliminado el registro ","success");
        buscarLiquidaciones()
      }
      else swal("Ops..","hay un problema con la carga del nuevo usuario: "+err.message,"error")
    });
      
      
    });

  },
   'click #modificar': function(ev) {
    var data=this;
    Modal.show("modificarLiquidaciones",function(){
      return data
    })

  },

  'click #facturas': function(ev) {
    Router.go('/liquidaciones_facturas/'+this._id);
  },
  'click .detalleClick': function(ev,dat) {
   Router.go('/liquidaciones_facturas/'+$(ev.currentTarget).attr("idLiquidacion"));
  },
});
