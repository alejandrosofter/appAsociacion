Template.logs.helpers({
    'settings': function(){
        return {
 collection: Log.find(),
 rowsPerPage: 10,
 class: "table table-condensed",
 showFilter: true,
 fields: [
    {
        key: 'fecha',
       sortOrder:0,
       sortDirection: 'descending',
        label: 'Fecha',
        fn: function (value, object, key) {
          var d=new Date(value);
          var hoy=new Date();
          if(d.toLocaleDateString()===hoy.toLocaleDateString()) return d.toLocaleTimeString();
           return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
         }
      },
      {
        key: 'detalle',
        label: 'Detalle',
      },
   {
        key: 'accion',
        label: 'Accion',
      },
    

   
 ]
 };
    }
});
