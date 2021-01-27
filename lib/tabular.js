 import Tabular from 'meteor/aldeed:tabular';
import moment from 'moment';


 so__=new Tabular.Table({
  name: "Pacientes",
   language: {
     processing: "<img src='/images/loading.gif'>"
  },
   processing: true,
   stateSave: true,
   responsive: true,

  collection: Pacientes,
   createdRow( row, data, dataIndex ) {
    if(data.estado=="BAJA"){
      var fila=$(row);
      fila.attr("class","danger"); //danger, success,info
        
    }
  },
   extraFields: ["fechaUpdateEstado","rtaOs"],
    buttons: ['copy', 'excel', 'csv', 'colvis'],
   autoWidth: false, // puse esto por que cuando eliminaba un socio y volvia a socios queda la tabla por la mitad
//classname:"compact",
  columns: [
     {
        title: 'Nro Af.',
       width: '60px',
       data:"nroAfiliado",
      
      },
      {
        title: 'Nombre Paciente',
       width: '350px',
       data:"nombrePaciente",
      },
      {
        title: 'Obra Social',
       width: '300px',
       data:"idObraSocial",
      render:function (value, type, object) {
         var d=ObrasSociales.findOne({_id:value});
         if (d)return d.nombreOs;
         return "s/n"
         }
      },
     {
        title: 'D.N.I',
       width: '70px',
       data:"dni",
      },
      {
        title: 'Tel.',
       width: '120px',
       data:"telefono",
      },
      {
        title: 'Email',
       width: '120px',
       data:"email",
      },
      {
        title: 'Estado',
       width: '60px',
       data:"estado",
      },
      {
        width: '250px',
      tmpl: Meteor.isClient && Template.rtaOs
    },
      {
      	width: '80px',
      tmpl: Meteor.isClient && Template.accionesPacientes
    }
      
  ]
});
 function colorearEstado(estado)
{
  if(estado=="A")return "<b style='color:green'>"+estado+"</b>";
  if(estado=="R")return "<b style='color:red'>"+estado+"</b>";
  return "<b style='color:grey'> - </b>";
}