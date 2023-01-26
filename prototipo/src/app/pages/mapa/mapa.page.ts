import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

//import del service
import { ApiserviceService } from './../../servicios/apiservice.service';

//imports para geolocalizacion
import { Geolocation } from '@capacitor/geolocation';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Capacitor } from "@capacitor/core";

//tarjetas de las clases
import { IonSlides } from '@ionic/angular'; 

//Lineas animadas
import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import { TripsLayer } from "deck.gl" ;
import { Socket } from 'ngx-socket-io';

//Lineas animadas
const _GoogleMapsOverlay = GoogleMapsOverlay;
const _TripsLayer = TripsLayer;
 
//Color, coordenada y tiempo entre puntos
interface Data { 
  vendor: number;
  path: [number, number][];
  timestamps: number[];
}
 
//Coordenadas de Dijkstra
const DATA_URL = "https://qclowns.000webhostapp.com/prueba.json";

//Tiempo de animacion y colores
const VENDOR_COLORS = [
  [3, 32, 252], // vendor #0
  //[0, 0, 255], // vendor #1
];

declare var google;

//var map = new google.maps.Map(document.getElementById('map') as HTMLElement); 
var map : google.maps.Map; 
var marker : google.maps.Marker;
var markerPosicionActual : google.maps.Marker;
var lineasRuta : google.maps.Polyline;
var grafoMapa : Grafo;


class Arista{
  nodoOrigen: Number;
  nodoDestino: Number;
  peso: Number;
  constructor(_nodoOrigen: Number,_nodoDestino: Number,_peso: Number){
    this.nodoOrigen = _nodoOrigen;
    this.nodoDestino = _nodoDestino;
    this.peso = _peso;
  }
}

class Nodo{
  id:string;
  aristas: Array<Arista>;

  constructor(_id:string , _aristas: Array<Arista>){
    this.id = _id;
    this.aristas = _aristas; 
  } 
}

class Grafo{
  listaDeNodos: Array<Nodo>;
  constructor(){
    this.listaDeNodos = [];
  }
  
  //arreglar esta wea
  nuevoNodo(nodo:Nodo){
    
    if (!this.listaDeNodos[parseInt(nodo.id)])
    {
      this.listaDeNodos[parseInt(nodo.id)] = nodo;
      //this.listaDeNodos[nodo.id].aristas = [];
    }
  }

  nuevaArista(n1:Nodo,n2:Nodo,p:Number){
    var AristaAux1 = new Arista(Number(n1.id),Number(n2.id),p);
    var AristaAux2 = new Arista(Number(n2),Number(n1),p);
    this.listaDeNodos[n1.id].aristas.push(AristaAux1);
    this.listaDeNodos[n2.id].aristas.push(AristaAux2);
  }

  quitarArista(n1:Nodo,n2:Nodo) {
    this.listaDeNodos[n1.id].aristas = this.listaDeNodos[n1.id].aristas.filter(el => el !== n2.id);
    this.listaDeNodos[n2.id].aristas = this.listaDeNodos[n2.id].aristas.filter(el => el !== n1.id);
  }

  removerNodo(nodo:Nodo) {
    while(this.listaDeNodos[nodo.id].length) {
      const adjacentVertex = this.listaDeNodos[nodo.id].pop();
      this.quitarArista(nodo, adjacentVertex);
    }
    delete this.listaDeNodos[nodo.id];
  }
}

class clase {
  //Atributos clase Clase
  nombre: string;

  horario: string;
  dia: string;
  edificio: string;
  aula: string;

  flechaAdelante: string;//boolean;
  flechaAtras: string;//boolean;
}

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})

export class MapaPage implements OnInit {

  nombreUsuario:string;

  //Lista de clases del horario actual del alumno
  clases: clase[]=[];
  ruta = [];
  rutaFueraCucei = [[],[]];
  timeStamp = [];
  LOOP_LENGTH = 300; 
  velocidadRuta = 150; //tiempo de viaje de la linea
  tiempoIntervalo = 6000; //tiempo de peticion para recalcular camino
  overlay;
  polyCucei;

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();

  //-103.32725067110374

  grafoCucei2 = [
    ["000", 20.654811505548903, -103.32603911051568, "",["002", "003", "004"]],
    ["001", 20.653603497956226, -103.32558140032717, "",["002"]],
    ["002", 20.653947343356702, -103.32584023349396, "A",["001", "003", "004", "005","000"]],
    ["003", 20.654010088783814, -103.32572221629873, "",["002","005","000"]],
    ["004", 20.654076598908276, -103.32598641388348, "",["002","000"]],
    ["005", 20.65433134497047, -103.32595959179535, "",["002", "003"]],
  ];

  cuceiEntradas = [
    ["150",20.659433595146243, -103.32449565520099,"",["141"]],
    ["009", 20.65452209051408, -103.32673206798312, "",["008"]],
    ["014", 20.65387581354416, -103.3247096824026, "",["013"]],
  ];
  
