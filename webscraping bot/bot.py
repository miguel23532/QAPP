import bs4
from bs4.element import NavigableString
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains
from fake_useragent import UserAgent
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
import pymysql 
import json

import fake_useragent
print(fake_useragent.__file__)

### FUNCIONES ###

#funcion recursiva para obtener los datos del hmtl y que guarde los datod dentro de un arreglo dado
def obtenerdatos(value, datos):
    #si el objeto que se llama es un NavigableString
    if isinstance(value, NavigableString):
        #dentro de cada uno de sus hijos
        for child in value:
            #llamamos al metodo de nuevo
            obtenerdatos(child, datos)
        
    #si el objeto no es un NavigableString      
    else:
        #si es un tag
        if isinstance(value, bs4.element.Tag):
            #si el tag tiene mas de un hijo
            if len(value.contents) > 1:
                #para cada uno de sus hijos...
                for child in value.find_all("td"):
                    #llamamos de nuevo la función
                    obtenerdatos(child, datos)
                    
            #si el tag solo tiene un hijo   
            else:
                #si al dividir el texto del elemento queda solo un elemento
                if len(value.text.split("\n")) == 1:
                    #guardamos el dato obtenido
                    datos.append(value.text)
                    
                #si hay mas elemento en el texto dividido
                else: 
                    #por cada hijo de ese elemento
                    for child in value.children:
                        #llamamos al metodo de nuevo
                        obtenerdatos(child, datos)    

print("--------------------------Iniciando QBOT-----------------------------")

#crear user agent
ua = UserAgent() 
#ua = UserAgent(use_cache_server=False,cache=False,verify_ssl=False,fallback='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36')
headers = {'User-Agent':ua.chrome}
#agregamos el user agent a chrome para que la pagina no crea que es un bot ademas de opciones que podamos necesitar
opciones = Options()
opciones.add_argument("user-agent="+ua.random)
opciones.add_argument("--window-size=200,800")

service = Service(executable_path="C:/chromedriver/chromedriver.exe")

driver = webdriver.Chrome(service=service, options=opciones)

action = ActionChains(driver)


#opciones del programa INDU,INCO,INNI,ICOM //no sirve: MEL,FIS
ciclo = "202310"
centroU = "D"
carrera = "MEL" #OBLIGATORIO
materia = ""
mostrarEn = "100" #NO CAMBIAR EL SIIAU NO SIRVE


#variable para guardar sucesos del programa en un archivo en disco
#cuenta con un identificador para saber si el log es por el inicio del programa
#log = "--------------------------Iniciando QBOT-----------------------------\n"

###                         PRUEBA                              ###
"""
driver.get("http://localhost/QAPP/consultar.php")

#procesamos los datos de la pagina
html = driver.page_source
soup = bs4.BeautifulSoup(html, "html.parser")

print(soup.text)
"""

###                         PRUEBA2                              ###

i = 1
while not i == 10:
    
    driver.get("http://localhost/QAPP/baseDatosInteract.php?loquequieras=" + str(i))

    #procesamos los datos de la pagina
    html = driver.page_source
    soup = bs4.BeautifulSoup(html, "html.parser")

    if soup.text == "1":
        print(" ")
    else:
        print(" ")
    i = i+1

###                            CONSULTA DE OFERTA                             ###
####################### 



#entrar a la pagina
driver.get("http://siiauescolar.siiau.udg.mx/wal/sspseca.forma_consulta")

#procesamos los datos de la pagina
html = driver.page_source
soup = bs4.BeautifulSoup(html, "html.parser")

#localizamos el selector de ciclo mediante el nombre de la etiqueta y su id
cicloSelect = Select(driver.find_element(By.CSS_SELECTOR, "select[id='cicloID']"))

centroSelect = Select(driver.find_element(By.CSS_SELECTOR,"select[name='cup']"))

#seleccionamos el ciclo elegido
cicloSelect.select_by_value(ciclo)

#seleccionamos el centro universitario
centroSelect.select_by_value(centroU)

#introducir la carrera
carreraInput = driver.find_element(By.CSS_SELECTOR, "input[name='majrp']")
carreraInput.send_keys(carrera)

