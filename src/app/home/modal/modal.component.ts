import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  // @Input() selectedRecipe: RTCRtpReceiveParameters;
  // @Input() firstName: string;
  // @Input() lastName: string;
  // @Input() middleInitial: string;

  locationInput = new FormControl('', Validators.required);

  constructor(
    private modalCtrl: ModalController
    ) { }

  ngOnInit() {}

  dismissModal(){
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onSubmit(){
    const newLocation = this.locationInput.value;
    this.modalCtrl.dismiss(newLocation, 'confirm')
  }

}