  grafoCucei = [
    //["",,"",],
    ["000", 20.654811505548903, -103.32603911051568, "",["008", "019", "020"]],
    ["001", 20.653603497956226, -103.32558140032717, "",["002"]],
    ["002", 20.653947343356702, -103.32584023349396, "A",["001", "003", "004"]],
    ["003", 20.654010088783814, -103.32572221629873, "",["002"]],
    ["004", 20.654076598908276, -103.32598641388348, "",["002"]],
    ["005", 20.65433134497047, -103.32595959179535, "",["002", "006"]],
    ["006", 20.654544678782205, -103.32611515991945, "",["005", "007", "008"]],
    ["007", 20.65469526717516, -103.32591131203452, "",["006", "010", "019"]],
    ["008", 20.654685227953827, -103.32622781269443, "",["000", "006", "009"]],
    ["009", 20.65452209051408, -103.32673206798312, "",["008"]],
    ["010", 20.654379031381325, -103.32534402483174, "",["007", "011", "012", "017"]],
    ["011", 20.654490717906402, -103.32531854384641, "D",["010"]],
    ["012", 20.654296207609068, -103.32485183947864, "",["010", "013", "022"]],
    ["013", 20.6540402065856, -103.32470431798463, "",["012", "014", "015"]],
    ["014", 20.65387581354416, -103.3247096824026, "",["013"]],
    ["015", 20.65409667743666, -103.3249349879571, "",["013", "016", "017"]],
    ["016", 20.6540025593399, -103.32491353028526, "B",["015"]],
    ["017", 20.6540025593399, -103.32491353028526, "",["010", "015", "018"]],
    ["018", 20.654207109262554, -103.32509323828707, "C",["017"]],
    ["019", 20.65484056760262, -103.32573605261702, "CID",["000", "007", "021"]],
    ["020", 20.655091753760036, -103.32605153652263, "",["000", "021", "023"]],
    ["021", 20.65510179295454, -103.32577258678847, "",["019", "020", "022", "024"]],
    ["022", 20.655157008512383, -103.32515701982703, "",["012", "021", "025"]],
    ["023", 20.655395439099998, -103.32604483100019, "",["020", "024", "026"]],
    ["024", 20.655402968480896, -103.32582086655016, "",["021", "023", "025", "026"]],
    ["025", 20.6551582634112, -103.32515836093152, "",["022", "024", "032"]],
    ["026", 20.655551382196954, -103.32593786615591, "E",["023", "024", "027", "028"]],
    ["027", 20.65563656730831, -103.32609149141688, "",["026", "033", "036"]],
    ["028", 20.65565786357868, -103.3258013103684, "F",["026", "029"]],
    ["029", 20.655854853945772, -103.32581458662597, "",["028", "030", "037", "047"]],
    ["030", 20.655867276752677, -103.3255338886183, "",["029", "031", "049"]],
    ["031", 20.655843040114135, -103.32514067423537, "",["030", "032"]],
    ["032",20.655874412439648, -103.3249998582638,"",["025", "031", "050"]],
    ["033",20.655718962461393, -103.32620470419434,"",["027", "034", "038"]],
    ["034",20.655692100535564, -103.32663292169329,"",["033", "035", "041"]],
    ["035",20.65559584526191, -103.32692318457944,"",["034"]],
    ["036",20.655827050941024, -103.32610462329578,"",["027", "037", "038", "045"]],
    ["037",20.655824940470495, -103.3259523797513,"",["029", "036"]],
    ["038",20.655824940470495, -103.32618807531277,"",["033", "036", "039"]],
    ["039",20.655890365043568, -103.32621965175163,"",["038", "040"]],
    ["040",20.655890365043568, -103.3263414465872,"",["039", "041"]],
    ["041",20.655865039405708, -103.32667525465509,"",["034", "040", "042", "043"]],
    ["042",20.655886144104205, -103.32686696874815,"G",["041"]],
    ["043",20.65608241766164, -103.32670795882633,"",["041", "051"]],
    ["044",20.656021214106968, -103.32633693566979,"H",["052"]],
    ["045",20.656043374017546, -103.3261463493067,"",["036", "053"]],
    ["046",20.656059202523778, -103.32597042342891,"",["045", "047"]],
    ["047",20.656059202523778, -103.32583058491399,"",["029", "046", "055"]],
    ["048",20.65609085952999, -103.32558925070273,"I",["056"]],
    ["049",20.65597583904161, -103.32516522423313,"",["030", "057"]],
    ["050",20.656028600743902, -103.32490471861257,"",["032", "062"]],
    ["051",20.656125710357266, -103.32654064560512,"",["043", "052", "063"]],
    ["052",20.656153834500113, -103.32634340988915,"",["044", "051", "053"]],
    ["053",20.656164501069707, -103.32614157366127,"",["045", "052", "054"]],
    ["054",20.65622222602271, -103.32596924173225,"J",["053", "055"]],
    ["055",20.656182696981976, -103.32586932944767,"",["047", "054", "056", "058"]],
    ["056",20.656139336604475, -103.32560267531778,"",["048", "055", "057"]],
    ["057",20.65615516510005, -103.32545155950328,"",["049", "056", "059"]],
    ["058",20.656275461612605, -103.32584626498895,"K",["055", "059", "064"]],
    ["059",20.656291290094018, -103.32546283680287,"",["057", "058", "060", "065"]],
    ["060",20.65629234532774, -103.3252327798866,"Beta",["059", "061", "066"]],
    ["061",20.65631978135808, -103.3249598692365,"",["060", "062", "067"]],
    ["062",20.656262798827623, -103.32466327625426,"",["050", "061", "068"]],
    ["063",20.656425927149158, -103.32656072737797,"",["051", "064", "069"]],
    ["064",20.65649145785234, -103.32588360287453,"",["058", "063", "071", "072"]],
    ["065",20.656378766167844, -103.32546897882064,"",["059", "066", "073"]],
    ["066",20.656392197070662, -103.32524410482924,"Alfa",["060", "065", "067"]],
    ["067",20.65640413564995, -103.32499052351979,"CTA",["061", "066"]],
    ["068",20.656526506033973, -103.3243270654897,"",["062", "088"]],
    ["069",20.656727588717334, -103.32658448235647,"",["063", "070", "081"]],
    ["070",20.65679911719371, -103.3262143375169,"",["069", "071", "074", "075"]],
    ["071",20.656812920930896, -103.32590454237945,"",["064", "070", "084"]],
    ["072",20.65672005940576, -103.3256577791463,"",["064", "073", "076"]],
    ["073",20.656658569983822, -103.32548343556245,"L",["065", "072", "085"]],
    ["074",20.656726333835156, -103.3261901976293,"M",["070"]],
    ["075",20.65687817494792, -103.32620092646523,"N",["070"]],
    ["076",20.656846802829616, -103.32566716687775,"",["072"]],
    ["077",20.656982330333033, -103.32518436925602,"",["078", "086"]],
    ["078",20.65691456659584, -103.32503952997098,"",["077", "079"]],
    ["079",20.65687692006212, -103.32475253360988,"",["062", "078", "080", "087"]],
    ["080",20.65704632939042, -103.324580872235,"",["079", "087"]],
    ["081",20.657023001883406, -103.32659508449612,"",["069", "082", "083", "089"]],
    ["082",20.65714224248289, -103.32630413016668,"",["081", "083"]],
    ["083",20.65705360346211, -103.32608309509469,"",["081", "082", "084"]],
    ["084",20.657070487089108, -103.32592746836033,"",["071", "083", "093"]],
    ["085",20.657090657162147, -103.32552678740872,"",["073", "086"]],
    ["086",20.65708061809903, -103.32552812851321,"",["077", "085", "087"]],
    ["087",20.657159675704577, -103.32480527318747,"",["079", "080", "086", "088", "098"]],
    ["088",20.657201086815732, -103.3243814841618,"",["068", "087", "100"]],
    ["089",20.657259333893816, -103.32659653319855,"",["081", "090", "107", "112"]],
    ["090",20.657275305926337, -103.3264808401008,"",["089"]],
    ["091",20.657310799325934, -103.32606548291376,"",["092"]],
    ["092",20.65731257399569, -103.32595168642418,"",["091", "115", "093"]],
    ["093",20.65722384048222, -103.32593841016705,"",["092", "094", "084"]],
    ["094",20.65722384048222, -103.32582840689378,"",["093", "116", "095"]],
    ["095",20.657250460544002, -103.32540546326662,"",["094", "096", "097"]],
    ["096",20.657321447346487, -103.32541304969928,"P",["095"]],
    ["097",20.657278855268977, -103.3249844162551,"",["095", "119", "098"]],
    ["098",20.65737646209561, -103.32480803169624,"",["097", "122", "099", "087"]],
    ["099",20.65741727947725, -103.32474923684327,"",["098", "100"]],
    ["100",20.657445674171054, -103.32440026094184,"",["099", "123", "088"]],
    ["101",20.657244498096624, -103.32777177036719,"",["104", "102"]],
    ["102",20.657036257306057, -103.32727786806628,"",["101", "103", "105"]],
    ["103",20.657100190912445, -103.32706898448444,"",["102", "106"]],
    ["104",20.65740341850798, -103.32775615290313,"Z",["101", "108"]],
    ["105",20.657237191407045, -103.32732667264146,"",["109", "102"]],
    ["106",20.657270071507376, -103.32708460194851,"Y",["110", "107", "103"]],
    ["107",20.657270071507376, -103.32682886597449,"",["106", "111", "089"]],
    ["108",20.657715778832166, -103.32749456038012,"Z2",["104", "110"]],
    ["109",20.65740889851921, -103.3273383857395,"",["104", "105", "110"]],
    ["110",20.657427165221844, -103.32709241068054,"",["109", "108", "111", "106"]],
    ["111",20.65761066307945, -103.32690278316744,"",["110", "107", "124"]],
    ["112",20.657503140344303, -103.32660073176793,"",["124", "089", "113"]],
    ["113",20.65750163628013, -103.32622695952665,"",["112", "114", "115"]],
    ["114",20.65743755376826, -103.32618401085308,"",["113"]],
    ["115",20.657557029616076, -103.32598435755975,"",["113", "092", "116"]],
    ["116",20.657597216925584, -103.325856672314,"",["115", "094", "117", "126"]],
    ["117",20.65759613078516, -103.3256593405631,"R",["115", "118", "120"]],
    ["118",20.657424520036663, -103.3254562049449,"",["117", "120", "119"]],
    ["119",20.65745058750568, -103.32500118115388,"",["118", "097"]],
    ["120",20.65762762894053, -103.32547129501319,"",["117", "127", "121", "118"]],
    ["121",20.657708003511598, -103.32481661793506,"",["120", "122", "123"]],
    ["122",20.65763523194232, -103.32481429638511,"Q",["121", "098"]],
    ["123",20.6577275540765, -103.32442195444821,"",["121", "129", "100"]],
    ["124",20.65775222883314, -103.32660286168644,"",["111", "130", "125"]],
    ["125",20.657780468528987, -103.32619426890008,"",["124", "136", "126"]],
    ["126",20.657804363652136, -103.32586925191093,"",["125", "137", "116", "127"]],
    ["127",20.657803277512773, -103.32547923151606,"",["126", "132", "128", "118"]],
    ["128",20.657816311214837, -103.32513796367746,"",["127", "139", "129"]],
    ["129",20.657873876720927, -103.32443801636494,"",["128", "141", "123"]],
    ["130",20.6578807146636, -103.32660503427425,"",["135", "124", "131"]],
    ["131",20.657898092923894, -103.32652494080193,"",["130"]],
    ["132",20.65789700678452, -103.32548256487868,"T",["127", "138"]],
    ["133",20.657977963763212, -103.32700496234571,"",["134"]],
    ["134",20.658001858855318, -103.32669387465609,"W",["133", "135"]],
    ["135",20.65799968657437, -103.32661145963385,"",["134", "130", "136", "146"]],
    ["136",20.658004031136226, -103.32622492157175,"V2",["135", "125", "137"]],
    ["137",20.65801706482106, -103.32584534815943,"",["148", "136", "138", "126"]],
    ["138",20.65800837569873, -103.32548666868442,"U",["149", "137", "132", "139"]],
    ["139",20.65801815096219, -103.32514075774594,"",["138", "128"]],
    ["140",20.65807028568999, -103.32475886277422,"",["141"]],
    ["141",20.658071371830232, -103.32445357895679,"",["129", "140", "150"]],
    ["142",20.658151243234716, -103.32725067110374,"",["143", "144", "145"]],
    ["143",20.658071955038046, -103.32697440666296,"",["142"]],
    ["144",20.65826311555142, -103.32700922991181,"X",["142"]],
    ["145",20.658182741273965, -103.32680725506854,"",["142", "146"]],
    ["146",20.65820120563876, -103.32661456642498,"",["135", "145", "151", "147"]],
    ["147",20.658207722472866, -103.32646250490505,"",["146", "152", "148"]],
    ["148",20.658218583861462, -103.32584149029393,"",["137", "147"]],
    ["149",20.658105625373143, -103.32547468539893,"",["138"]],
    ["150",20.659433595146243, -103.32449565520099,"",["141"]],
    ["151",20.658398325460208, -103.3266295631938,"",["146"]],
    ["152",20.658295411377267, -103.32647525432667,"V1",["147"]],  
  ];

