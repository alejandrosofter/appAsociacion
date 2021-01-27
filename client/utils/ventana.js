Template.ventana.onRendered(function(){

});
Template.ventana.helpers({
	"tmplVentana":function()
	{
		return this.tmplVentana;
	},
	"tituloVentana":function()
	{
		return this.tituloVentana;
	},
	"subTituloVentana":function()
	{
		return this.subTituloVentana;
	},
	"nombreVentana":function()
	{
		return this.nombreVentana;
	},
	"sizeVentana":function()
	{
		return this.sizeVentana=="grande"?"modal-lg":"modal";
	}
})