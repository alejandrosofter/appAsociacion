var ripData=function(data)
{
  var sal=[];
  for(var i=0;i<data.length;i++){
    var aux=data[i];
    aux._id=i+"_server";
    sal.push(aux);
  }
  console.log(sal)
  return sal;
}
Template.buscadorAutocomplete.onRendered(function(){
  Meteor.typeahead.inject();
  
});

Template.buscadorAutocomplete.helpers({
   "buscaSource" : function(query, sync, callback) {
   	console.log(this)
      Meteor.call(this.nombreFuncionServer, query, {}, function(err, res) {
        callback(res.map(function(v){ return v; }));
      });
    },
    onSelect: function(event, suggestion, datasetName) {
   Session.set(this.sessionVar,suggestion);
   
$("#"+this.id).trigger("cambiaSocio",[{datos:suggestion}])
   
  },

})