  //nombre siiau/numero de nodo/nombre/icono
  coordsEdificios = [
    ["DEDX", 144, "Modulo X",""],
    ["DEDU", 138, "Modulo U",""],
    ["DEDT", 132, "Modulo T",""],
    ["DEDW", 134, "Modulo W",""],
    ["DEDN", 75, "Modulo N",""],
    ["DEDQ", 122, "Modulo Q",""],
    ["DEDR", 117, "Modulo R",""],
    ["DEDV1", 152, "Modulo V1",""],
    ["DEDV2", 136, "Modulo V2",""],
    ["DESV1", 9,"Clase online, ve a tu casa",""],
    ["DESV2", 14,"Clase online, ve a tu casa",""],
    ["DUCT1", 66,"Modulo Alfa",""],
    ["DUCT2", 60,"Modulo Beta",""],
    ["DEDZ2", 108, "Modulo Z2",""],
    ["DEDY", 106, "Modulo Y",""],
    ["DEDZ", 104, "Modulo Z",""],
    ["DEDP", 96, "Modulo P",""],
    ["DEDM", 74, "Modulo M",""],
    ["DEDL", 73, "Modulo L",""],
    ["CTA", 67, "Modulo GAMMA / CTA",""],
    ["DEDK", 58, "Modulo K",""],
    ["DEDJ", 54, "Modulo J",""],
    ["DEDI", 48, "Modulo I",""],
    ["DEDH", 44, "Modulo H",""],
    ["DEDG", 42, "Modulo G",""],
    ["DEDF", 28, "Modulo F",""],
    ["DEDE", 26, "Modulo E",""],
    ["SID", 19, "Modulo CID / BIBLIOTECA",""],
    ["DEDC", 18, "Modulo C",""],
    ["DEDB", 16, "Modulo B",""],
    ["DEDD", 11, "Modulo D",""],
    ["DEDA", 2, "Modulo A / PROULEX",""],
  ];

  