#seleccionar materias de 500 en 500
btnMostrar = driver.find_element(By.CSS_SELECTOR, "input[value='"+mostrarEn+"']")
btnMostrar.click()

#seleccionar la materia a buscar
materiaInput = driver.find_element(By.CSS_SELECTOR, "input[name='crsep']")
materiaInput.send_keys(materia)

#dar click en boton consulta
btnColsultar = driver.find_element(By.CSS_SELECTOR, "input[id='idConsultar']")
btnColsultar.click()

#cont = 0
#cont2 = 0
###                 Guardar datos de consulta                  ###

#creamos un arreglo para guardar todas las clases
clases = []

#en este true recorremos todas las paginas de la oferta
while True:
    #dejamos un tiempo para que la pagina termine de cargar
    time.sleep(1)
    
    #actualizar el codigo fuente de la pagina
    html = driver.page_source
    soup = bs4.BeautifulSoup(html, "html.parser")
    
    #Guardar las materias de la tabla
    tabla = soup.find_all("tr",{"style" : True})
    
    #por cada fila dentro de la tabla
    for fila in tabla:
        #creamos un arreglo para guardar la clase
        clase = []
        #cont2 = cont2+1
        
        #separamos la fila en celdas
        for celda in fila.children:
            #llamamos al metodo para obtener los datos de la clase
            obtenerdatos(celda, clase)
        #cont = cont+1
        #guardamos la clase dentro del arreglo de clases
        clases.append(clase)
    
    
    #probamos si hay boton siguiente
    try:
        #lo presionamos para ver mas clases
        btnSiguiente = driver.find_element(By.CSS_SELECTOR, "input[value='"+mostrarEn+" Próximos']")
        btnSiguiente.click()
    except:
        #si no hay termina el programa
        break
    
