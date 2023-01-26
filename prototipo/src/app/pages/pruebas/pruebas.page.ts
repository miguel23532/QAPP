import { Component } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ToastController } from '@ionic/angular';
import * as tf from '@tensorflow/tfjs';
import { Tokenizer } from "tf_node_tokenizer"
import { LabelEncoder } from "scikitjs"
//import * as pd from "pandas-js"
import { JsonPipe } from '@angular/common';
import { fromJSON } from 'scikitjs/dist/es5/simpleSerializer';
//import * as use from '@tensorflow-models/universal-sentence-encoder';
//import { padSequences } from '@tensorflow/keras/preprocessing/sequence';
//import * as np from 'numpy'; 
 
@Component({
  selector: 'app-pruebas',
  templateUrl: './pruebas.page.html',
  styleUrls: ['./pruebas.page.scss'],
})


export class PruebasPage {


  message = '';
  messages = [];
  currentUser = '';

  items = [];  
  numTimesLeft = 5;  
  constructor(private socket: Socket, private toastCtrl: ToastController) {  
    this.addMoreItems();  
  }  

  ngOnInit() {

    let pregunta = "hola";
    //chatbot
    this.chatbot(pregunta).then(respuesta => {

      document.getElementById("respuesta").innerText = respuesta;
    })

    this.socket.connect();

    this.socket.emit('set-name', "name");
 
    this.socket.fromEvent('users-changed').subscribe(data => {
      let user = data['user'];
      if (data['event'] === 'left') {
        this.showToast('User left: ' + user);
      } else {
        this.showToast('User joined: ' + user);
      }
    });
 
    this.socket.fromEvent('message').subscribe(message => {
      this.messages.push(message);
    });
  }

  
  async chatbot(pregunta){

    const tokenizer = new Tokenizer();
    
    
    let data1: any;

    fetch('/assets/content.json')
    .then((response) => response.json())
    .then((json) => {
      data1 = json;
    });
      
    let tags: any[] = [];
    let inputs: any[] = [];
    let responses: {[key: string]: any} = {};
    for (const intent of data1['intents']) {
      responses[intent['tag']] = intent['responses'];
      for (const lines of intent['input']) {
        inputs.push(lines);
        tags.push(intent['tag']);
      }
    }
    
    //let data = pd.DataFrame({"inputs":inputs, "tags":tags});

    let le = new LabelEncoder();
    //le.fitTransform(data['tags']);
    //tokenizer.fit_on_texts(data['inputs']);

    console.log("pregunta chatbot");
    
    const model = await tf.loadLayersModel('/assets/model.json');

    // Removing punctuation and converting to lowercase
    let predictionInput1 = pregunta.toLowerCase();

    console.log("1: ");
    console.log(Array.from(predictionInput1));

    const punctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
    const filteredText = (Array(predictionInput1)).filter(char => !punctuation.includes(char));
    
    let predictionInput2 = filteredText.join('');

    console.log("2: ");
    console.log(Array.from(predictionInput2));

    let textsP = [];
    textsP.push(predictionInput2);

    // Tokenizing and padding
    //let tokenizer =  Tokenizer(2000);
    //predictionInput = tokenizer.textsToSequences(textsP);

    let predictionInput3 = predictionInput2.split(/\W+/).filter(function(token) {
    token = token.toLowerCase(); // transform each word into lower case
    return [].indexOf(token) == -1; // applying filters, you could add other conditions here as well such as token.length >= 3 (at least 3 characters included in a word)
    });
    console.log("prueba");
    console.log(predictionInput3);
    console.log(textsP);

    tokenizer.fitOnTexts(predictionInput3);
    predictionInput3 = tokenizer.textsToSequences(predictionInput3);
    
    console.log("3: ");
    console.log(predictionInput3);


    //let predictionInput4 = np.array[predictionInput3].reshape(-1);

    let predictionInput4 = Array.from(predictionInput3).flat(-1);

    console.log("4: ");
    console.log(predictionInput4);
    
    let predictionInput5 = predictionInput4.map(function(e) {
    const max_length = 8;
    const row_length = e.length 
    if (row_length > max_length){ // truncate
        return e.slice(row_length - max_length, row_length)
    }
    else if (row_length < max_length){ // pad
        return Array(max_length - row_length).fill(0).concat(e);
    }
    return e;
    });

    console.log("5: ");
    console.log(predictionInput5);

    return predictionInput5.toString();

    // Getting output from model
    //let output = model.predict(predictionInput5);
    //output = output.argMax();
    

    //return output.toString();
  }

  sendMessage() {
    this.socket.emit('send-message', { text: this.message });
    this.message = '';
  }
  
  ionViewWillLeave() {
    this.socket.disconnect();
  }

  async showToast(msg) {
    let toast = await this.toastCtrl.create({
      message: msg,
      position: 'top',
      duration: 2000
    });
    toast.present();
  }
  
  loadData(event) {  
    setTimeout(() => {  
      console.log('Done');  
      this.addMoreItems();  
      this.numTimesLeft -= 1;  
      event.target.complete();  
    }, 500);  
  }  
  
  addMoreItems() { 
    console.log("addItems");
     
    for (let i = 0; i < 10; i++) {  
      this.items.push(i);  
    }  
  }  
}