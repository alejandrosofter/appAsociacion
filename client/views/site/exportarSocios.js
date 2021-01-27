Template.exportarSocios.rendered=function(){

  
}

Template.exportarSocios.events({
"click #btnExportar":function(){
UIBlock.block('EXPORTANDO DATOS, aguarde por favor...');
Meteor.call("exportarSocios",function(err,res){
Router.go('/descargarExcelSocios');
UIBlock.unblock();
})

}

})