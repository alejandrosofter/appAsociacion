import { Meteor } from 'meteor/meteor'; 

var getFacturasOs=function(datos,idOs){
  var salida=[]
  if(datos)
  for(var i=0;i<datos.length;i++){
    if(datos[i].idObraSocial==idOs)salida.push(datos[i]);
  }
  return salida;
}
var getUsuario=function(id){
  var usuarios=Meteor.users.find().fetch();
  for(var i=0;i<usuarios.length;i++){
     if(usuarios[i]._id==id)return usuarios[i].profile.profesional;
  }
   
  
  return id
}
function getNomencladores(idObraSocial,fechaConsulta)
{

  var idOs=idObraSocial;
  var fechaDesde=fechaConsulta;

  var os=ObrasSociales.findOne({_id:idOs});

  if(os)return Nomencladores.find({idObraSocial:os.id,fechaDesde:{$lte:(fechaDesde)}},{ sort: { fechaDesde: -1 } }).fetch();
  return []
}
function getNomenclador(id,campo,arr)
{
  var data=[];
 if(arr)data=arr;
  if(!campo)campo="idNomencladorAsociacion";
  if(data) for(var i=0;i<data.length;i++){
   if(data[i][campo]==id)return data[i]
  }
  
  return null;
}
function getIndexFactura(idLiquidacion,idFactura)
{
  var liquidacion=Liquidaciones.findOne({_id:idLiquidacion});
  var facturas=liquidacion.facturas;
   for(var i=0;i<facturas.length;i++)
    if(facturas[i]._id==idFactura)return i;
  return null;
}
function guardarFacturas(idLiquidacion,facturas)
{
   for(var i=0;i<facturas.length;i++){
    var index=getIndexFactura(idLiquidacion,facturas[i]._id);
    var selector="facturas."+index+".importe";
    console.log(index,idLiquidacion,selector,facturas[i].importeNuevo)
    if(index>=0)Liquidaciones.update( { _id: idLiquidacion }, 
      { $set: { [selector]: facturas[i].importeNuevo, }  } );
      
}
}
// // function ripArchivoExcel(files)
// {
//   var fs = require('fs');
//   var arr=[];
//   const folder=Settings.findOne({ clave: "pathExcelNomencladores"  }).valor;
//  for(var i=0;i<files.length;i++){
//   var archivo=files[i].split("/").pop();
//   var id=archivo.split(".")[0];
  
//   var nombre=ObrasSociales.findOne({_id:id}).nombreOs;
 
