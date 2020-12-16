import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { AlertController, NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.page.html',
  styleUrls: ['./friend.page.scss'],
})
export class FriendPage implements OnInit {
  friendList: any = [];
  uid: any;

  counter: any = 0;
  counterFlag: any = 0;
  flagLain: any = 0;

  friendKey: any;
  friendKey2: any;
  friendFlag: any = 0;
  searchData: any[];

  constructor(
    private authSrv: AuthService,
    private fireAuth: AngularFireAuth,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
  ) { }

  async presentAlert(value: any) {
    const alert = await this.alertCtrl.create({
      header: 'Hapus Lokasi?',
      message: 'Apakah anda yakin ingin menghapus teman ini?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: (blah) => {
            // console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Hapus',
          handler: () => {
            this.removeFriend(value);
          }
        }
      ]
    });
    await alert.present();
  }

  async presentToast() {
    const toast = await this.toastCtrl.create({
      message: 'Teman Telah dihapus! Silahkan direfresh.',
      duration: 2000,
      color: 'warning',
    });
    toast.present();
  }

  search(value: any) {
    const searchTerm = value.srcElement.value;
    this.searchData = null;
    if (!searchTerm) {
      this.searchData = this.friendList;
      return;
    }
    this.searchData = this.friendList.filter(currentData => {
      if (searchTerm) {
        return (currentData.nama.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
        );
      }
    });
  }



  ngOnInit() {

    this.fireAuth.user.subscribe((data => {
      if(data == null){
        this.navCtrl.navigateForward('login');
      }else{
        this.fireAuth.user.subscribe((data => {
          this.uid = data.uid;
          this.friendList = [];
          this.authSrv.checkFriend().snapshotChanges().pipe(
            map(changes =>
              changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
            )
          ).subscribe(data => {
    
            if (this.flagLain == 0) {
              data.forEach(element => {
                if (this.uid == element.uid) {
                  this.counter++;
                }
              });
              this.flagLain = 1;
            }
    
            data.forEach(element => {
              if (this.uid == element.uid) {
                this.authSrv.getUser(element.fid).then(
                  (res) => {
                    if (this.counterFlag < this.counter) {
                      let newData: any = {
                        nama: res.firstname + " " + res.lastname,
                        linkfoto: res.linkfoto,
                        key: element.fid
                      }
                      this.friendList.push(newData)
                      this.counterFlag++;
                    }
                  }
                );
              }
            });
            this.searchData = this.friendList;
          });
        }));
      }
    }));


  }


  removeFriend(value: any) {
    this.authSrv.checkFriend().snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    ).subscribe(data => {
      data.forEach(element => {
        if (value == element.fid && this.uid == element.uid) {
          this.friendFlag = 1;
          this.friendKey = element.key;
          this.authSrv.removeFriend(this.friendKey);
        }

        if (this.uid == element.fid && value == element.uid && this.friendFlag == 1) {
          this.friendKey2 = element.key;
          this.authSrv.removeFriend(this.friendKey2);
          this.presentToast();
        }
      });
    });
  }



}
