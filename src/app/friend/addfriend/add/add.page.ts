import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { map } from 'rxjs/operators';

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

  friendFlag: any = 0;

  datas: any;
  nama: any;
  linkfoto: any;
  constructor(
    private activatedRoute: ActivatedRoute,
    private fireAuth: AngularFireAuth,
    private authSrv: AuthService,

  ) {
    this.friendFlag = 0;
  }

  removeFriend() {
    // console.log(this.friendKey);
    this.friendFlag = 0;
    this.authSrv.removeFriend(this.friendKey);
  }

  addFriend() {
    console.log("Add")
    this.fireAuth.user.subscribe((data => {
      // console.log(data.uid)
      this.uid = data.uid;
      this.authSrv.addFriend(data.uid, this.fid)
        .then(res => {
          console.log(res);
        }, err => {
          console.log(err);
        })
    }));
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('key')) {
        return;
      }
      this.fid = paramMap.get('key');
      // console.log(this.id);
    });

    this.authSrv.getUser(this.fid).then(
      (res) => {
        // console.log(res);
        // this.datas = res
        this.nama = res.firstname + " " + res.lastname;
        // this.fid = res.uid;
        this.linkfoto = res.linkfoto;
      }
    );
    this.fireAuth.user.subscribe((data => {
      // console.log(data.uid)
      this.uid = data.uid;
      this.authSrv.checkFriend().snapshotChanges().pipe(
        map(changes =>
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      ).subscribe(data => {
        // this.datas = data;
        data.forEach(element => {
          // console.log(element)
          // console.log(this.fid)
          // console.log(this.uid)
          if (this.fid == element.fid && this.uid == element.uid) {
            // console.log("zz")
            this.friendFlag = 1;
            this.friendKey = element.key;
          }
        });
      });
    }));



  }

}