log = "--------------------------CLASES OBTENIDAS-----------------------------\n" 
# guarda todo alv recorriendo los datos de las clases obtenidas
def guardarTodo(clase, profes, materias, clasesOrdenadas):
    if len(clase) == 27:
        #rutina para sacar datos de clases con tres aulas
        diasClase = []
        
        for dia in clase[9].split(" "):
            if not dia == ".":
                diasClase.append(dia)
        
        for dia in clase[15].split(" "):
            if not dia == ".":
                diasClase.append(dia)
        
        for dia in clase[21].split(" "):
            if not dia == ".":
                diasClase.append(dia)
        
        
        #print("-------------------------------------------CLASE triple--------------------------------------------------")
        
        #guardar las materias
        materia = []
        materia.append(clase[2])#nombre materia
        materia.append(clase[1])#clave materia
        materia.append(clase[4])#creditos materia
        materia.append(carrera)
        
        #asegurarse que no se repitan
        nuevoMateria = True
        
        for m in materias:
            if m[1] == materia[1]:
                nuevoMateria = False
                break
                
        if nuevoMateria:
            materias.append(materia)

        #guardar los profes
        profe = []
        profe.append(clase[26])#nombre
        
        #verificar que no exista otro profe con el mismo nombre
        nuevoProfe = True
        
        for p in profes:
            if p[0] == profe[0]:
                nuevoProfe = False
                break
                
        if nuevoProfe:
            profes.append(profe)

        #guardamos el horario
        horario = []
        #Día 1
        dia1 = []
        seCancelatodo = False
        #evaluar horas iniciales dentro de los rangos validos
        
        if int(clase[8][0]+clase[8][1])<7 or int(clase[8][0]+clase[8][1])>21:#1ra hora menor a 07 y mayor a 21
            seCancelatodo = True
        elif int(clase[14][0]+clase[14][1])<7 or int(clase[14][0]+clase[14][1])>21:#2da hora menor a 07 y mayor a 21
            seCancelatodo = True
        elif int(clase[20][0]+clase[20][1])<7 or int(clase[20][0]+clase[20][1])>21:#3er hora menor a 07 y mayor a 21
            seCancelatodo = True
            
        #evaluar horas finales dentro de los rangos validos
        if int(clase[8][5]+clase[8][6])<7 or int(clase[8][5]+clase[8][6])>21:
            seCancelatodo = True
        elif int(clase[14][5]+clase[14][6])<7 or int(clase[14][5]+clase[14][6])>21:
            seCancelatodo = True
        elif int(clase[20][5]+clase[20][6])<7 or int(clase[20][5]+clase[20][6])>21:
            seCancelatodo = True
            
        
        dia1.append(clase[8])#horas1
        dia1.append(diasClase[0])#dia1
        dia1.append(clase[10])#edificio1
        dia1.append(clase[11])#aula1
        #Día 2
        dia2 = []
        dia2.append(clase[14])
        dia2.append(diasClase[1])
        dia2.append(clase[16])
        dia2.append(clase[17])
        #Día 3
        dia3 = []
        dia3.append(clase[20])
        dia3.append(diasClase[2])
        dia3.append(clase[22])
        dia3.append(clase[23])
        
        horario.append(dia1)
        horario.append(dia2)
        horario.append(dia3)
        
        horarioJson = json.dumps(horario) #[["0700-0855", "L", "DEDX", "A018"], ["0700-0855", "I", "DEDX", "A018"],["0700-0855", "I", "DEDX", "A018"]]

        #guardar clase-------------------------------------------
        claseOrd = []
        
        claseOrd.append(clase[0])#nrc
        claseOrd.append(clase[1])#clave
        claseOrd.append(clase[2])#nombreM
        claseOrd.append(clase[3])#sección
        claseOrd.append(clase[4])#creditos
        claseOrd.append(clase[5])#cuposTotales
        claseOrd.append(clase[6])#cuposDisponibles
        claseOrd.append(horarioJson)#horario
        claseOrd.append(ciclo)#ciclo
        claseOrd.append(clase[26])#profe
        
        if seCancelatodo:
            print("Se cancela todo clase triple")
        else:
            clasesOrdenadas.append(claseOrd)
            
        """
        print("nrc: " + clase[0])
        print("clave: " + clase[1])
        print("nombreM: " + clase[2])
        print("sección: " + clase[3])
        print("creditos: " + clase[4])
        print("cuposT: " + clase[5])
        print("cuposD: " + clase[6])
        
        print("horas1: " + clase[8])
        print("dia1: " + diasClase[0])
        print("edificio1: " + clase[10])
        print("aula1: " + clase[11])
        
        print("horas2: " + clase[14])
        print("dia2: " + diasClase[1])
        print("edificio2: " + clase[16])
        print("aula2: " + clase[17])
        
        print("horas3: " + clase[20])
        print("dia3: " + diasClase[2])
        print("edificio3: " + clase[22])
        print("aula3: " + clase[23])
        
        print("ciclo: " + clase[24])
        print("profe: " + clase[26])
        """
        
        #cont = cont + 1
    
    #si hay dos aulas
    if len(clase) == 21:
        #rutina para sacar datos de clases con dos aulas
        
        diasClase = []
        
        for dia in clase[9].split(" "):
            if not dia == ".":
                diasClase.append(dia)
        
        for dia in clase[15].split(" "):
            if not dia == ".":
                diasClase.append(dia)
                
        
        #print("-------------------------------------------CLASE DOBLE--------------------------------------------------")
        
        """
        print("nrc: " + clase[0])
        print("clave: " + clase[1])
        print("nombreM: " + clase[2])
        print("sección: " + clase[3])
        print("creditos: " + clase[4])
        print("cuposT: " + clase[5])
        print("cuposD: " + clase[6])
        """
        
        #guardar las materias
        materia = []
        materia.append(clase[2])#nombre materia
        materia.append(clase[1])#clave materia
        materia.append(clase[4])#creditos materia
        materia.append(carrera)
        
        #asegurarse que no se repitan
        nuevoMateria = True
        
        for m in materias:
            if m[1] == materia[1]:
                nuevoMateria = False
                break
                
        if nuevoMateria:
            materias.append(materia)
        
        #guardar los profes
        profe = []
        profe.append(clase[20])#nombre
        
        #verificar que no exista otro profe con el mismo nombre
        nuevoProfe = True
        
        for p in profes:
            if p[0] == profe[0]:
                nuevoProfe = False
                break
                
        if nuevoProfe:
            profes.append(profe)
        #guardamos el horario
        horario = []
        #Día 1
        dia1 = []
        dia1.append(clase[8])#horas1
        dia1.append(diasClase[0])#dia1
        dia1.append(clase[10])#edificio1
        dia1.append(clase[11])#aula1
        #Día 2
        dia2 = []
        dia2.append(clase[14])
        dia2.append(diasClase[1])
        dia2.append(clase[16])
        dia2.append(clase[17])
        
        horario.append(dia1)
        horario.append(dia2)
        
        seCancelatodo = False
        #evaluar horas iniciales dentro de los rangos validos
        if int(clase[8][0]+clase[8][1])<7 or int(clase[8][0]+clase[8][1])>21:
            seCancelatodo = True
        elif int(clase[14][0]+clase[14][1])<7 or int(clase[14][0]+clase[14][1])>21:
            seCancelatodo = True
            
        #evaluar horas finales dentro de los rangos validos
        if int(clase[8][5]+clase[8][6])<7 or int(clase[8][5]+clase[8][6])>21:
            seCancelatodo = True
        elif int(clase[14][5]+clase[14][6])<7 or int(clase[14][5]+clase[14][6])>21:
            seCancelatodo = True
        
        horarioJson = json.dumps(horario) #[["0700-0855", "L", "DEDX", "A018"], ["0700-0855", "I", "DEDX", "A018"]]
        
        claseOrd = []
        
        claseOrd.append(clase[0])#nrc
        claseOrd.append(clase[1])#clave
        claseOrd.append(clase[2])#nombreM
        claseOrd.append(clase[3])#sección
        claseOrd.append(clase[4])#creditos
        claseOrd.append(clase[5])#cuposTotales
        claseOrd.append(clase[6])#cuposDisponibles
        claseOrd.append(horarioJson)#horario
        claseOrd.append(ciclo)#ciclo
        claseOrd.append(clase[20])#profe
        
        if seCancelatodo:
            print("Se cancela todo clase doble")
        else:
            clasesOrdenadas.append(claseOrd)
        """
        print("horas1: " + clase[8])
        print("dia1: " + diasClase[0])
        print("edificio1: " + clase[10])
        print("aula1: " + clase[11])
        
        print("horas2: " + clase[14])
        print("dia2: " + diasClase[1])
        print("edificio2: " + clase[16])
        print("aula2: " + clase[17])
        
        print("ciclo: " + clase[18])
        print("profe: " + clase[20])
        """
        ##cont = cont + 1

    
    #si hay una o menos aulas
    elif len(clase) == 15:
        #rutina para clases con solo una aula
        
        #dividir los dias
        diasClase = []
        
        for dia in clase[9].split(" "):
            if not dia == ".":
                diasClase.append(dia)
        
        
        if len(diasClase) == 1:
            
            #print("-------------------------------------------CLASE 4 HORAS--------------------------------------------------")
            #Clases con un solo dia de 4 horas
            
            #Guardar horario-------------------------------------------
            horario = []
            dia1 = []
            
            dia1.append(clase[8])
            dia1.append(diasClase[0])
            dia1.append(clase[10])
            dia1.append(clase[11])
            
            horario.append(dia1)
            horarioJson = json.dumps(horario)
            
            seCancelatodo = False
            #evaluar horas iniciales dentro de los rangos validos 0049-0049
            if int(clase[8][0]+clase[8][1])<7 or int(clase[8][0]+clase[8][1])>21:
                seCancelatodo = True
            
            #evaluar horas finales dentro de los rangos validos
            if int(clase[8][5]+clase[8][6])<7 or int(clase[8][5]+clase[8][6])>21:
                seCancelatodo = True
            
            #guardar materia--------------------------------
            materia = []
            materia.append(clase[2])#nombre materia
            materia.append(clase[1])#clave materia
            materia.append(clase[4])#creditos materia
            materia.append(carrera)
            
            #asegurarse que no se repitan
            nuevoMateria = True
            
            for m in materias:
                if m[1] == materia[1]:
                    nuevoMateria = False
                    break
            
            if nuevoMateria:
                materias.append(materia)
            
            #guardar profe--------------------------------
            profe = []
            profe.append(clase[14])#nombre
            
            #verificar que no exista otro profe con el mismo nombre
            nuevoProfe = True
            
            for p in profes:
                if p[0] == profe[0]:
                    nuevoProfe = False
                    break
            
            if nuevoProfe:
                profes.append(profe)
            
            #guardar clase--------------------------------
            claseOrd = []
            
            claseOrd.append(clase[0])#nrc
            claseOrd.append(clase[1])#clave
            claseOrd.append(clase[2])#nombreM
            claseOrd.append(clase[3])#sección
            claseOrd.append(clase[4])#creditos
            claseOrd.append(clase[5])#cuposTotales
            claseOrd.append(clase[6])#cuposDisponibles
            claseOrd.append(horarioJson)#horario
            claseOrd.append(ciclo)#ciclo
            claseOrd.append(clase[14])#profe
            
            if seCancelatodo:
                print("Se cancela todo clase 4horas")
            else:
                clasesOrdenadas.append(claseOrd)
            """
            print("nrc: " + clase[0])
            print("clave: " + clase[1])
            print("nombreM: " + clase[2])
            print("sección: " + clase[3])
            print("creditos: " + clase[4])
            print("cuposT: " + clase[5])
            print("cuposD: " + clase[6])
            
            print("horas1: " + clase[8])
            print("dia1: " + diasClase[0])
            print("edificio1: " + clase[10])
            print("aula1: " + clase[11])
            
            print("ciclo: " + clase[12])
            print("profe: " + clase[14])
            """
            
            ##cont = cont + 1
            
        else:
            #clases con dos dias
            
            
            #print("-------------------------------------------CLASE NORMAL--------------------------------------------------")
            
            #guardar las materias
            materia = []
            materia.append(clase[2])#nombre materia
            materia.append(clase[1])#clave materia
            materia.append(clase[4])#creditos materia
            materia.append(carrera)
            
            #asegurarse que no se repitan
            nuevoMateria = True
            
            for m in materias:
                if m[1] == materia[1]:
                    nuevoMateria = False
                    break
                    
            if nuevoMateria:
                materias.append(materia)
            
            #guardar los profes
            profe = []
            profe.append(clase[14])#nombre
            
            #verificar que no exista otro profe con el mismo nombre
            nuevoProfe = True
            
            
            for p in profes:
                if p[0] == profe[0]:
                    nuevoProfe = False
                    break
                    
            if nuevoProfe:
                profes.append(profe)
            
            #guardamos el horario---------------------------------------
            horario = []
            #Día 1
            dia1 = []
            dia1.append(clase[8])#horas1
            dia1.append(diasClase[0])#dia1
            dia1.append(clase[10])#edificio1
            dia1.append(clase[11])#aula1
            #Día 2
            dia2 = []
            dia2.append(clase[8])
            dia2.append(diasClase[1])
            dia2.append(clase[10])
            dia2.append(clase[11])
            
            horario.append(dia1)
            horario.append(dia2)
            
            horarioJson = json.dumps(horario) #[["0700-0855", "L", "DEDX", "A018"], ["0700-0855", "I", "DEDX", "A018"]]
            
            seCancelatodo = False
            #evaluar horas iniciales dentro de los rangos validos
            if int(clase[8][0]+clase[8][1])<7 or int(clase[8][0]+clase[8][1])>21:
                seCancelatodo = True
                
            #evaluar horas finales dentro de los rangos validos
            if int(clase[8][5]+clase[8][6])<7 or int(clase[8][5]+clase[8][6])>21:
                seCancelatodo = True
            
            #guardar la clase ---------------------------------------
            claseOrd = []
            
            claseOrd.append(clase[0])#nrc
            claseOrd.append(clase[1])#clave
            claseOrd.append(clase[2])#nombreM
            claseOrd.append(clase[3])#sección
            claseOrd.append(clase[4])#creditos
            claseOrd.append(clase[5])#cuposTotales
            claseOrd.append(clase[6])#cuposDisponibles
            claseOrd.append(horarioJson)#horario
            claseOrd.append(ciclo)#ciclo
            claseOrd.append(clase[14])#profe
            
            if seCancelatodo:
                print("Se cancela todo clase normal")
            else:
                clasesOrdenadas.append(claseOrd)
                
            #cont = cont + 1
        
        #mandar los datos a bd
    else:
        pass
    #cont = 0             
    #print(cont)   

