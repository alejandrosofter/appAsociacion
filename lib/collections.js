// import SimpleSchema from 'simpl-schema';
import { Random } from 'meteor/random'

// SimpleSchema.extendOptions(['autoform']);

Medicamentos = new Mongo.Collection('medicamentos');
Recetas = new Mongo.Collection('recetas');
Settings = new Mongo.Collection('settings');
Liquidaciones = new Mongo.Collection('liquidaciones');
Nomencladores = new Mongo.Collection('nomencladores');
ObrasSociales = new Mongo.Collection('obrasSociales');
Pacientes = new Mongo.Collection('pacientes');
ArchivosExcel = new Mongo.Collection('archivosExcel');
Estudios = new Mongo.Collection('estudios');
ConexionObraSocial = new Mongo.Collection('conexionObraSocial');
LoginObraSocial = new Mongo.Collection('loginObraSocial');

Archivos = new FS.Collection("archivos", {
  stores: [new FS.Store.FileSystem("archivos", {path: "/var/www/uploads"})]
});

Archivos.allow({
 insert: function(){
 return true;
 },
 update: function(){
 return true;
 },
 remove: function(){
 return true;
 },
 download: function(){
 return true;
 }
});

Recetas.attachSchema(new SimpleSchema({
  
   idPaciente:{
        type: String,
        label: 'Paciente',
        autoform: {
            type: 'select2',
             style: "width:550px",
            afFieldInput: {
                select2Options: {
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
        }
    },
  fecha: {
    type: Date,
    label: 'Fecha',
    autoform:{style:"width:160px" }
  },
   idUsuario: {
    type: String,
    label: 'Usuario',
    autoValue: function() {
      return Meteor.user()._id;   
    }
  },
  medicamentos:{
     type: Array,
    optional:true,
    label:"Medicamentos"
  },
  "medicamentos.$":{
    type:Object,
  },
  "medicamentos.$._id":{

    type: String,
    optional:true,
    autoValue: function() {
      return Random.id();   
    },
    autoform: {type:"hidden" },
 
  },
  "medicamentos.$.idMedicamento": {
    type: String,
    optional: false,
    autoform: {
       type: "select2",
       class:"medicamento",
       options: function () {
        return _.map(Medicamentos.find().fetch(), function (c, i) {
          return {label: c.nombreComercial+" ("+c.nombreGenerico+") "+c.presentacion, value: c._id};
        })},
        style: "width:450px;",
      },
    label:"Medicamento"
  },
//   "medicamentos.$.idPresentacion": {
//     type: String,
//     optional: true,
//     autoform: {
//        type: "select2",
//        options: function (e) {
// var nro=this.name.split(".")[1];
       
//           var lab="medicamentos."+nro+".idMedicamento";
//           var labPres="medicamentos."+nro+".idPresentacion";
//           $("select[name='"+labPres+"']").empty().trigger("change");
//            $("select[name='"+labPres+"']").val(null).trigger('change');
//           var selector=document.getElementsByName(lab);

//         var idMedicamento=$(selector).val();
//         var medicamento=Medicamentos.findOne({_id:idMedicamento});
//         console.log(selector,nro,medicamento)
//       },
//         style: "width:100%",
//       },
//     label:"Presentacion"
//   },
  "medicamentos.$.cantidad": {
    type: Number,
    optional: false,
      autoform: { style:"width:80px"},
    label:"Cant."
  },
  
}))
Medicamentos.attachSchema(new SimpleSchema({
  
  nombreComercial: {
    type: String,
    label: 'Nombre Comercial',
    autoform:{ }
  },
  nombreGenerico: {
    type: String,
    label: 'Nombre Generico',
    autoform:{ }
  },
  presentacion: {
    type: String,
    label: 'Presentación',
    autoform:{
    style: "width:100px",
     }
  },
   idUsuario: {
    type: String,
    label: 'Usuario',
    autoValue: function() {
      return Meteor.user()._id;   
    }
  },
  //  presentaciones:{
  //    type: Array,
  //   optional:true,
  //   label:"Presentaciones"
  // },
  // "presentaciones.$":{
  //   type:Object,
  // },
  // "presentaciones.$._id":{

  //   type: String,
  //   optional:true,
  //   autoValue: function() {
  //     return Random.id();   
  //   },
  //   autoform: {type:"hidden" },
 
  // },
  // "presentaciones.$.cantidad": {
  //   type: String,
  //   optional: true,
  //     autoform: {
  //     style:"width:120px" },
  //   label:"Cantidad + (unidad de medida)"
  // }
}))
LoginObraSocial.attachSchema(new SimpleSchema({
  
  idUsuario: {
    type: String,
    label: 'Usuario de la conexion',
    autoform:{
      type:"hidden"
    }
  },
  usuario: {
    type: String,
    label: 'Usuario',
  },
  clave: {
    type: String,
    label: 'Clave',
  },
  checkPorDni: {
    type: Boolean,
    label: 'Chequea por DNI',
    autoform: {
       type: "boolean-checkbox"
     }
  },
  checkPorAfiliado: {
    type: Boolean,
    label: 'Chequea por nro Afiliado',
    autoform: {
       type: "boolean-checkbox"
     }
  },
  idConexionOs: {
    type: String,
    label: 'CONEXIÓN Obra Social',
    autoform: {
       type: "select2",
       options: function () {
        return _.map(ConexionObraSocial.find().fetch(), function (c, i) {
          var os=ObrasSociales.findOne({_id:c.idObraSocial});
          if(os) return {label: os.nombreOs, value: c._id};
        })},
        style: "width:450px",
      },
  }
}))
ConexionObraSocial.attachSchema(new SimpleSchema({
  
  
  urlLogin: {
    type: String,
    label: 'URL Login',
  },
  idObraSocial: {
    type: String,
    label: 'Obra Social',
    autoform: {
       type: "select2",
       options: function () {
        return _.map(ObrasSociales.find().fetch(), function (c, i) {
          return {label: c.nombreOs, value: c._id};
        })},
        style: "width:250px",
      },
  },
   selectorResultado: {
    type: String,
    label: 'Selector Resultado',
  },
  resultadoPositivo: {
    type: String,
    label: 'Resultado Positivo',
  },
  

}))

Estudios.attachSchema(new SimpleSchema({
  
  
  fecha: {
    type: Date,
    label: 'Fecha',
  },
  diagnostico: {
    type: String,
    label: 'Diagnostico',
  },
   idUsuario: {
    type: String,
    label: 'USUARIO',
    optional:true,
    // autoform: {
    //     type:"hidden"
    //   },
  },

  idPaciente:{
        type: String,
        label: 'Paciente',
        autoform: {
            type: 'select2',
             style: "width:550px",
            afFieldInput: {
                select2Options: {
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
        }
    },
  idNomenclador: {
    type: String,
    label: 'Nomenclador',
    optional:true,
    autoform: {
       type: "select2",
       // options: function () {
       //  return _.map(Nomencladores.find().fetch(), function (c, i) {
       //    return {label: ("desde "+c.fechaDesde.getFecha()+" hasta "+c.fechaHasta.getFecha()), value: c._id};
       //  })},
        style: "width:550px",
      },
  },
  estado: {
    type: String,
    label: 'Estado',
    optional:true,
    autoform: {
     defaultValue:"PENDIENTE",
         type:"select-radio-inline",
         trueLabel:"Yes", falseLabel:"No",
      options: [
        {label: "PENDIENTE", value: "PENDIENTE"},
         {label: "CANCELADA", value: "CANCELADA"},
      ]
    }
  },
   practicas:{
     type: Array,
    optional:true,
    label:"Practicas"
  },
    
  "practicas.$":{
    type:Object,
  },
  "practicas.$.fecha": {
    type: Date,
    optional: true,
      autoform: {
         style: "width:150px",
      },
    label:"Fecha"
  },
   "practicas.$._id":{

    type: String,
    optional:true,
      // autoform: {
      //   type:"hidden"
      // },
    autoValue: function() {
      return Random.id();   
    }
 
  },

   "practicas.$.nro": {
    type: Number,
    optional: true,
     autoform: {
        // type:"hidden",
        placeholder:"Nro",
         style: "width:80px",
      },
   
    label:"Nro Consulta"
  },
  "practicas.$.cantidad": {
    type: Number,
    optional: false,
    autoform: {
         style: "width:70px",
         placeholder:"Cantidad",
      },
    label:"Cantidad"
  },
  "practicas.$.idItemLiquidacion": {
    type: String,
    optional: true,
    label:"ITEM EN LIquidacion"
  },
  "practicas.$.practica": {
    type: String,
    optional: true,
    autoform: {
       type: "select2",
       placeholder:"Practica",
       // options: function () {
       //  var idOs=Session.get("idPacienteSeleccion")?Session.get("idPacienteSeleccion"):null;
       //  var data=Nomencladores.findOne({idOs});
       //  var items=[];
       //  if(data)items=data.nomencladores;
       //  return _.map(items, function (c, i) {
       //    return {label: c.nombreNomenclador, value: c._id};
       //  })},
        style: "width:500px",
      },
    label:"Practica"
  },
  "practicas.$.estado": {
    type: String,
    optional: true,
    label:"Estado",
    autoform: {
      placeholder:"Estado",
     defaultValue:"PENDIENTE",
         type:"select-radio-inline",
         trueLabel:"Yes", falseLabel:"No",
      options: [
        {label: "PENDIENTE", value: "PENDIENTE"},
        {label: "APROBADA", value: "APROBADA"},
         {label: "DENEGADA", value: "DENEGADA"},
      ]
    }
  },
  
  

}))
ArchivosExcel.attachSchema(new SimpleSchema({
  
  
  fechaActualiza: {
    type: Date,
    label: 'Fecha Update',
  },
  nombreArchivo: {
    type: String,
    label: 'Archivo',
  },
  idProfesional: {
    type: Number,
    label: 'Profesional',
    optional:true
  },
  idObraSocial: {
    type: Number,
    label: 'Obra Social',
  },
  


}))
Pacientes.attachSchema(new SimpleSchema({
  
  
  fechaUpdate: {
    type: Date,
    optional:true,
    label: 'Fecha Update',
  },
  idUsuarioCambia: {
    type: String,
     optional:true,
    label: 'usuario cambia',
  },
  nroAfiliado: {
    type: String,
    optional:true,
    label: 'Nro Afiliado',
  },

  nombrePaciente: {
    type: String,
    label: 'Nombre Paciente',
  },
  idObraSocial: {
    type: String,
    label: 'Obra Social',
    autoform: {
       type: "select2",
       options: function () {
        return _.map(ObrasSociales.find().fetch(), function (c, i) {
          return {label: c.nombreOs, value: c._id};
        })},
        style: "width:550px",
      },
  },
  dni: {
    type: Number,
    label: 'DNI',
    optional:true,
  },
  telefono: {
    type: String,
    label: 'Tel.',
    optional:true,
  },
  email: {
    type: String,
    label: 'Email',
    optional:true,
  },
   estado: {
    type: String,
    label: 'Estado',
    optional:true,
    autoform: {
     defaultValue:"ACTIVO",
         type:"select-radio-inline",
         trueLabel:"Yes", falseLabel:"No",
      options: [
        {label: "ACTIVO", value: "ACTIVO"},
         {label: "INACTIVO", value: "INACTIVO"},
      ]
    }
  },
   fechaUpdateEstado: {
    type: Date,
    label: 'Fecha Update Estado',
    optional:true,
  },
  rtaOs: {
    type: String,
    label: 'Respuesta O.S',
    optional:true,
  },

}))
Nomencladores.attachSchema(new SimpleSchema({
  
  fechaDesde: {
    type: Date,
    label: 'Fecha Desde',
  },
  fechaHasta: {
    type: Date,
    label: 'Fecha Hasta',
  },
  idObraSocial: {
    type: String,
    label: 'Obra social',
  },
  idAsociacion: {
    type: String,
    label: 'ID sistema asociacion',
  },
  nomencladores:{
     type: Array,
    optional:true,
    label:"Nomencladores"
  },
   "nomencladores.$":{
    type:Object,
  },
  "nomencladores.$._id":{
    optional: true,
    type: String,
    autoValue: function() {
      return Random.id();  
    }
 
  },
  "nomencladores.$.nombreNomenclador": {
    type: String,
    optional: false,
    label:"Nombre"
  },
  "nomencladores.$.idNomencladorAsociacion": {
    type: String,
    optional: false,
    label:"ID ASOCIACION"
  },
   "nomencladores.$.codigoNomenclador": {
    type: String,
    optional: false,
    label:"Codigo"
  },
  "nomencladores.$.importe": {
    type: String,
    optional: false,
    decimal:true,
    label:"Importe"
  },
}));

ObrasSociales.attachSchema(new SimpleSchema({
  
  nombreOs: {
    type: String,
    label: 'Nombre',
  },
  id: {
    type: String,
    label: 'ID sistema asociacion',
  },
   
}));

Settings.attachSchema(new SimpleSchema({
  
  valor: {
    type: String,
    label: 'Valor',
  },
  clave: {
    type: String,
    label: 'Clave',
  },
  fecha: {
    type: Date,
     label: 'Fecha',
    optional: true, 

  },
}), { tracker: Tracker });




Liquidaciones.attachSchema ( new SimpleSchema({
  idUsuario: {
    type: String,
    label: "Usuario",
     optional:true,
  },
   nroLiquidacion: {
    type: Number,
    label: "Nro Liq.",
     optional:true,
  },
  fecha: {
    type: Date,
    optional:false,
    autoform: {
        style: "width:255px",
        type: 'datetime-local',
        autocomplete:"off",
      },
    label: 'Fecha',
  },
  estado: {
    type: String,
    optional:true,
     label: 'Estado',
  },
  importe: {
    type: Number,
    optional:true,
    decimal:true,
     label: '$ TOTAL',
  },
  detalle: {
    type: String,
     label: 'Detalle',
  },
  nroLiquidacion:{
     type: String,
    optional:true,
    label:"Nro Liquidacion"
  },
     facturas:{
     type: Array,
    optional:true,
    label:"Facturas"
  },
    
  "facturas.$":{
    type:Object,
  },
   "facturas.$._id":{

    type: String,
    autoValue: function() {
      return uuid.new()
    }
 
  },

   "facturas.$.fechaConsulta": {
    type: Date,
    optional: false,
    label:"Fecha Consulta"
  },
   "facturas.$.paciente": {
    type: String,
    optional: false,
    label:"Paciente"
  },
   "facturas.$.nroAfiliado": {
    type: String,
    optional: true,
    label:"Nro Afiliado"
  },
  "facturas.$.nroOrden": {
    type: String,
    optional: false,
    label:"Nro Orden"
  },
  "facturas.$.coeficiente": {
    type: Number,
    optional: false,
    label:"% Aplica"
  },
  "facturas.$.cantidad": {
    type: Number,
    optional: false,
    label:"Cant."
  },
  "facturas.$.idRangoNomenclador": {
    type: String,
    optional: true,
    label:"Rango Nomenclador"
  },
  "facturas.$.idObraSocial": {
    type: String,
    optional: true,

     autoform: {
       
       type: "select2",
       
       select2Options:{
           placeholder: 'Sin OS',
         width:"400px",
         allowClear:true,
        style: "width:350px",
      },
    },
    label:"Obra Social"
  },
  "facturas.$.idNomenclador": {
    type: String,
    optional: false,

     autoform: {
       
       type: "select2",
       
       select2Options:{
           placeholder: 'Sin Nomenclador',
         width:"500px",
         allowClear:true,
        style: "width:350px",
      },
    },
    label:"Nomenclador"
  },
  "facturas.$.nombreNomenclador": {
    type: String,
    optional: true,
    label:"Nomenclador"
  },
  "facturas.$.nombreOs": {
    type: String,
    optional: true,
    label:"Nombre Os"
  },
  "facturas.$.importe": {
    type: Number,
    optional: false,
    decimal:true,
    label:"$importe"
  },
   "facturas.$.importeAnterior": {
    type: Number,
    optional: true,
    decimal:true,
    label:"$ ant."
  },
  "facturas.$.esImporteFijo": {
    type: Boolean,
    optional: true,
    decimal:true,
    label:"fijo"
  },
  "facturas.$.al50": {
    type: Boolean,
    optional: true,
    label:"% Al 50"
  },
  "facturas.$.al75": {
    type: Boolean,
    optional: true,
    label:"Al 75%"
  },

 
}, {tracker: Tracker}) );