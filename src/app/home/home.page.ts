import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

declare var google: any;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('map', { read: ElementRef, static: false }) mapRef: ElementRef;

  datas: any;
  provinsi: string;
  tempat: string;
  map: any;
  kordinat: any;;
  position: any;
  infoWindow: any = new google.maps.InfoWindow();

  curLoc: any;
  uid: any;

  umnPos: any = {
    lat: -6.256081,
    lng: 106.618755
  }
  constructor(
    private authSrv: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fireAuth: AngularFireAuth,

  ) { }

  showMap(pos: any) {
    const location = new google.maps.LatLng(pos.lat, pos.lng);
    const options = {
      center: location,
      zoom: 13,
      disableDefaultUI: true,
    };
    // asdasd
    // console.log(this.mapRef)
    this.map = new google.maps.Map(this.mapRef.nativeElement, options)

    const marker = new google.maps.Marker({
      position: this.umnPos,
      map: this.map
    })
  }



  ngOnInit() {
    // this.showMap(this.umnPos);

    // this.route.paramMap.subscribe((paramMap)=>{
    //   if(!paramMap.has("provinsi") || !paramMap.has("provinsi")){
    //     return;
    //   }
    //   const key = paramMap.get("provinsi");
    //   this.provinsi = key;
    //   const tempat = paramMap.get("tempat");
    //   this.tempat = tempat;
    //   console.log(this.provinsi);
    //   console.log(this.tempat);
    // })
    // this.provinsiSrv.getProvinsi(this.provinsi).then(
    //   (res) => {
    // this.datas = res
    // this.kordinat = this.datas.kordinat;

    // this.position = {
    //   lat: -6.256081,
    //   lng: 106.618755,
    // };
    // this.initMap(this.position);


    // );
  }

  ionViewDidEnter() {
    // this.showMap(this.umnPos);
    this.position = {
      lat: -6.256081,
      lng: 106.618755,
    };
    this.initMap(this.position);

  }
  chicago = { lat: 41.85, lng: -87.65 };
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
    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener("click", () => {
      // map.setCenter(chicago);
      console.log(this.curLoc)
      // console.log(this.curLoc.latLng)
      this.newLocation();
    });
  }

  newLocation() {
    this.fireAuth.user.subscribe((data => {
      // console.log(data.uid)
      this.uid = data.uid;
      this.authSrv.newLocation(this.curLoc, this.uid)
        .then(res => {
          console.log(res);
        }, err => {
          console.log(err);
        })
    }));
  }

  initMap(pos: any) {
    const icon = {
      url: 'assets/marker.png', // image url
      scaledSize: new google.maps.Size(35, 35), // scaled size
    };
    const location = new google.maps.LatLng(pos.lat, pos.lng);
    const options = {
      center: location,
      zoom: 10,
      disableDefaultUI: true
    }

    this.map = new google.maps.Map(this.mapRef.nativeElement, options);
    this.map.setCenter(this.position);
    this.map.setZoom(14);
    const marker = new google.maps.Marker({
      position: pos, //marker position
      map: this.map, //map already created
      title: this.tempat,
      icon: icon //custom image
    });

    const centerControlDiv = document.createElement("div");
    this.CenterControl(centerControlDiv);
    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);


    const contentString = '<h3 id="firstHeading" class="firstHeading">' + this.tempat + '</h3>';

    const infowindow = new google.maps.InfoWindow({
      content: contentString,
      maxWidth: 400
    });

    marker.addListener('click', function () {
      infowindow.open(this.map, marker);
    });
    infowindow.open(this.map, marker);

    this.map.addListener('click', (mapsMouseEvent) => {
      infowindow.close();
      this.infoWindow.close();

      this.infoWindow = new google.maps.InfoWindow({
        position: mapsMouseEvent.latLng,
      });
      this.infoWindow.setContent(
        JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
      );


      this.curLoc = mapsMouseEvent.latLng.toString();
      this.infoWindow.open(this.map)
    })
  }

}