profes = []
materias = []
clasesOrdenadas = []

for clase in clases:
    guardarTodo(clase, profes, materias, clasesOrdenadas)

MateriasGuardadas = 0 
MateriasNo_guardadas = 0
    
for materia in materias:
    #aqui mandamos los materias
    #materia[0]#nombre
    #materia[1]#clave
    #materia[2]#creditos
    #materia[3]#carrera
    
    #aqui mandamos los datos de los profes  
    driver.get("http://localhost/QAPP/subirMaterias.php?nombre="+str(materia[0])+"&clave="+str(materia[1])+"&creditos="+str(materia[2])+"&carrera="+str(materia[3]))

    
    #print("https://qclowns.000webhostapp.com/subirMaterias.php?nombre="+str(materia[0])+"&clave="+str(materia[1])+"&creditos="+str(materia[2])+"&carrera="+str(materia[3]))

    #procesamos los datos de la pagina
    html = driver.page_source
    soup = bs4.BeautifulSoup(html, "html.parser")

    if soup.text == "1":
        #si se metio el profe
        #print("Se guardo la materia: " + str(materia[0]) )
        MateriasGuardadas = MateriasGuardadas + 1
    else:
        #si no se metio
        MateriasNo_guardadas = MateriasNo_guardadas + 1
    
    


