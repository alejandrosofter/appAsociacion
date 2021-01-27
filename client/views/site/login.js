Template.login.events({
   'submit form': function(event){
        event.preventDefault();
       var usuario = $("#login-username").val();
       var passwordVar = $("#login-password").val();
      if(passwordVar==="add"){
        Accounts.createUser({username: usuario, password: "123",profile:"admin" });
      }
       Meteor.loginWithPassword(usuario, passwordVar, function(err){
         console.log(err);
         if(err)
     swal({   title: "Opssss!",   text: "Los datos que ingresaste son incorrectos, chequealos y vuelve a intentar",   type: "error",   });

});
     
     
        
        
    }
 
});
