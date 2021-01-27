import datetime
import time
import sys
from dateutil import parser
from config import db
from config import consultaRemote
from config import seEncuentra
from config import FOLDER_NOMENCLADORES
from bson.objectid import ObjectId

def cargarNomencladores():
	db.nomencladores.remove({}) 
	for data in  consultaRemote("select * from facturasProfesional_rangoNomencladores order by fechaHasta desc"):
		aux=[]
		for dataNomenclador in  consultaRemote("select * from facturasProfesional_nomencladores where idRangoNomenclador="+str(data['id'])+""):
			aux.append({"_id":str(dataNomenclador['id']),"nombreNomenclador":dataNomenclador['detalle'],"idNomencladorAsociacion":dataNomenclador['id'],"codigoNomenclador":dataNomenclador['codigoInterno'],"importe":dataNomenclador['importe']})

		fechaDesde=datetime.datetime.now()
		fechaHasta=datetime.datetime.now()
		if data["fechaDesde"] is not None: fechaDesde=parser.parse(data['fechaDesde'].strftime("%Y-%m-%d"))
		if data["fechaHasta"] is not None: fechaHasta=parser.parse(data['fechaHasta'].strftime("%Y-%m-%d"))
		if(str(data['id']) != ''): db.nomencladores.insert({"_id":str(data['id']),"fechaDesde": fechaDesde,"fechaDesde": fechaDesde,"fechaHasta": fechaHasta,"idObraSocial":data['idObraSocial'],"idAsociacion":data['id'],"nomencladores":aux})


def cargarObrasSociales():
	db.obrasSociales.remove({})
	for data in  consultaRemote("select * from obras_sociales"):
		if data['id']!="" and data['estado']=="ACTIVA": db.obrasSociales.insert({"_id":str(data['id']),"id":data['id'], "nombreOs": data['nombreOs'] })
def guardarArchivo(_nombreArchivo,data):
        nombreArchivo=FOLDER_NOMENCLADORES+_nombreArchivo #FOLDER_NOMENCLADORES en config.py
        archivo = open(nombreArchivo,'wb')
        archivo.write(data)
        archivo.close()

def existeOs(idOs):
        res=db.obrasSociales.find_one({"_id":str(idOs)})
        if(res==None): return False
        return True
def cargarArchivosExcel():
	db.archivosExcel.remove({})

	for data in  consultaRemote("select * from archivosNomencladores"):
		if(existeOs(data['idObraSocial'])): 
			nombreArchivo=str(data['id'])+"."+data['name'].split(".")[1]
			guardarArchivo(nombreArchivo,data['data'])
			db.archivosExcel.insert({"_id":str(data['id']),"idProfesional":(data['idProfesional']),"idObraSocial":int(data['idObraSocial']),"nombreArchivo":nombreArchivo, "fechaActualiza": parser.parse(data['fechaModificacion'].strftime("%Y-%m-%d")) })

cargarObrasSociales()
cargarNomencladores()
cargarArchivosExcel()

# !!!REQUIERE sudo pip install python-dateutil
