import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Capacitor } from '@capacitor/core';
import { NavController, Platform } from '@ionic/angular';
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

  constructor(
    private authSrv: AuthService,
    private fireAuth: AngularFireAuth,
    private navCtrl: NavController,
    private router: Router,
    private platform: Platform,


  ) {

  }

  ngOnInit() {


    if ((this.platform.is('mobile') && this.platform.is('hybrid')) || this.platform.is('desktop')) {
      this.isDesktop = true;
    }

    this.fireAuth.user.subscribe((data => {
      // console.log(data)
      this.userid = data.uid;
      this.authSrv.getData(this.userid).then(
        (res) => {
          // console.log(res.email)
          this.firstname = res.firstname;
          this.lastname = res.lastname;
          this.email = res.email;
          this.linkfoto = res.linkfoto;
        }
      );


      // this.authSrv.getAllLocation();
      // this.authSrv.getAllLocation().then(data => {
      //   console.log(data);
      //   this.locations = data;
      //   this.locations.forEach(element => {
      //     // if(element.uid == this.userid){
      //       // this.locations.push(element);
      //       console.log(element)
      //     // }
      //   });
      // });

      // this.locations.sort()

      this.authSrv.getAllLocation().snapshotChanges().pipe(
        map(changes =>
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      ).subscribe(data => {
        // this.datas = data;
        // console.log(data)
        let datass = data;
        datass.forEach(element => {
          if (element['uid'] == this.userid) {
            this.locations.push(element);
            console.log(element)
          }
        });
        console.log(this.locations)
      });

    }));
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
    // console.log(this.link)
  }

  onFileChoose(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    const pattern = /image-*/;
    const reader = new FileReader();

    if (!file.type.match(pattern)) {
      // console.log('File format not supported');
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
    // console.log("logout")
    // this.navCtrl.navigateForward('/login');

    this.authSrv.logoutUser()
      .then(res => {
        // this.flag = '0';
        this.navCtrl.navigateForward('/login');
      })
      .catch(error => {
        console.log(error)
      })
  }

}
