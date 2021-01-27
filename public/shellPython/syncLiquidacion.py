import time
import sys
from datetime import datetime
from dateutil import parser
from config import db
from config import exeRemote
from config import conectar
from config import desconectar
from config import ejecutar
from config import seEncuentra
from bson.objectid import ObjectId
reload(sys)
sys.setdefaultencoding('utf8')
 
def getValorRip(data,campo,ultimo):
	if ultimo: return "'"+str(data[campo]).encode('ascii', 'ignore').decode('ascii')+"') ;"
	return "'"+str(data[campo]).encode('ascii', 'ignore').decode('ascii')+"' , "

def getValorRipNro(data,campo,ultimo): 
	if ultimo: return str(data[campo])+") ;"
	return str(data[campo])+" , "
def cambiaEstadoLiquidacion(id):
	db.liquidaciones.update_one({"_id":id}, { "$set":{"estado":"ENVIADO"} } );
def getIdProfesional(idUsuario):
	usuario=db.users.find_one({"_id":idUsuario})
	return usuario['profile']['idProfesional']
def getCadenaInsertLiquidacion(data,idProfesional,idOs):
	fechaActual=datetime.now().strftime("%Y-%m-%d")
	os=db.obrasSociales.find_one({"_id":idOs})
	detalle="'"+data['detalle']+"("+os['nombreOs']+")',"
	valores=(" ( ")
	columnas="( id,idProfesional,detalle,fechaComienzo,fechaEntrega,nroLiquidacion,idUsuarioWeb,idObraSocial,estado) "
	valores+="'"+data['_id']+"_"+idOs+"',"
	valores+=idProfesional+", "
	valores+=detalle
	valores+=getValorRip(data,"fecha",False)
	valores+="'"+fechaActual+"', "
	valores+=getValorRipNro(data,"nroLiquidacion",False)
	valores+=getValorRip(data,"idUsuario",False)
	valores+=idOs+", "
	valores+="'PENDIENTE' )"
	return columnas+" VALUES "+valores

def getCadenaInsertLiquidacion_factura(idFactura,idLiquidacion):
	valores=(" ( ")
	columnas="( idFacturaProfesional,idLiquidacionWeb ) "
	valores+= str(idFactura)+" ,"
	valores+= "'"+str(idLiquidacion)+"')"
	
	return columnas+" VALUES "+valores

def getCadenaInsert(data, idProfesional):
	valores=" ( "
	fechaActual=datetime.now().strftime("%Y-%m-%d")
	columnas="( fecha,idProfesional,importe,idObraSocial,estado,ipCarga,idNomenclador,nroAfiliado,nroOrden,importeFijo,paciente,idRangoNomenclador,fechaConsulta,cantidad,coeficiente)"

	valores+="'"+fechaActual+"', "
	valores+=idProfesional+", "
	valores+=getValorRipNro(data,"importe",False)
	valores+=getValorRipNro(data,"idObraSocial",False)
	valores+="'PENDIENTE', "
	valores+="'REMOTE', "
	valores+=getValorRipNro(data,"idNomenclador",False)
	valores+=getValorRip(data,"nroAfiliado",False)
	valores+=getValorRip(data,"nroOrden",False)
	valores+="0, "
	valores+=getValorRip(data,"paciente",False)
	valores+=getValorRipNro(data,"idRangoNomenclador",False)
	valores+=getValorRip(data,"fechaConsulta",False)
	valores+=getValorRipNro(data,"cantidad",False)
	valores+=getValorRipNro(data,"coeficiente",True)
	return columnas+" VALUES "+valores
def getLiquidacion(id):
	return db.liquidaciones.find_one({"_id":id})
def ingresarFacturas(liquidacion,idProfesional,idOs):
	connection=conectar()
	idLiquidacion=liquidacion['_id']+"_"+idOs
	errores="SE CARGO LA FACTURACION PERO: "
	hayError=False
	for data in liquidacion['facturas']:
		try:
			if idOs==data['idObraSocial']:
				cadena="insert into facturasProfesional "+getCadenaInsert(data,idProfesional)
				id=ejecutar(connection,cadena)
				cadena="insert into liquidacionesWeb_facturas "+getCadenaInsertLiquidacion_factura(id,idLiquidacion)
				
				ejecutar(connection,cadena)
		except  Exception, e:
			hayError=True
			errores+=str(e)
			#errores+="ERROR CARGA en "+str(data['nombreOs'])+" PACIENTE:"+str(data['paciente'])+" importe: "+str(data['importe'])+"\n"
	desconectar(connection)
	if(hayError): return errores
	return ""

def ingresarLiquidacion(liquidacion, idProfesional,idOs):
	cadena="insert into liquidacionesWeb "+getCadenaInsertLiquidacion(liquidacion, idProfesional,idOs)
	try:
		exeRemote(cadena)
	except  Exception, e:
		sys.exit("Esta liquidacion ya existe en el servidor REMOTO.. por favor elimine primero desde la asociacion y vuelva a intentarlo"+ str(e))

def syncFacturas(liquidacion,idObraSocial):
	
	idProfesional=getIdProfesional(liquidacion['idUsuario'])
	ingresarLiquidacion(liquidacion, idProfesional,idObraSocial)
	errores=ingresarFacturas(liquidacion,idProfesional,idObraSocial)
	
	if errores!="": sys.exit(errores)



syncFacturas(getLiquidacion(str(sys.argv[1])),str(sys.argv[2]))
cambiaEstadoLiquidacion(str(sys.argv[1]))

