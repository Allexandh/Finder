import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { ModalComponent } from './modal/modal.component';
import { map } from 'rxjs/operators';

declare var google: any;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('map', { read: ElementRef, static: false }) mapRef: ElementRef;

  datas: any;
  provinsi: string;
  tempat: string;
  map: any;
  kordinat: any;
  position: any;
  infoWindow: any = new google.maps.InfoWindow();

  curLoc: any;
  uid: any;
  locations: any = [];
  loc: any = [];
  locc: any;
  locs: any;
  newCurrentLocation: any;

  userPos: any = [];

  flagLokasi: any = 0;
  friends: any = [];
  flag: any = 1;
  userLocationFlag: any = 1;

  userid: any;


  constructor(
    private navCtrl: NavController,
    private authSrv: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fireAuth: AngularFireAuth,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,

  ) { }

  task: any;

  simpanLokasiBaru() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: Position) => {

          let pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            lokasi: "Lokasi Baru"
          };
          this.newLocation2(pos);
      });
    }
  }

  ionViewDidEnter() {
    this.task = setInterval(() => {
      this.simpanLokasiBaru();
    }, 10000);

    this.fireAuth.user.subscribe((data => {
      if (data == null) {
        this.navCtrl.navigateForward('login');
      } else {
        this.fireAuth.user.subscribe((data => {
          this.userid = data.uid;

          this.authSrv.getAllLocation().snapshotChanges().pipe(
            map(changes =>
              changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
            )
          ).subscribe(data => {
            let datass = data;
            datass.forEach(elementLocation => {
              this.userLocationFlag = 1;
              if (elementLocation['uid'] == this.userid) {
                this.position = {
                  lat: parseFloat(elementLocation['lat']),
                  lng: parseFloat(elementLocation['lng'])
                };
                this.locs = elementLocation['location']
                this.flagLokasi = 1;
              }
            });
            if (this.flagLokasi == 0) {
              this.initMap(this.position, this.locs);
            } else {
              this.initMap(this.position, this.locs);
            }
          });



          this.authSrv.checkFriend().snapshotChanges().pipe(
            map(changes =>
              changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
            )
          ).subscribe(data => {
            data.forEach(element => {
              if (this.userid == element.uid) {
                this.authSrv.getAllLocation().snapshotChanges().pipe(
                  map(changes =>
                    changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
                  )
                ).subscribe(data => {
                  this.userLocationFlag = 0;

                  let datass = data;
                  datass.forEach(elementLocation => {
                    if (elementLocation['uid'] == element.fid) {

                      this.position = {
                        lat: parseFloat(elementLocation['lat']),
                        lng: parseFloat(elementLocation['lng'])
                      };
                      this.locs = elementLocation['location']
                      this.initMap(this.position, this.locs);
                    }
                  });
                });
              }
            });
          });
        }));
      }
    }));


  }

  async presentToast() {
    const toast = await this.toastCtrl.create({
      message: 'Lokasi Telah ditambahkan! Silahkan direfresh.',
      duration: 2000,
      color: 'warning',
    });
    toast.present();
  }


  async presentModal() {
    const modal = await this.modalCtrl.create({
      component: ModalComponent,
      cssClass: "my-modal",
    })

    await modal.present();

    const { data: newLocName, role } = await modal.onWillDismiss();

    if (role == "confirm") {
      this.newLocation(newLocName);
    } else if (role == "cancel") {

    }
  }


  initMap(pos: any, locs: any) {
    let icon = null;
    if (this.userLocationFlag == 1) {
      icon = {
        url: 'assets/userMarker.png',
        scaledSize: new google.maps.Size(35, 35),
      };
    } else {
      icon = {
        url: 'assets/marker.png',
        scaledSize: new google.maps.Size(35, 35),
      };
    }


    if (this.flag == 1) {
      const location = new google.maps.LatLng(pos.lat, pos.lng);
      const options = {
        center: location,
        zoom: 10,
        disableDefaultUI: true
      }

      this.map = new google.maps.Map(this.mapRef.nativeElement, options);

      if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition((position: Position) => {
          if (this.flagLokasi == 0) {
            pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            this.infoWindow.setPosition(pos);
            this.infoWindow.setContent('<div style="color:black">Your Current Location</div>');
            this.infoWindow.open(this.map);
            this.map.setCenter(pos);
          }
          this.newCurrentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };;

        });
      }
      if (this.flagLokasi == 0) {

      } else {
        this.map.setCenter(pos);
      }

      this.flag = 0

      const centerControlDiv = document.createElement("div");
      this.CenterControl(centerControlDiv);
      this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
      const centerControlDiv2 = document.createElement("div");
      this.currentLocationControl(centerControlDiv2);
      this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv2);

    }
    this.map.setZoom(14);
    const marker = new google.maps.Marker({
      position: pos,
      map: this.map,
      title: locs,
      icon: icon
    });

    const contentString = '<div style="color:black">' + locs + '</div>';

    const infowindow = new google.maps.InfoWindow({
      content: contentString,
      maxWidth: 400
    });

    marker.addListener('click', function () {
      infowindow.open(this.map, marker);
    });

    this.map.addListener('click', (mapsMouseEvent) => {
      infowindow.close();
      this.infoWindow.close();

      this.infoWindow = new google.maps.InfoWindow({
        position: mapsMouseEvent.latLng,
      });
      this.infoWindow.setContent(
        '<div style="color:black">Klik "Check In" Untuk Menambah Lokasi Baru</div>'
      );


      this.curLoc = mapsMouseEvent.latLng.toString();
      this.infoWindow.open(this.map)
    })

    // });



  }

  newLocation2(newLocName: any) {
    this.fireAuth.user.subscribe((data => {
      this.uid = data.uid;
      this.authSrv.newLocation2(this.uid, newLocName)
        .then(res => {
          this.presentToast();
          console.log(res);
        }, err => {
          console.log(err);
        })
    }));
  }

  newLocation(newLocName: any) {
    this.fireAuth.user.subscribe((data => {
      this.uid = data.uid;
      this.authSrv.newLocation(this.curLoc, this.uid, newLocName)
        .then(res => {
          this.presentToast();
          console.log(res);
        }, err => {
          console.log(err);
        })
    }));
  }


  currentLocationControl(controlDiv) {

    const controlUI = document.createElement("div");
    controlUI.style.backgroundColor = "#fff";
    controlUI.style.border = "2px solid #fff";
    controlUI.style.borderRadius = "3px";
    controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlUI.style.cursor = "pointer";
    controlUI.style.marginBottom = "22px";
    controlUI.style.textAlign = "center";
    controlUI.title = "Click to recenter the map";
    controlDiv.appendChild(controlUI);

    const controlText = document.createElement("div");
    controlText.style.color = "rgb(25,25,25)";
    controlText.style.fontFamily = "Roboto,Arial,sans-serif";
    controlText.style.fontSize = "16px";
    controlText.style.lineHeight = "38px";
    controlText.style.paddingLeft = "5px";
    controlText.style.paddingRight = "5px";
    controlText.innerHTML = "Current Location";
    controlUI.appendChild(controlText);

    controlUI.addEventListener("click", () => {
      this.map.setCenter(this.newCurrentLocation);
    });
  }


  CenterControl(controlDiv) {
    // Set CSS for the control border.
    const controlUI = document.createElement("div");
    controlUI.style.backgroundColor = "#fff";
    controlUI.style.border = "2px solid #fff";
    controlUI.style.borderRadius = "3px";
    controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlUI.style.cursor = "pointer";
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
    controlText.innerHTML = "Check In";
    controlUI.appendChild(controlText);

    controlUI.addEventListener("click", () => {
      this.presentModal();
      // this.map.setCenter(this.position);
    });
  }

}
