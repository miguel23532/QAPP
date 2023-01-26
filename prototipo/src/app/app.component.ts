import { Component, ErrorHandler } from '@angular/core';

import { SmartAudioService } from './smart-audio.service';
import { NativeAudio } from '@awesome-cordova-plugins/native-audio/ngx';



window.addEventListener('keyboardDidShow', () => {
  console.log("Keyboard is open")
  let elements = document.querySelectorAll(".tabbar");

  if (elements != null) {
    Object.keys(elements).map((key) => {
      elements[key].style.display = 'none';
    });
  }
}); 

window.addEventListener('keyboardWillHide', () => {
  let elements = document.querySelectorAll(".tabbar");

  if (elements != null) {
    Object.keys(elements).map((key) => {
      elements[key].style.display = 'flex';
    });
  }
}); 

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  providers: [
    SmartAudioService,
    NativeAudio,
    { provide: ErrorHandler },
  ],
})


export class AppComponent {
  constructor() {
  }
  
  
}