//   var modifica=nombre?fs.statSync(files[i]).mtime:"";
//   var aux={archivo:archivo,nombreOs:nombre,id:id,path:files[i],ultimaModificacion:modifica};
//   arr.push(aux);
//  }
// }
 function ripArchivoExcel2(files)
{
  var arr=[];
 for(var i=0;i<files.length;i++){
  var os=ObrasSociales.findOne({id:(files[i].idObraSocial)});
  var nombre=os?os.nombreOs:"s/n";
  var aux={archivo:files[i].nombreArchivo,nombreOs:nombre,id:files[i]._id,ultimaModificacion:files[i].fechaActualiza};
  if(files[i].idProfesional)
    if(files[i].idProfesional!=Meteor.user().profile.idProfesional)continue;
  arr.push(aux);
 }
 return arr;
}
function getCampoPractica(practica,idNomenclador,campo)
{
    var unw={  $unwind:  { path: "$nomencladores" } }
   
    var proy={   $project: {
        _id: "$nomencladores._id",
        nombreNomenclador:"$nomencladores.nombreNomenclador",
        codigoNomenclador:"$nomencladores.codigoNomenclador",
        importe:"$nomencladores.importe",

        idObraSocial:"$idObraSocial",
        idNomenclador:"$_id",
       
      }
    }
    var match={
      $match: {
        idNomenclador: idNomenclador,
         _id:practica.practica
      }
    }
    var nom= Nomencladores.aggregate([ unw, proy,match ]);
    // console.log(practica,nom[0]);
    if(nom.length>0)return nom[0][campo];
    return 0;
}
function getProxNroOrden(idLiquidacion)
{
  var unw={  $unwind:  { path: "$facturas" } }
   
    var proy={   $project: {
        _id: "$_id",
        nroOrden:"$facturas.nroOrden",
       
      }
    }
    var match={
      $match: {
        _id: idLiquidacion,
      }
    }
    var sort={$sort:{nroOrden:-1}};
    var datos= Liquidaciones.aggregate([ unw, proy,match ]);
     // console.log(datos);
    if(datos.length>0)return Number(datos[0].nroOrden)+1;
    return 0;
}
function ingresarPractica(proxNroOrden,paciente,estudio,idLiquidacion,idNomenclador,practica)
{
  var importe=getCampoPractica(practica,idNomenclador,"importe");
  var coef=100;
  var idNomencladorRango=practica.practica;
  var nombreNom=getCampoPractica(practica,idNomenclador,"codigoNomenclador");
  var facturaAux={nombreNomenclador:nombreNom,fechaConsulta:estudio.fecha,paciente:paciente.nombrePaciente,nroAfiliado:paciente.nroAfiliado,nroOrden:proxNroOrden,coeficiente:coef,cantidad:practica.cantidad,idRangoNomenclador:idNomenclador,idObraSocial:paciente.idObraSocial,idNomenclador:idNomencladorRango,importe:importe}
  if(practica.estado=="APROBADO")
  Liquidaciones.update({_id:idLiquidacion},{$push:{facturas:facturaAux}});
}
async function checkWebPaciente_unoSalud(conexion,login,paciente,busqueda1,busqueda2)
{
  try {
  const puppeteer = require('puppeteer');
   

  const browser = await puppeteer.launch({ });
  const page = await browser.newPage();
  page.on('pageerror', pageerr=> {
    console.log('pageerror occurred: ', pageerr);
  })

    await page.goto(conexion.urlLogin, { waitUntil: 'networkidle0' });
  var title = await page.title();
console.log(title)
 await page.type('#user', login.usuario);
await page.type('#password', login.clave);
 await page.keyboard.press('Enter');

  await page.waitForNavigation();
  var res="";
  if(busqueda1){
    await page.type('#searchkey', busqueda1);
    await page.keyboard.press('Enter');
    await page.waitForNavigation();
    res=" POR DNI "+await page.$eval(conexion.selectorResultado,e => e.innerHTML);
  }

 if(busqueda2){
  await page.type('#searchkey', busqueda2);
  await page.keyboard.press('Enter');
  await page.waitForNavigation();
  res+=" POR NRO AFILIADO "+await page.$eval(conexion.selectorResultado,e => e.innerHTML);

  await browser.close();
 }

} catch (e) {
    console.log(e);
    return res;
}  
  console.log(res)
  var feUpdate=new Date();
  var up=Pacientes.update({_id:paciente._id},{$set:{rtaOs:res,fechaUpdateEstado:feUpdate}},
    function(err,e){
    console.log(err,e)
  });
  console.log(up,paciente._id,res,feUpdate)
  return res;
}
async function checkWebPaciente_sancor(conexion,login,paciente,busqueda1,busqueda2)
{
  const puppeteer = require('puppeteer');
    var nro=paciente.dni;

  const browser = await puppeteer.launch({});
  const page = await browser.newPage();

  await page.goto(conexion.urlLogin, { waitUntil: 'networkidle0' });
  var title = await page.title();
console.log(title)
 await page.type('#vUSUARIO', login.usuario);
await page.type('#vPASS', login.clave);
 await page.keyboard.press('Enter');
 await page.waitForSelector("#HEADER2_MPAGE");
 var title = await page.title();
console.log(title)
await page.goto("http://prestadores.sancorsalud.com.ar/prestadores.autorizaciones.aspx?2", { waitUntil: 'networkidle0' }).catch(e => console.error("PEPEEEwwww "+e));;
var title = await page.title();
console.log(title)
var res=title;

await page.type('#W0017vNUMERO', busqueda1).catch(e => console.error("PEPEEE "+e));
await page.click("input[name='W0017VALIDAR']").catch(e => console.error("PEPEEE "+e));


// await page.waitForFunction(q).catch(e => console.error("PEPEEE "+e));;
await page.waitForFunction("document.querySelector('#W0017RTAVALIDACION').style.visibility != 'hidden'");
// // await page.waitForNavigation().catch(e => console.error("PEPEEE "+e));
var res=await page.$eval("#W0017RTAVALIDACION",e => e.innerHTML).catch(e => console.error("PEPEEE "+e));
// console.log(res.html())
  await browser.close();
  // Pacientes.update({_id:paciente._id},{$set:{rtaOs:res,fechaUpdateEstado:new Date()}})
  return res;
  
}
Meteor.methods({
  "getImagen":function(id)
  {
    var fs = require('fs');
    var img=Archivos.findOne({_id:id});
    console.log(img,id)
        var filePath = "/var/www/uploads/"+img.copies.archivos.key;
        var data = fs.readFileSync( filePath );
        data = new Buffer(data, 'binary').toString('base64');
        return "data:image/png;base64,"+data ;
    
  },
  "getImagenUsuario":function()
  {
    var fs = require('fs');
    var usuario=Meteor.users.findOne({_id:Meteor.user()._id});
   
    if(Meteor.user().profile.idImagenFirma){
      var img=Archivos.findOne({_id:Meteor.user().profile.idImagenFirma});
  
        var filePath = "/var/www/uploads/"+img.copies.archivos.key;
        var data = fs.readFileSync( filePath );
        data = new Buffer(data, 'binary').toString('base64');
        console.log(data)
        return "data:image/png;base64,"+data ;
    }
    
    
  },

  "consultaPacientes":function(q)
  {
    var res=Pacientes.find({nombrePaciente:{$regex:q.term,$options: 'i'}}).fetch()
    return res;
  },
  'modificarFacturaLiquidacion':function(e,f)
  {
    console.log(e,f)
  },
 async checkWebPaciente(conexion,login,paciente)
  {
    var busqueda1=login.checkPorDni?paciente.dni.toString():null;
    var busqueda2=login.checkPorAfiliado?paciente.nroAfiliado.toString():null;
      if(conexion.idObraSocial=="62")return checkWebPaciente_unoSalud(conexion,login,paciente,busqueda1,busqueda2);
      if(conexion.idObraSocial=="70")return checkWebPaciente_sancor(conexion,login,paciente,busqueda1,busqueda2);
    
  },
  "inyectarPracticas":function(idLiquidacion,idEstudio)
  {
   
    var estudio=Estudios.findOne({_id:idEstudio});
     var idNomenclador=estudio.idNomenclador;
    if(estudio){
      var proxNroOrden=getProxNroOrden(idLiquidacion);
      var paciente=Pacientes.findOne({_id:estudio.idPaciente});
      var practicas=estudio.practicas;
      for(var i=0;i<practicas.length;i++){
        ingresarPractica(proxNroOrden,paciente,estudio,idLiquidacion,idNomenclador,practicas[i]);
        proxNroOrden++;
      }
      Estudios.update({_id:idEstudio},{$set:{estado:"FACTURADO"}});
    }
  },
  "buscarLiquidaciones":function(idUsuario){
    
    return Liquidaciones.find({idUsuario:idUsuario},{sort:{fecha:-1}}).fetch()
  },
  "buscarPracticasNomenclador":function(idNomenclador)
  {
    var nom=Nomencladores.findOne({_id:idNomenclador});
    if(nom)return nom.nomencladores;
    return []
  },
  "buscarNomencladoresPaciente":function(idPaciente)
  {
      var paciente=Pacientes.findOne({_id:idPaciente});
      if(paciente){
        return Nomencladores.find({idObraSocial:Number(paciente.idObraSocial)}).fetch().reverse();

      }
      return []
  },
  "estadoPracticaEstudio":function(idEstudio,idPractica,estado)
  {

    Estudios.update(
      {_id:idEstudio,"practicas._id":idPractica},
      {$set:{"practicas.$.estado":estado}},
      { getAutoValues: false }
      )
  },

  "buscarPracticasEstudio":function(idEstudio)
  {
    var data=Estudios.findOne({_id:idEstudio});
    if(data)if(data.practicas)return data.practicas;
    return [];
  },
  "quitarItemGenerico":function(coleccion,id,subcoleccion,idSubColeccion){
var Coleccion=eval(coleccion);
    if(subcoleccion){
      var res = Coleccion.update(
        {_id: id }, 
        { $pull: { [subcoleccion]: { "_id": idSubColeccion } } },
        { getAutoValues: false } // SIN ESTE PARAMETRO NO QUITA!!
        )
    }else{

    }
    var aux= Coleccion.findOne({_id:id});

    return aux[subcoleccion];
  },


   "listArchivosExcelNomenclador":function(id){
// var find = require('find');
// const folder=Settings.findOne({ clave: "pathExcelNomencladores"  }).valor;
// var files = find.fileSync(folder);
return ripArchivoExcel2(ArchivosExcel.find().fetch());
  },
  "descargarArchivoNomenclador":function(id){
var find = require('find');
 const http = require('http');
const fs = require('fs');
const folder=Settings.findOne({ clave: "pathExcelNomencladores"  });
var files = find.fileSync(new RegExp(id, 'i'),folder);
console.log(files);
  },
  "checkImportes":function(idLiquidacion)
  {
    var liquidacion=Liquidaciones.findOne({_id:idLiquidacion});
    var auxFacturas=liquidacion.facturas;
    var salida=[];
    var cantidadModifica=0;
    for(var i=0;i<auxFacturas.length;i++){
      var item=auxFacturas[i];
      var noms=getNomencladores(item.idObraSocial,item.fechaConsulta);

      if(noms.length>0)
        if(noms[0]._id!=item.idRangoNomenclador){
          var nombre=item.nombreNomenclador?item.nombreNomenclador.split("|")[0].trim():"";
          var nomenclador=getNomenclador(nombre,"codigoNomenclador",noms[0].nomencladores);
       
          if(nomenclador){
            cantidadModifica++;
            item.nombreNomenclador=nomenclador.codigoNomenclador+" | "+nomenclador.nombreNomenclador;
            item.idRangoNomencladorNuevo=item.idRangoNomenclador;
            item.idRangoNomenclador=noms[0]._id;
            
            var coef=(item.coeficiente/100);
            item.importeViejo=item.importe;
            item.importeNuevo=(nomenclador.importe*item.cantidad)*coef;
            salida.push(item);
        }
          
        }
        
    }

   return salida
  },
"pacientes.save"(data){
  var existe=Pacientes.findOne({nroAfiliado:data.nroAfiliado,idObraSocial:data.idObraSocial});
  if(existe)return Pacientes.update({_id:existe._id},{$set:{nombrePaciente:data.nombrePaciente,nroAfiliado:data.nroAfiliado,fechaUpdate:data.fechaUpdate,idUsuarioCambia:data.idUsuarioCambia}});
  return Pacientes.insert(data);
},
  'users.cargarInicial'(data) {
  	var hayUsuarios = Meteor.users.find().count()>0;
     if (!hayUsuarios) {
     	var perfil={nombres:"alejandro",rol:"administrador"};

        Accounts.createUser({ username:"admin", password:"admin", profile: perfil });
      }
  },
  "liquidaciones.guardar"(idLiquidacion,facturas){
    guardarFacturas(idLiquidacion,facturas);
    return Liquidaciones.update({_id:idLiquidacion},{$set:{estado:"CHECKEADO"}});
      
  },
  "obrasSociales.all"()
  {
    return ObrasSociales.find().fetch()
  },
  "liquidaciones.buscar"(desde,hasta,usuario)
  {
    var userLogueado=Meteor.users.findOne({_id:Meteor.userId()});
    
    if(userLogueado){

    if(userLogueado.profile.rol==="secretaria")return Liquidaciones.find({idUsuario:userLogueado._id,fecha: {$gte : desde,$lte:hasta}}).fetch();
    console.log(usuario)
    var match={fecha: {$gte : desde,$lte:hasta}};
    if(usuario)match['idUsuario']=usuario._id;
    console.log(match)
    return Liquidaciones.find(match).fetch()
}
return [];
  
  },
  "liquidaciones.buscarMasivo"(fechaDesde,fechaHasta,idObraSocial){
console.log(fechaDesde,fechaHasta,idObraSocial);

    var liquidaciones=Liquidaciones.find({fecha:{$gte:fechaDesde,$lte:fechaHasta}}).fetch();
    var data=[];
    
    if(liquidaciones)
    for(var i=0;i<liquidaciones.length;i++){
      var idLiquidacion=liquidaciones[i]._id;
       var arr= getFacturasOs(liquidaciones[i].facturas,idObraSocial);
       var profesional=getUsuario(liquidaciones[i].idUsuario);
       data.push({estado:liquidaciones[i].estado, profesional:profesional,facturas:arr,idObraSocial:idObraSocial,idLiquidacion:idLiquidacion})
        
    }
    console.log(data)
    return data;
  },
  'nomencladores.all'() {
    return Nomencladores.find({})
  },
  "users.perfil"(id)
  {
    return Meteor.users.findOne({_id:id}).profile;
  },
  'users.list'(data) {
    return Meteor.users.find().fetch(); 
  },
  
  'users.one'(id) {
    return Meteor.users.find({_id:id}); 
  },
  'users.add'(usuario,clave,perfil) {
  	return Accounts.createUser({ username:usuario, password:clave, profile: perfil });
  },
  'users.update'(_id,usuario,perfil) {
  	return Meteor.users.update({_id:_id},{$set:{profile:perfil,username:usuario}});
  },
  'users.remove'(_id) {
  	return Meteor.users.remove({_id:_id});
  }, 
  'users.resetPassword'(_id,clave) {
  	return Accounts.setPassword(_id,clave);
  },
  'settings.generarVariables'(){
    if (!Settings.findOne({ clave: "hostInyeccion"  })) Settings.insert({ clave: "hostInyeccion", valor: "192.155.543.5" });
    if (!Settings.findOne({ clave: "usuarioInyeccion"  })) Settings.insert({ clave: "usuarioInyeccion", valor: "root" });
    if (!Settings.findOne({ clave: "claveInyeccion"  })) Settings.insert({ clave: "claveInyeccion", valor: "vertrigo" });
    if (!Settings.findOne({ clave: "dbInyeccion"  })) Settings.insert({ clave: "dbInyeccion", valor: "asociacion" });
    if (!Settings.findOne({ clave: "proxNroLiquidacion"  })) Settings.insert({ clave: "proxNroLiquidacion", valor: "1" });
    if (!Settings.findOne({ clave: "pathExcelNomencladores"  })) Settings.insert({ clave: "pathExcelNomencladores", valor: "/var/www/archivosExcelNomencladores/" });
    if (!Settings.findOne({ clave: "direccionNomencladoresExcel"  })) Settings.insert({ clave: "direccionNomencladoresExcel", valor: "serverdesarrollo/archivosExcelNomencladores/" });
  },
  'settings.remove'(id) {
    return Settings.remove({_id:id}); 
  },
  "settings.autoincrementaNroLiquidacion"(){
    console.log("fdd")
    var nuevoValor=Number(Settings.findOne({ clave: "proxNroLiquidacion"  }).valor)+1;
    Settings.update({clave:"proxNroLiquidacion"},{$set:{valor:nuevoValor}});
    console.log("cambio")
  },
  "remote.syncLiquidacion":function(idLiquidacion,idOs)
  {
     var Future = Npm.require('fibers/future');
    var fut1 = new Future();
    var exec = Npm.require("child_process").exec;
    var path = process.cwd() + '/../web.browser/app/shellPython/syncLiquidacion.py';
    
    var command="python "+path+" "+idLiquidacion+" "+idOs; 
  
      exec(command,function(error,stdout,stderr){ 
        console.log(stdout)
        fut1.return(stderr);
      });
      return fut1.wait();
    
    return fut1.wait();
  },
  "remote.syncOs":function()
  {
    Future = Npm.require('fibers/future');
    var fut1 = new Future();
    var exec = Npm.require("child_process").exec;

    var path = process.cwd() + '/../web.browser/app/shellPython/importarOs.py';
    
    var command="python "+path; 
      exec(command,function(error,stdout,stderr){
        if(error){
          console.log(error);
          throw new Meteor.Error(500,command+" failed");
        }
        console.log(stdout)
        fut1.return(stdout.toString());
      });
      return fut1.wait();
    
    return fut1.wait();
  },
  'liquidaciones.one'(id) {
    
    return Liquidaciones.findOne({_id:id});
  },
  'liquidaciones.remove'(id) {
    
    return Liquidaciones.remove({_id:id});
  },
  "liquidaciones.updateFactura"(data,res){
    console.log(data);
    console.log(res);
    return true
  },
  'liquidaciones_factura.remove'(idLiquidacion,id) {
    return Liquidaciones.update(
        {_id: idLiquidacion }, 
        { $pull: { "facturas": { "_id": id } } },
        { getAutoValues: false } // SIN ESTE PARAMETRO NO QUITA!!
        )
  },

});
if(Meteor.isServer){

Meteor.publish("archivos.all", function () {
  return Archivos.find();
})
Meteor.publish('nomencladores.all', function () {
  return Nomencladores.find();
});
Meteor.publish('estudios.all', function () {
  return Estudios.find({idUsuario:Meteor.user()._id});
});
Meteor.publish('recetas.all', function () {
  return Recetas.find({idUsuario:Meteor.user()._id});
});
Meteor.publish('pacientes.all', function () {
  return Pacientes.find();
});
Meteor.publish('nomencladores.one', function (idNomenclador) {
  var res= Nomencladores.find({_id:Number(idNomenclador)});
  return res;
});
Meteor.publish('nomencladores.os', function (idObraSocial) {
	
  var res= Nomencladores.find({idObraSocial:Number(idObraSocial)});
  return res

});
Meteor.publish('liquidaciones.one', function (id) {
  var res= Liquidaciones.find({_id:id});
  return res;
});
Meteor.publish('medicamentos.all', function (id) {
  var res= Medicamentos.find();
  return res;
});

Meteor.publish('settings.all', function () {
  return Settings.find();
});
Meteor.publish('obrasSociales.all', function () {
  return ObrasSociales.find();
});
Meteor.publish('ConexionObraSocial.all', function () {
  return ConexionObraSocial.find();
});
Meteor.publish('LoginObraSocial.all', function () {
  return LoginObraSocial.find({idUsuario:Meteor.user()._id});
});

Meteor.publish('obrasSociales.one', function (idOs) {
  return ObrasSociales.find({_id:idOs});
});
}