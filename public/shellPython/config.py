import pymongo
from pymongo import MongoClient
import socket
import datetime
from datetime import date
import os
import getpass
from glob import glob
import mysql.connector

#INSTALAR CONECTOR MYSQL 
#sudo pip install mysql-connector

#TAMBIEN CONECTOR MONGO
#sudo apt-get install python-pip
#python -m pip install pymongo
#sudo pip install parse
#pip install python-dateutil
HOST="localhost"
db=None
FOLDER_NOMENCLADORES=""
def consultaRemote(query):
  HOST =  getValorConfiguracion("hostInyeccion")
  PORT = 3306
  USER = getValorConfiguracion("usuarioInyeccion")
  PASSWORD = getValorConfiguracion("claveInyeccion")
  DB = getValorConfiguracion("dbInyeccion")
  try:
    connection =  mysql.connector.connect(user=USER, password=PASSWORD, host=HOST, database=DB)
    cursor = connection.cursor(dictionary=True)
    cursor.execute(query)
    return cursor.fetchall()
    
    
  except mysql.connector.Error as err:
    print(err)
    raise
def conectar():
  HOST =  getValorConfiguracion("hostInyeccion")
  PORT = 3306
  USER = getValorConfiguracion("usuarioInyeccion")
  PASSWORD = getValorConfiguracion("claveInyeccion")
  DB = getValorConfiguracion("dbInyeccion")
  try:
    connection =  mysql.connector.connect(user=USER, password=PASSWORD, host=HOST, database=DB)

  except mysql.connector.Error as err:
    raise
  return connection
def desconectar(connection):
  connection.cursor().close()
  connection.close()

def ejecutar(connection,query):
  cursor = connection.cursor()
  cursor.execute(query)
  connection.commit()
  return cursor.lastrowid

def exeRemote(query):
  HOST =  getValorConfiguracion("hostInyeccion")
  PORT = 3306
  USER = getValorConfiguracion("usuarioInyeccion")
  PASSWORD = getValorConfiguracion("claveInyeccion")
  DB = getValorConfiguracion("dbInyeccion")
  try:
    connection =  mysql.connector.connect(user=USER, password=PASSWORD, host=HOST, database=DB)
    cursor = connection.cursor()
    cursor.execute(query)
    connection.commit();
    cursor.close();
    connection.close();
    return cursor.lastrowid
    
  except mysql.connector.Error as err:
    print(err)
    raise
  
 # finally: connection.close()

def getCarpetaPrograma():
    path=os.path.dirname(os.path.abspath(__file__+"/../../../../../../"))
    arr=path.split("/")
    tam=len(arr)
    return arr[tam-1].strip()

def setBase():
    nombreBase=getCarpetaPrograma()
    global db
    global HOST

    if(nombreBase!="www"):
      PORT=3001
      client = MongoClient(HOST, PORT)
      db = client.meteor
    else:
      PORT= 27017
      client = MongoClient(HOST, PORT)
      db=client["appSecretarias"]

def getValorConfiguracion(tipo):
  conf=db.settings
  res= conf.find_one({"clave":tipo})
  return res['valor']

def seEncuentra(id,tabla,campoIdTabla):
  return db[tabla].find_one({campoIdTabla:id})

  
setBase()
FOLDER_NOMENCLADORES=getValorConfiguracion("pathExcelNomencladores")