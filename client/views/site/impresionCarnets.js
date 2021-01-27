Template.imprimirCarnetFrente.events({
    'click .btnAcepta': function () {
				window.print();
    }
});
Template.imprimirCarnetFrenteSimple.events({
    'click .btnAcepta': function () {
				window.print();
    }
});
Template.imprimirCarnetDorso.events({
    'click .btnAcepta': function () {
				window.print();
    }
});
Template.impresionCarnets.events({

	'click #printFrente': function(){
        var act=this;
		$('#imprimirCarnetFrente').on('hidden.bs.modal', function (e) {
  $(".modal-backdrop").remove();
})// BUG QUE NO CIERRA EL FONDO
    Modal.show('imprimirCarnetFrente',function(){ return act; });
  
    },
		'click #printFrenteSimple': function(){
        var act=this;
			act.simple=true;
		$('#imprimirCarnetFrenteSimple').on('hidden.bs.modal', function (e) {
  $(".modal-backdrop").remove();
})// BUG QUE NO CIERRA EL FONDO
    Modal.show('imprimirCarnetFrenteSimple',function(){ return act; });
  
    },
  'click #printDorso': function(){
        var act=this;
		$('#imprimirCarnetDorso').on('hidden.bs.modal', function (e) {
  $(".modal-backdrop").remove();
})// BUG QUE NO CIERRA EL FONDO
    Modal.show('imprimirCarnetDorso',function(){ return act; });
  
    },
	
 
});