  coordsPolygonoCucei = [
    {lat: 20.65331053656428, lng:-103.32584525496068},
    {lat: 20.65735863188828, lng:-103.32082834813819},
    {lat: 20.660830197797434, lng:-103.32619311516599},
    {lat: 20.657447619209716, lng:-103.32890573041782},
    {lat: 20.65331053656428, lng:-103.32584525496068},
  ]

  busqueda: string;
  map: any;
  interval: any;
  marcadosresBusqueda = new Array();

  constructor(private route: Router, private servicio: ApiserviceService,private socket: Socket,) {
    this.nombreUsuario = "nombreUsuario";
    var $this = this;
    this.interval = setInterval(function(){
      $this.mostrarAula();
    }, this.tiempoIntervalo);
  }

  ocultarFlechas(){
    for (let index = 0; index < this.clases.length; index++) {
      let flechaAt = document.getElementById("flechaAt"+index);
      let flechaAd = document.getElementById("flechaAd"+index);
      flechaAd.style.display = "none";
      flechaAt.style.display = "none";
    }
  }

  asignarNombre(){
    this.nombreUsuario = this.servicio.getNombre();
    var fieldNameElement = document.getElementById('nombreUsuarioMapa');
    document.getElementById("nombreUsuarioMenuMapa").innerText = this.servicio.getNombre();
    document.getElementById("codigoUsuarioMenuMapa").innerText = "codigo: "+this.servicio.getCodigo();
    fieldNameElement.textContent = this.nombreUsuario; 
  }

  //sideMenu
  cerrar(){
    this.servicio.limpiarTodo();
    this.route.navigate(['/login']);
  }

  menu(){
    this.route.navigate(['/menu']);
  }
  //sideMenu ends
  
  incializarGrafo(){
    grafoMapa = new Grafo;
    this.grafoCucei.forEach(edificio => {
      var listaAd = new Array<Arista>();

      var i = 0;

      while(edificio[4][i] !== undefined){

        var latOrigen = Number(edificio[1]);
        
        var latDestino = Number(this.grafoCucei[parseInt(edificio[4][i])][1]);
        var lngOrigen = Number(edificio[2]);
        var lngDestino = Number(this.grafoCucei[parseInt(edificio[4][i])][2]);

        var distance = this.distanceBetweenTwoCoordinates(latOrigen, lngOrigen, latDestino, lngDestino);

        var arista = new Arista(this.grafoCucei.indexOf(edificio),parseInt(edificio[4][i]),distance)

        listaAd.push(arista);
        i-=-1;//ROBUSTO, POTENTE, MACIZO.
      }

      var nodo = new Nodo(edificio[0].toString(),listaAd);
      grafoMapa.nuevoNodo(nodo);
    });
  }

  //prueba  
  @ViewChild('fichas') theSlides: IonSlides
  
