import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-addfriend',
  templateUrl: './addfriend.page.html',
  styleUrls: ['./addfriend.page.scss'],
})
export class AddfriendPage implements OnInit {
  datas: any[];
  searchData: any[];

  uid: any;

  constructor(
    private authSrv: AuthService,
    private navCtrl: NavController,
    private fireAuth: AngularFireAuth,
  ) { }

  ngOnInit() {

    this.fireAuth.user.subscribe((data => {
      if (data == null) {
        this.navCtrl.navigateForward('login');
      } else {
        this.fireAuth.user.subscribe((data => {
          this.uid = data.uid;
        }));

        this.authSrv.getAllUser().snapshotChanges().pipe(
          map(changes =>
            changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
          )
        ).subscribe(data => {
          this.datas = data;
        });
      }
    }));


  }

  search(value: any) {
    const searchTerm = value.srcElement.value;
    this.searchData = null;
    if (!searchTerm) {
      return;
    }

    this.searchData = this.datas.filter(currentData => {
      if (searchTerm) {
        return (currentData.email.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
          || currentData.firstname.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
          || currentData.lastname.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
        );
      }
    });
  }

}
