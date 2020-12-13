import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.page.html',
  styleUrls: ['./friend.page.scss'],
})
export class FriendPage implements OnInit {
  friendList: any = [];
  uid: any;

  constructor(
    private authSrv: AuthService,
    private fireAuth: AngularFireAuth,

  ) { }

  ngOnInit() {
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
          if (this.uid == element.uid) {
            this.authSrv.getUser(element.fid).then(
              (res) => {
                // console.log(res);
                let newData : any = {
                  nama : res.firstname+" "+ res.lastname,
                  linkfoto: res.linkfoto,
                  key: element.key
                }
                this.friendList.push(newData)
              }
            );
          }
          // console.log(this.friendList)
        });
      });
    }));
  }

  removeFriend(value:any) {
    // console.log(value);
    // this.friendFlag = 0;
    this.authSrv.removeFriend(value);
    // this.friendList.pop(value);
  }



}