  slideOpts = {
    on: {
      beforeInit() {
        const swiper = this;
        swiper.classNames.push(`${swiper.params.containerModifierClass}flip`);
        swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
        const overwriteParams = {
          slidesPerView: 1,
          slidesPerColumn: 1,
          slidesPerGroup: 1,
          watchSlidesProgress: true,
          spaceBetween: 0,
          virtualTranslate: true,
        };
        swiper.params = Object.assign(swiper.params, overwriteParams);
        swiper.originalParams = Object.assign(swiper.originalParams, overwriteParams);
      },
      setTranslate() {
        const swiper = this;
        const { $, slides, rtlTranslate: rtl } = swiper;
        for (let i = 0; i < slides.length; i += 1) {
          const $slideEl = slides.eq(i);
          let progress = $slideEl[0].progress;
          if (swiper.params.flipEffect.limitRotation) {
            progress = Math.max(Math.min($slideEl[0].progress, 1), -1);
          }
          const offset$$1 = $slideEl[0].swiperSlideOffset;
          const rotate = -180 * progress;
          let rotateY = rotate;
          let rotateX = 0;
          let tx = -offset$$1;
          let ty = 0;
          if (!swiper.isHorizontal()) {
            ty = tx;
            tx = 0;
            rotateX = -rotateY;
            rotateY = 0;
          } else if (rtl) {
            rotateY = -rotateY;
          }
  
           $slideEl[0].style.zIndex = -Math.abs(Math.round(progress)) + slides.length;
  
           if (swiper.params.flipEffect.slideShadows) {
            // Set shadows
            let shadowBefore = swiper.isHorizontal() ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
            let shadowAfter = swiper.isHorizontal() ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
            if (shadowBefore.length === 0) {
              shadowBefore = swiper.$(`<div class="swiper-slide-shadow-${swiper.isHorizontal() ? 'left' : 'top'}"></div>`);
              $slideEl.append(shadowBefore);
            }
            if (shadowAfter.length === 0) {
              shadowAfter = swiper.$(`<div class="swiper-slide-shadow-${swiper.isHorizontal() ? 'right' : 'bottom'}"></div>`);
              $slideEl.append(shadowAfter);
            }
            if (shadowBefore.length) shadowBefore[0].style.opacity = Math.max(-progress, 0);
            if (shadowAfter.length) shadowAfter[0].style.opacity = Math.max(progress, 0);
          }
          $slideEl
            .transform(`translate3d(${tx}px, ${ty}px, 0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
        }
      },
      setTransition(duration) {
        const swiper = this;
        const { slides, activeIndex, $wrapperEl } = swiper;
        slides
          .transition(duration)
          .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
          .transition(duration);
        if (swiper.params.virtualTranslate && duration !== 0) {
          let eventTriggered = false;
          // eslint-disable-next-line
          slides.eq(activeIndex).transitionEnd(function onTransitionEnd() {
            if (eventTriggered) return;
            if (!swiper || swiper.destroyed) return;
  
            eventTriggered = true;
            swiper.animating = false;
            const triggerEvents = ['webkitTransitionEnd', 'transitionend'];
            for (let i = 0; i < triggerEvents.length; i += 1) {
              $wrapperEl.trigger(triggerEvents[i]);
            }
          });
        }
      }
    }
  };

  LocationService = {
    // Check if application having GPS access permission
    checkGPSPermission: async (): Promise<boolean> => {
        return await new Promise((resolve, reject) => {
            if (Capacitor.isNative) {
                AndroidPermissions.checkPermission(AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION).then(
                    result => {
                        if (result.hasPermission) {
                            // If having permission show 'Turn On GPS' dialogue
                            resolve(true);
                        } else {
                            // If not having permission ask for permission
                            resolve(false);
                        }
                    },
                    err => { alert(err); }
                );
            }
            else { resolve(true);  }
        })
      },

    requestGPSPermission: async (): Promise<string> => {
        return await new Promise((resolve, reject) => {
            LocationAccuracy.canRequest().then((canRequest: boolean) => {
                if (canRequest) {
                    resolve('CAN_REQUEST');
                } else {
                    // Show 'GPS Permission Request' dialogue
                    AndroidPermissions.requestPermission(AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION)
                        .then(
                            (result) => {
                                if (result.hasPermission) {
                                    // call method to turn on GPS
                                    resolve('GOT_PERMISSION');
                                } else {
                                    resolve('DENIED_PERMISSION');
                                }
                            },
                            error => {
                                // Show alert if user click on 'No Thanks'
                                alert('requestPermission Error requesting location permissions ' + error);
                            }
                        );
                }
            });
        })
      },

      askToTurnOnGPS: async (): Promise<boolean> => {
        return await new Promise((resolve, reject) => {
            LocationAccuracy.canRequest().then((canRequest: boolean) => {
                if (canRequest) {
                    // the accuracy option will be ignored by iOS
                    LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
                        () => {
                            resolve(true);
                        },
                        error => { resolve(false); } );
                }
                else { resolve(false);  }
            });
        })
      },
  }
  
  ionViewWillLeave(){//Detener el intervalo cuando se sale del mapa
    clearInterval(this.interval);
    this.clases = [];
  }

  ionViewWillEnter(){
    this.asignarNombre();
    this.loadMap();
    this.incializarGrafo();

    this.polyCucei = new google.maps.Polyline({
      path: this.cuceiEntradas,
      geodesic: true,
      strokeColor: "#DE43DB",
      strokeOpacity: 1.0,
      strokeWeight: 5,
    });

    
    //--------------------------------------
    //traer datos con el método
    this.servicio.getHorario();
    this.socket.once(this.servicio.codigo, (response) => {
      let datos = JSON.parse(response);
      
      
      var arrayClases = Array.from(datos);
      arrayClases.forEach(cosaDentroDeArray => {

        //Funcion para sacar el time de today
        let date: Date = new Date();
        var diaDeHoy = "";
        
        if(date.getDay()==1){
          diaDeHoy = "L";
        }else if(date.getDay()==2){
          diaDeHoy = "M";
        }else if(date.getDay()==3){
          diaDeHoy = "I";
        }else if(date.getDay()==4){
          diaDeHoy = "J";
        }else if(date.getDay()==5){
          diaDeHoy = "V";
        }else if(date.getDay()==6){
          diaDeHoy = "S";
        }

        let c = new clase();
        c.nombre = cosaDentroDeArray['nombre'];//Nombre de la materia
        var horario = cosaDentroDeArray['horario']+"\n"; //Datos del horario de la clase [[horario 1],[horario 2], [\"horas\", \"dia\", \"edificio\", \"aula\"]]

        var arrayHorario = JSON.parse(horario);//Datos del horario separados

        var i = 0;        
        while(arrayHorario.length>i){
          if(arrayHorario[i][1] == diaDeHoy){

            c.horario = arrayHorario[i][0];
            c.dia = arrayHorario[i][1];
            c.edificio = arrayHorario[i][2];
            c.aula = arrayHorario[i][3];

            c.flechaAtras = "<";
            c.flechaAdelante = ">";

            if(this.clases.length == 0){//Primero de la lista, quitar flecha izquierda
              c.flechaAtras=" ";
            }
            this.clases.push(c);//Anadir la info de las clases en las fichas del mapa

            break;
          }
          i-=-1;
        }
      });
        
      if(this.clases.length == 0){//Mensaje para dias sin clases
        let c = new clase();
        c.nombre = "\n\n\n\n\n\n\n\n\nHOY NO TIENES NINGUNA CLASE\n\n\n\n\n\n\n\n\n";
        c.horario = " ";
        c.edificio = " ";
        c.aula = " ";
        c.flechaAdelante = " ";
        c.flechaAtras = " ";

        this.clases.push(c); 
      }else{//Quitar la flecha derecha al ultimo
        this.clases[this.clases.length-1].flechaAdelante = " ";
      }

    })

    /*
    
    this.servicio.getHorario().then((datos)=> { 
      var arrayClases = Array.from(datos);
      arrayClases.forEach(cosaDentroDeArray => {

        //Funcion para sacar el time de today
        let date: Date = new Date();
        var diaDeHoy = "";
        
        if(date.getDay()==1){
          diaDeHoy = "L";
        }else if(date.getDay()==2){
          diaDeHoy = "M";
        }else if(date.getDay()==3){
          diaDeHoy = "I";
        }else if(date.getDay()==4){
          diaDeHoy = "J";
        }else if(date.getDay()==5){
          diaDeHoy = "V";
        }else if(date.getDay()==6){
          diaDeHoy = "S";
        }

        let c = new clase();
        c.nombre = cosaDentroDeArray['nombre'];//Nombre de la materia
        var horario = cosaDentroDeArray['horario']+"\n"; //Datos del horario de la clase [[horario 1],[horario 2], [\"horas\", \"dia\", \"edificio\", \"aula\"]]
 
        var arrayHorario = JSON.parse(horario);//Datos del horario separados

        var i = 0;        
        while(arrayHorario.length>i){
          if(arrayHorario[i][1] == diaDeHoy){

            c.horario = arrayHorario[i][0];
            c.dia = arrayHorario[i][1];
            c.edificio = arrayHorario[i][2];
            c.aula = arrayHorario[i][3];

            c.flechaAtras = "<";
            c.flechaAdelante = ">";

            if(this.clases.length == 0){//Primero de la lista, quitar flecha izquierda
              c.flechaAtras=" ";
            }
            this.clases.push(c);//Anadir la info de las clases en las fichas del mapa

            break;
          }
          i-=-1;
        }
      });
      
      if(this.clases.length == 0){//Mensaje para dias sin clases
        let c = new clase();
        c.nombre = "\n\n\n\n\n\n\n\n\nHOY NO TIENES NINGUNA CLASE\n\n\n\n\n\n\n\n\n";
        c.horario = " ";
        c.edificio = " ";
        c.aula = " ";
        c.flechaAdelante = " ";
        c.flechaAtras = " ";

        this.clases.push(c); 
      }else{//Quitar la flecha derecha al ultimo
        this.clases[this.clases.length-1].flechaAdelante = " ";
      }
      
    })*/
    this.ocultarFlechas();
  }

  ngOnInit(){ 
    
  }

  distanceBetweenTwoCoordinates(latOrigen, lngOrigen, latDestino, lngDestino){
    var R = 3958.8; // Radius of the Earth in miles
    var rlat1 = latOrigen * (Math.PI/180); // Convert degrees to radians
    var rlat2 = latDestino * (Math.PI/180); // Convert degrees to radians
    var difflat = rlat2-rlat1; // Radian difference (latitudes)
    var difflon = (lngDestino-lngOrigen) * (Math.PI/180); // Radian difference (longitudes)

    return 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
  }
 
  //QMap
  loadMap(){
    //Declaracion del mapa
    const mapEle: HTMLElement = document.getElementById('map');
    this.map = new google.maps.Map(mapEle, {});

    //Comprobación de permisos de localizacion
    if (!this.LocationService.checkGPSPermission()){
      this.LocationService.requestGPSPermission();
    }
    //Metodo para pedir permisos de geolocalizacion
    this.LocationService.askToTurnOnGPS();

    //Centrar el mapa con la posicion actual del dispositivo
    showCurrentPosition();

    google.maps.event.addListenerOnce(this.map, 'idle',() => {
      mapEle.classList.add('show-map');
    })

    google.maps.event.addListener(this.map, 'dragstart', function() {
      this.desefoncarBusqueda();
    })
  }

  //Metodos para cerrar el teclado
  desefoncarBusqueda(){
    document.getElementById("busqueda").inputMode = 'none';
  }

  enfocarBusqueda(){
    document.getElementById("busqueda").inputMode = 'text';
  }

  buscar(){//Barra de busqueda en el mapa
    this.marcadosresBusqueda.forEach(marcador => {
      marcador.setMap(null);
    }); 

    if(this.busqueda){
      this.coordsEdificios.forEach(edificio => {
        
        if((edificio[2]).toString().toLowerCase().includes(this.busqueda.toLowerCase())){
  
          var direccion={lat: this.grafoCucei[edificio[1]][1], lng: this.grafoCucei[edificio[1]][2]};
  
          const infoWindow = new google.maps.InfoWindow();
  
          var marker = new google.maps.Marker({
            position: direccion,
            map: map,
            title: edificio[2],
          });

          marker.addListener("click", () => {
            infoWindow.close();
            infoWindow.setContent(marker.getTitle());
            infoWindow.open(marker.getMap(), marker);
          });
          this.marcadosresBusqueda.push(marker);
        }
  
      });
    }
  }

  dentroCucei(currentCoords){
    //funcion que calcula si estas dentro o fuera de cucei
    return true;
  }

  mostrarAula(){
    console.log(this.clases);
    
    this.theSlides.getActiveIndex().then((index)=> {
      if(!this.clases[0].aula){//Si no hay clase seleccionada
        return;
      }

      //Coordenadas de la clase seleccionada
      var lat:number;
      var lng:number; 
      var idModulo;
      var nombreModulo;
      this.coordsEdificios.forEach(edificio => {
        if(edificio[0] == this.clases[index].edificio){
          lat = Number(this.grafoCucei[edificio[1]][1]);
          lng = Number(this.grafoCucei[edificio[1]][2]);
          idModulo = edificio[1];
          nombreModulo = edificio[2];
        }
      });
      
      //Dibujar la linea de la ruta desde la posicion actual hasta el aula seleccionada
      getPosition().then((currentCoords)=> {
        //Centrar el mapa en las coordenadas del usuario
        //buscar la coordenada del nodo del grafo mas cercano a la posicion actual
        var distanciaMin = this.distanceBetweenTwoCoordinates(currentCoords.coords.latitude, currentCoords.coords.longitude, this.grafoCucei[0][1], this.grafoCucei[0][2]);
        var id;

        if(google.maps.geometry.poly.containsLocation({lat: currentCoords.coords.latitude, lng:currentCoords.coords.longitude}, this.polyCucei)){
          //console.log("Dentro cucei");
          
          this.grafoCucei.forEach(nodo => {
            var latOrigen = currentCoords.coords.latitude;
            var lngOrigen = currentCoords.coords.longitude;
            var latDestino = nodo[1];
            var lngDestino = nodo[2];
            var distance = this.distanceBetweenTwoCoordinates(latOrigen, lngOrigen, latDestino, lngDestino);
  
            if(distance<distanciaMin){
              distanciaMin = distance;
              id = nodo[0];
            }
          });
        }else{
          //console.log("Fuera cucei");
          this.cuceiEntradas.forEach(nodo => {
            var latOrigen = currentCoords.coords.latitude;
            var lngOrigen = currentCoords.coords.longitude;
            var latDestino = nodo[1];
            var lngDestino = nodo[2];
            var distance = this.distanceBetweenTwoCoordinates(latOrigen, lngOrigen, latDestino, lngDestino);
  
            if(distance<distanciaMin){
              distanciaMin = distance;
              id = nodo[0];
            }
          });

          //console.log("WEA");

          var origin={lat: currentCoords.coords.latitude, lng:currentCoords.coords.longitude};
          var destiny={lat: parseFloat(this.grafoCucei[parseInt(id)][1].toString()), lng: parseFloat(this.grafoCucei[parseInt(id)][2].toString())};
           

          this.directionsService.route({
            origin: {
              query: currentCoords.coords.latitude+", "+currentCoords.coords.longitude,
            },
            destination: {
              query: this.grafoCucei[parseInt(id)][1]+", " + this.grafoCucei[parseInt(id)][2],
            },
            travelMode: google.maps.TravelMode.WALKING,
          }).then((response) => {
            let ruta = response.routes[0].legs[0].steps;

            console.log(response.routes[0]);  
            
            for(var q = 0; q<response.routes[0].legs.length; q++){
              console.log(response.routes[0].legs[q].start_location.lat() + " " + response.routes[0].legs[q].start_location.lng()); 
            }
            ruta.forEach(vector => {
              
              let latOrigen = vector.lat_lngs[0].lat();
              let lngOrigen = vector.lat_lngs[0].lng();
              let latDestino = vector.lat_lngs[1].lat();
              let lngDestino = vector.lat_lngs[1].lng();
              
              let tiempo = this.distanceBetweenTwoCoordinates(latOrigen,lngOrigen,latDestino,lngDestino);
              
              this.rutaFueraCucei[0].push([lngOrigen,latOrigen]);
              
              this.rutaFueraCucei[1].push(tiempo);
              
            });
            

            this.directionsRenderer.setDirections(response);
          })
          .catch((e) => console.log("Directions request failed due to " + status)
          );

          this.polyCucei.setMap(map);

          //this.directionsRenderer.setMap(map);
        }

        //obtener camino minimo
        this.disjktra(parseInt(id),parseInt(idModulo));        

        if(marker != null){
          marker.setMap(null);
        }

        const infoWindow = new google.maps.InfoWindow();

        //Crear marcador en las coordenadas del aula actual
        marker = new google.maps.Marker({
          position: {lat, lng},
          map: map,
          title: nombreModulo,
        }); 

        marker.addListener("click", () => {
          infoWindow.close();
          infoWindow.setContent(marker.getTitle());
          infoWindow.open(marker.getMap(), marker);
        });

        if(markerPosicionActual != null){
          markerPosicionActual.setMap(null);
        }

        markerPosicionActual = new google.maps.Marker({
          position: {lat:parseFloat(currentCoords.coords.latitude.toString()), lng:parseFloat(currentCoords.coords.longitude.toString())},
          map: map,
          title: "Tu",
          icon: "../../../assets/icon/QmonoChiquito.gif"
        });         

      })
    }) 
  }

  disjktra(idNodoOrigen,idNodoDestino){
    //limpiar datos
    this.ruta.splice(0);
    this.timeStamp.splice(0);

    let NodoOrigen = grafoMapa.listaDeNodos[idNodoOrigen];                      //Nodo mas cercano a la posicion actual del usuario
    let NodoDestino = grafoMapa.listaDeNodos[idNodoDestino];                    //Nodo destino seleccionado
    let listaDijkstra = [[]];                                                   //Lista con el camino de Dijkstra
    let listaAuxAristas =[];                                                    //Auxiliar para la lista de aristas a evaluar
    let listaAristas = [];							                                        //Aristas a evaluar en cada iteracion
    let aristaAux;							                                                //Arista a evaluar
    let nodoAux = NodoOrigen;						                                         //Nodo a evaluar
    listaDijkstra = [[parseInt(nodoAux.id), 0, parseInt(nodoAux.id)],];					//Inicializacion de la lista con el nodo origen
    let pesoAcumulado = 0;						                                          //Peso acumulado del camino
    //console.log("nodo Destino Algoritmo Dijkstra: " + NodoDestino.id);

    while(listaDijkstra[listaDijkstra.length-1][0] != parseInt(NodoDestino.id)){//Mientras el destino no forme parte del camino de Dijkstra
      //Buscar el peso del nodoAux
      for (let index = 0; index < listaDijkstra.length; index++) {
        let element = listaDijkstra[index];
        if (element[0] == parseInt(nodoAux.id)){
          pesoAcumulado = parseFloat(element[1]);                               //Se actualiza el peso acumulado con el peso del nodo agregado
        }
      }

      //Agregar las aristas del nuevo nodo a evaluar
      nodoAux.aristas.forEach(arista => {
        var aristaYPesoAcumulado = [arista,pesoAcumulado]
        listaAristas.push(aristaYPesoAcumulado);
      });
      
      //Eliminar aristas invalidas 
      let eliminar = [];
      let cont = 0;
      listaAristas.forEach(arista => {
        listaDijkstra.forEach(nodoDefinitivo => {
          if(arista[0].nodoDestino == nodoDefinitivo[0]){                   //Si la arista tiene como destino un nodo de la lista de Dijkstra
            eliminar.push(cont);                                            //Se agrega a eliminar
          }
        });
        cont++;
      });
      
      cont = 0;
      listaAristas.forEach(element => {                                     //Se recorre la lista de aristas para...
        if (cont == eliminar[0]){                                           //Eliminar repetidas
          eliminar.shift();
        }else{                                                              //Agregar aristas validas
          listaAuxAristas.push(listaAristas[cont])
        }
        cont++;
      });

      //Limpiar variables auxiliares y actalizar arista y lista de aristas
      listaAristas = listaAuxAristas.slice();                               //Copiar lista auxiliar a lista de aristas
      aristaAux = null;                                                     //Limpiar la arista a evaluar
      aristaAux=listaAristas[0];                                            //Inicializar arista auxiliar
      
      //Obtener arista de menor peso de la lista de aristas
      listaAristas.forEach(arista => {   
        if((arista[0].peso+arista[1])<(aristaAux[0].peso+aristaAux[1])){
          aristaAux=arista;
        }
      });      
      
      nodoAux=grafoMapa.listaDeNodos[parseInt(aristaAux[0].nodoDestino)];   //Actualiza nodo auxiliar con destino del nuevo nodo definitivo
      
      listaDijkstra.push([parseInt(nodoAux.id),[aristaAux[0].peso+aristaAux[1]],aristaAux[0].nodoOrigen]);    //Añade nuevo nodo Definitivo
      listaAuxAristas.splice(0);                                                                              //Limpia lista auxiliar

    }//Fin while
    
    //Agregar origen
    this.ruta.push([this.grafoCucei[listaDijkstra[listaDijkstra.length-1][2]][2] ,this.grafoCucei[listaDijkstra[listaDijkstra.length-1][2]][1]]);
    this.timeStamp.push(listaDijkstra[listaDijkstra.length-1][1]*this.velocidadRuta);

    //Dibujar el camino minimo obtenido
    this.dibujarDijkstra(listaDijkstra.length-1, listaDijkstra);   //Llamar a funcion para dibujar camino minimo

    //Agregar destino
    //idNodoDestino
    this.ruta.unshift([this.grafoCucei[idNodoDestino][2] ,this.grafoCucei[idNodoDestino][1]]);
    this.timeStamp.unshift((this.timeStamp[0])+20);

    let rutaFueraCuceiTiempoReversed = [];

    let tiempoAnterior =0;
    let tiempoActual=0;
    let listaAux = this.rutaFueraCucei[1].reverse();
    listaAux.forEach(element => {
      //añadir tiempo anterior
      tiempoActual=tiempoActual + (element*this.velocidadRuta);
      rutaFueraCuceiTiempoReversed.push((tiempoActual));
    });

    console.log(rutaFueraCuceiTiempoReversed);
    

    let timeStampReversed = [];

    this.timeStamp.reverse().forEach(element => {
      timeStampReversed.push((element+(rutaFueraCuceiTiempoReversed[rutaFueraCuceiTiempoReversed.length-1])));
    });

    //Convertir datos PD: ESTA PORQUERIA NO JALA SI NO SE PONE ASÍ, SINO LE DAN "AMCIAS"

    
    console.log(this.rutaFueraCucei[0]);
    

    let datos = [{
      vendor: 0, 
      path: this.rutaFueraCucei[0].concat(this.ruta.reverse()),
      timestamps: rutaFueraCuceiTiempoReversed.concat(timeStampReversed),
    }] 
  
    this.rutaFueraCucei[0];
    this.rutaFueraCucei[1];
    this.rutaFueraCucei=[[],[]];

    //ANIMACION MAMALONA

    if(this.overlay){
      this.overlay.setMap(null);
      this.overlay.finalize();
    }
    
    this.overlay = new GoogleMapsOverlay({});
    let currentTime = 0;
    const props = {
      
      id: "trips",
      data: datos,
      getPath: (d: Data) => d.path,
      getTimestamps: (d: Data) => d.timestamps,
      getColor: (d: Data) => VENDOR_COLORS[d.vendor],
      opacity: 1,
      widthMinPixels: 4,
      trailLength: 50,
      currentTime,
      shadowEnabled: true,
    };
    
    const animate = () => {
      currentTime = (currentTime + 1) % this.LOOP_LENGTH;

      const tripsLayer = new TripsLayer({
        ...props,
        currentTime,
      });

      this.overlay.setProps({
        layers: [tripsLayer],
      });

      window.requestAnimationFrame(animate);
    };
    window.requestAnimationFrame(animate);
    this.overlay.setMap(map);
    //FIN ANIMACION MAMALONA

  }//Fin funcion Dijkstra

  dibujarDijkstra(aux,listaDijkstra){
    
    //Validacion cuando origen y destino son el mismo nodo para fin de función
    if (listaDijkstra[aux][0] == listaDijkstra[aux][2]){
      return
    }
    
    //Obtener las coordenadas del nodo origen
    var latOrigen = this.grafoCucei[listaDijkstra[aux][0]][1];
    var lngOrigen = this.grafoCucei[listaDijkstra[aux][0]][2];
    //Obtener las coordenadas del nodo destino
    var latDestino = this.grafoCucei[listaDijkstra[aux][2]][1];
    var lngDestino = this.grafoCucei[listaDijkstra[aux][2]][2];

    //Se recorre la lista de Dijkstra para dibujarla
    let c = 0;
    listaDijkstra.forEach(element => {
      if (element[0] == listaDijkstra[aux][2]){
        this.timeStamp.push((listaDijkstra[c][1]*this.velocidadRuta));
        this.ruta.push([lngDestino,latDestino]);
        return this.dibujarDijkstra(c,listaDijkstra);   //Llamar nuevamente la funcion con la siguiente linea del camino minimo
      }
      c++;
    });    
  }
}

function CenterControl(controlDiv: Element, map: google.maps.Map) {
  // Set CSS for the control border.
  const controlUI = document.createElement("div");

  controlUI.style.backgroundColor = "#fff";
  controlUI.style.border = "2px solid #fff";
  controlUI.style.borderRadius = "3px";
  controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  controlUI.style.cursor = "pointer";
  controlUI.style.marginTop = "8px";
  controlUI.style.marginBottom = "22px";
  controlUI.style.textAlign = "center";
  controlUI.title = "Click to recenter the map";
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  const controlText = document.createElement("div");

  controlText.style.color = "rgb(25,25,25)";
  controlText.style.fontFamily = "Roboto,Arial,sans-serif";
  controlText.style.fontSize = "16px";
  controlText.style.lineHeight = "38px";
  controlText.style.paddingLeft = "5px";
  controlText.style.paddingRight = "5px";
  controlText.innerHTML = "Centrar";
  controlUI.appendChild(controlText);

  // Boton para centrar el mapa en la posicion actual del usuario
  controlUI.addEventListener("click", () => {
    getPosition().then((currentCoords)=> {
      map.setCenter({lat:parseFloat(currentCoords.coords.latitude.toString()), lng:parseFloat(currentCoords.coords.longitude.toString())}); 
         
    })
  });

}

//Funcion para obtener la posicion actual del usuario
const showCurrentPosition = async () => {
  const coordinates = await Geolocation.getCurrentPosition();

  var lat = coordinates.coords.latitude;
  var lng = coordinates.coords.longitude;
  
  map = new google.maps.Map(
    document.getElementById('map') as HTMLElement,
    {
      zoom: 15,
      center: {lat, lng}, 
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    }
  );

  const centerControlDiv = document.createElement("div");

  CenterControl(centerControlDiv, map);

  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(centerControlDiv);  
}; 

const getPosition = async () => {
  const coordinates = await Geolocation.getCurrentPosition();
  return coordinates;
}; 