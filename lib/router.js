applicationController = RouteController.extend({
  layoutTemplate: 'layoutApp',
	  loadingTemplate: 'loaderGral',
	  notFoundTemlplate: 'notFound',

	  waitOn: function() {
		return [
			
		];
	  },
	  onBeforeAction: function(pause) {
		this.render('loaderGral');
		if ( !Meteor.user() )
			{this.render('login');}
 	else		{this.next();}
	  },
	  action: function () {
		if (!this.ready()) {
		  this.render('loaderGral');
		}
		else {
		  this.render();

		}
	  }
	});
applicationControllerLiquida = RouteController.extend({
  layoutTemplate: 'layoutApp',
	  loadingTemplate: 'loaderGral',
	  notFoundTemlplate: 'notFound',

	  waitOn: function() {
		return [
			// Meteor.subscribe('liquidaciones.all',Meteor.user())
		];
	  },
	  onBeforeAction: function(pause) {
		this.render('loaderGral');
		if ( !Meteor.user() )
			{this.render('login');}
 	else		{this.next();}
	  },
	  action: function () {
		if (!this.ready()) {
      console.log(Meteor.user())
		  this.render('loaderGral');
		}
		else {
		  this.render();

		}
	  }
	});
Router.route('/', {
 path: '/',
 // layoutTemplate: 'layoutVacio',
    template:"inicio",
		controller: applicationController,
});

Router.route('/ConexionObraSocial', {
 path: '/ConexionObraSocial',
 // layoutTemplate: 'layoutVacio',
    template:"ConexionObraSocial",
		controller: applicationController,
});
Router.route('/recetas', {
 path: '/recetas',
 // layoutTemplate: 'layoutVacio',
    template:"recetas",
		controller: applicationController,
});
Router.route('/medicamentos', {
 path: '/medicamentos',
 // layoutTemplate: 'layoutVacio',
    template:"medicamentos",
		controller: applicationController,
});
Router.route('/loginObrasSociales', {
 path: '/loginObrasSociales',
 // layoutTemplate: 'layoutVacio',
    template:"loginObrasSociales",
		controller: applicationController,
});
Router.route('/inicio', {
 path: '/inicio',
 // layoutTemplate: 'layoutVacio',
    template:"inicio",
		controller: applicationController,
});
Router.route('liquidaciones', {
		path: '/liquidaciones',
    template:"liquidaciones",
		controller: applicationControllerLiquida,
})
Router.route('pacientes', {
		path: '/pacientes',
    template:"pacientes",
		controller: applicationController,
})
Router.route('estudios', {
		path: '/estudios',
    template:"estudios",
		controller: applicationController,
})
Router.route('obrasSociales', {
		path: '/obrasSociales',
    template:"obrasSociales",
		controller: applicationController,
})
Router.route('settings', {
		path: '/settings',
    template:"settings",
		controller: applicationController,
})
Router.route('usuarios', {
		path: '/usuarios',
    template:"usuarios",
		controller: applicationController,
})
Router.route('/liquidaciones_facturas/:_id', {
	controller: applicationController,
    template: 'liquidaciones_facturas',
    data: function(){
         var sal=Liquidaciones.findOne({_id:(this.params._id)});
         console.log(this.params)
         return sal;
    }
});
Router.route('/nomencladores/:_id', {
	controller: applicationController,
    template: 'nomencladores',
    data: function(){
    	Meteor.subscribe('nomencladores.all')
         var sal=Nomencladores.findOne({_id:(this.params._id)});
         return sal;
    }
});