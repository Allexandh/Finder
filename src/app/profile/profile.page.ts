import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Capacitor } from '@capacitor/core';
import { AlertController, NavController, Platform, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @ViewChild('filePicker', { static: false }) filePickerRef: ElementRef<HTMLInputElement>;


  userid: any;
  firstname: any;
  lastname: any;
  email: any;
  linkfoto: any;

  photo: SafeResourceUrl;
  isDesktop: boolean;

  link: any;
  src: any;

  locations: any = [];

  counter: any = 0;
  counterData: any = 0;
  flagCounter: any = 0;

  flagUser: any = 0;

  constructor(
    private authSrv: AuthService,
    private fireAuth: AngularFireAuth,
    private navCtrl: NavController,
    private router: Router,
    private platform: Platform,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,


  ) {

  }


  async presentAlert(value: any) {
    const alert = await this.alertCtrl.create({
      header: 'Hapus Lokasi?',
      message: 'Apakah anda yakin ingin menghapus lokasi ini?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        }, {
          text: 'Hapus',
          handler: () => {
            this.hapusLokasi(value);
          }
        }
      ]
    });
    await alert.present();
  }

  async presentToast() {
    const toast = await this.toastCtrl.create({
      message: 'Lokasi Telah dihapus! Silahkan direfresh.',
      duration: 2000,
      color: 'warning',
    });
    toast.present();
  }

  ngOnInit() {

    this.fireAuth.user.subscribe((data => {
      if (data == null) {
        this.navCtrl.navigateForward('login');
      } else {
        this.locations = null;
        this.locations = [];

        if ((this.platform.is('mobile') && this.platform.is('hybrid')) || this.platform.is('desktop')) {
          this.isDesktop = true;
        }

        this.fireAuth.user.subscribe((data => {
          this.userid = data.uid;
          this.authSrv.getData(this.userid).then(
            (res) => {
              if(this.userid == 'SbpdoyvUNvODCwSKyEfgb73YVM13'){
                this.flagUser = 1;
                console.log("Selamat Datang")
              }
              this.firstname = res.firstname;
              this.lastname = res.lastname;
              this.email = res.email;
              this.linkfoto = res.linkfoto;
            }
          );

          this.authSrv.getAllLocation().snapshotChanges().pipe(
            map(changes =>
              changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
            )
          ).subscribe(data => {
            let datass = data;
            if (this.flagCounter == 0) {
              datass.forEach(element => {
                if (element['uid'] == this.userid) {
                  this.counter++;
                }
              });
              this.flagCounter = 1;
            }



            datass.forEach(element => {
              if (element['uid'] == this.userid) {
                if (this.counterData < this.counter) {
                  this.locations.push(element);
                  this.counterData++;
                }

              }
            });
          });

        }));
      }
    }));


  }

  hapusLokasi(key: any) {
    this.authSrv.removeLocation(key);
    this.presentToast();
  }




  async ubahfoto() {
    if (!Capacitor.isPluginAvailable('Camera') || this.isDesktop) {
      this.filePickerRef.nativeElement.click();
      return;
    }

    const image = await Camera.getPhoto({
      quality: 100,
      width: 400,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
    });

    this.link = this.authSrv.ups(this.userid, image.dataUrl);
  }

  onFileChoose(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    const pattern = /image-*/;
    const reader = new FileReader();

    if (!file.type.match(pattern)) {
      return;
    }

    reader.onload = () => {
      this.photo = reader.result.toString();
      this.link = this.authSrv.upload(this.userid, file);
      // this.src = this.link;
    };
    reader.readAsDataURL(file);
  }

  logout() {
    this.authSrv.logoutUser()
      .then(res => {
        this.navCtrl.navigateForward('login');
      })
      .catch(error => {
        console.log(error)
      })
  }

}
