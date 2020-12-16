import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { map } from 'rxjs/operators';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
  // id: any;
  fid: any;
  uid: any;
  friendKey: any;
  friendKey2: any;

  friendFlag: any = 0;

  datas: any;
  nama: any;
  linkfoto: any;

  isUser: any = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fireAuth: AngularFireAuth,
    private authSrv: AuthService,
    private navCtrl: NavController,
    private router: Router,

  ) {
    this.friendFlag = 0;
  }

  removeFriend() {
    // console.log(this.friendKey);
    this.friendFlag = 0;
    this.authSrv.removeFriend(this.friendKey);
    this.authSrv.removeFriend(this.friendKey2);
  }

  addFriend() {
    // console.log("Add")
    this.fireAuth.user.subscribe((data => {
      this.uid = data.uid;
      this.authSrv.addFriend(data.uid, this.fid)
        .then(res => {
          console.log(res);
        }, err => {
          console.log(err);
        })

      this.authSrv.addFriend(this.fid, data.uid)
        .then(res => {
          console.log(res);
        }, err => {
          console.log(err);
        })

      // this.navCtrl.navigateForward('friend');
      // this.router.navigate(['friend']);

    }));
  }

  ngOnInit() {

    this.fireAuth.user.subscribe((data => {
      if (data == null) {
        this.navCtrl.navigateForward('login');
      } else {
        this.activatedRoute.paramMap.subscribe(paramMap => {
          if (!paramMap.has('key')) {
            return;
          }
          this.fid = paramMap.get('key');
        });

        this.authSrv.getUser(this.fid).then(
          (res) => {
            this.nama = res.firstname + " " + res.lastname;
            this.linkfoto = res.linkfoto;
          }
        );
        this.fireAuth.user.subscribe((data => {
          this.uid = data.uid;
          this.authSrv.checkFriend().snapshotChanges().pipe(
            map(changes =>
              changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
            )
          ).subscribe(data => {
            data.forEach(element => {
              if (this.fid == this.uid) {
                console.log("ini gw")
                this.isUser = 1;
              }

              if (this.fid == element.fid && this.uid == element.uid) {
                this.friendFlag = 1;
                this.friendKey = element.key;
                this.isUser = 0;
              }

              if (this.uid == element.fid && this.fid == element.uid && this.friendFlag == 1) {
                this.friendKey2 = element.key;
                this.isUser = 0;
              }
            });
          });
        }));
      }
    }));





  }

}