guardados = 0
no_guardados = 0

for profe in profes:
    for dato in profe:
        #aqui mandamos los datos de los profes  
        driver.get("http://localhost/QAPP/subirProfes.php?profe="+dato)

        #procesamos los datos de la pagina
        html = driver.page_source
        soup = bs4.BeautifulSoup(html, "html.parser")

        if soup.text == "1":
            #si se metio el profe
            #print("Se guardo profe: " + dato )
            guardados = guardados + 1
        else:
            #si no se metio
            no_guardados = no_guardados + 1



claseGuardadas = 0 
claseNo_guardadas = 0
  
for clase in clasesOrdenadas:

    driver.get("http://localhost/QAPP/subirClase.php?nrc="+str(clase[0])+"&seccion="+str(clase[3])+
    "&horario="+str(clase[7])+"&clave_materia="+str(clase[1])+"&codigo_profesor="+str(clase[9])+"&ciclo="+str(clase[8]))

    #procesamos los datos de la pagina
    html = driver.page_source
    soup = bs4.BeautifulSoup(html, "html.parser")

    if soup.text == "1":
        #si se metio el clase
        #print("Se guardo la clase: " + str(clase[2]))
        claseGuardadas = claseGuardadas + 1
    else:
        #si no se metio
        #print("https://qclowns.000webhostapp.com/subirClase.php?nrc="+str(clase[0])+"&seccion="+str(clase[3])+"&horario="+str(clase[7])+"&clave_materia="+str(clase[1])+"&codigo_profesor="+str(clase[9])+"&ciclo="+str(clase[8]))
        claseNo_guardadas = claseNo_guardadas + 1
        
    #aqui mandamos los datos de las clases
    #clase[0]#nrc
    #clase[1]#clave
    #clase[2]#nombreM
    #clase[3]#sección
    #clase[4]#creditos
    #clase[5]#cuposTotales
    #clase[6]#cuposDisponibles
    #clase[7]#horario
    #clase[8]#ciclo
    #clase[9]#profe



print ("clases guardadas: " + str(claseGuardadas) + " no guardadas: " + str(claseNo_guardadas) )
print ("profes guardados: " + str(guardados) + " no guardados: " + str(no_guardados) )
print ("materias guardadas: " + str(MateriasGuardadas) + " no guardadas: " + str(MateriasNo_guardadas) )
time.sleep(30)





     