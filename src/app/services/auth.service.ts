import { Injectable, Query } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Friend } from '../model/friend';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private dbPath = '/users';
  private dbPathFriend = '/friends';
  private dbPathLocation = '/locations';
  userRef: AngularFireList<User> = null;
  friendRef: AngularFireList<Friend> = null;
  locRef: AngularFireList<Location> = null;

  constructor(
    private fireAuth: AngularFireAuth,
    private navCtrl: NavController,
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,

  ) {
    this.userRef = db.list(this.dbPath);
    this.friendRef = db.list(this.dbPathFriend);
    this.locRef = db.list(this.dbPathLocation);
  }

  // checkFriend(uid: any, fid: any){
  //   return this.db.database.ref('/friends/').once('value').then(function (snapshot) {
  //     // console.log(snapshot.val().makanan.split(','))
  //     // console.log(snapshot.val())
  //     const returnData: User = {
  //       "uid": uid,
  //       "email": snapshot.val().email,
  //       "firstname": snapshot.val().firstname,
  //       "lastname": snapshot.val().lastname,
  //       "linkfoto": snapshot.val().linkfoto,
  //     }
  //     return returnData;
  //   })
  // }

  removeFriend(key: any) {
    return this.db.list('/friends').remove(key);
  }

  removeLocation(key: any) {
    return this.db.list('/locations').remove(key);
  }

  checkFriend(): AngularFireList<Friend> {
    return this.friendRef;
  }

  getAllLocation(): AngularFireList<Location> {
    return this.locRef;
  }

  // getAllLocation() {
  //   // return this.db.database.ref('/locations/').orderByValue().on('value', function (snapshot) {
  //   //   console.log(snapshot.val())
  //   //   return snapshot.val()
  //   // })


  //   return this.db.database.ref('/locations/').once('value').then(function (snapshot) {
  //     // console.log(snapshot.val());
  //     return snapshot.val();
  //   })
  // }

  // getAllLocation() {
  //   // return this.locRef;
  //   return this.db.database.ref('/location/').once('value').then(function (snapshot) {
  //     console.log(snapshot)
  //     return snapshot;
  //   })
  // }

  getUser(uid: string) {
    // dd: Provinsi;
    return this.db.database.ref('/users/' + uid).once('value').then(function (snapshot) {
      // console.log(snapshot.val().makanan.split(','))
      // console.log(snapshot.val())
      const returnData: User = {
        "uid": uid,
        "email": snapshot.val().email,
        "firstname": snapshot.val().firstname,
        "lastname": snapshot.val().lastname,
        "linkfoto": snapshot.val().linkfoto,
      }
      return returnData;
    })
  }

  getAllUser(): AngularFireList<User> {
    return this.userRef;
  }

  ups(uid: any, file: any) {
    const randomId = Math.random()
      .toString(36)
      .substring(2, 8);
    // console.log("UPS");
    return this.storage.ref('images/').child(randomId + ".jpg").putString(file, 'data_url').then(snapshot => {
      return this.storage.ref('images/' + randomId + ".jpg").getDownloadURL().toPromise().then(res => {
        const data: any = {
          linkfoto: res,
        }
        this.uploadLinkFoto(uid, data);
        return res;
      });
    });


  }

  async upload(uid: any, file: any): Promise<any> {
    const randomId = Math.random()
      .toString(36)
      .substring(2, 8);

    if (file) {
      try {
        const task = await this.storage.ref('images').child(randomId + ".jpg").put(file).then(snapshot => {
        });

        return this.storage.ref('images/' + randomId + ".jpg").getDownloadURL().toPromise().then(res => {
          const data: any = {
            linkfoto: res,
          }
          this.uploadLinkFoto(uid, data);
          return res;
        });
        // return;
      } catch (error) {
        // console.log(error)
      }
    }
  }

  uploadLinkFoto(key: string, value: any): Promise<void> {
    // console.log(key);
    // console.log(value);
    return this.userRef.update(key, value);
  }


  getData(uid: any) {
    // console.log(uid);
    return this.db.database.ref('/users/' + uid).once('value').then(function (snapshot) {
      // console.log(snapshot.val());
      return snapshot.val();
    })
  }

  isLogin() {
    return this.fireAuth.onAuthStateChanged(function (user) {
      if (!user) {
        // this.router.navigate(['/login']);
        console.log("user is not logged in");
        // this.router.navigate(['/']);
        // this.logOut();
        return;
      } else {
        console.log("user is logged in");
        return;
      }
    });
  }

  newLocation2(uid: any, newLocName:any): any {


    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();

    const data: any = {
      lat: newLocName.lat,
      lng: newLocName.lng,
      uid: uid,
      location: newLocName.lokasi,
      datetime: date + " " + time,
    }
    console.log(data);
    return this.db.list('/locations').push(data);
  }



  newLocation(value: any, uid: any, newLocName:any): any {

    value = value.replace('(', '');
    value = value.replace(')', '');
    value = value.replace(' ', '');
    value = value.split(',');

    let date = new Date().toLocaleDateString();
    let time = new Date().toLocaleTimeString();

    const data: any = {
      lat: value[0],
      lng: value[1],
      uid: uid,
      location: newLocName,
      datetime: date + " " + time,
    }
    console.log(data);
    return this.db.list('/locations').push(data);
  }

  addFriend(uid: any, fid: any): any {
    const data: any = {
      uid: uid,
      fid: fid,
    }
    return this.db.list('/friends').push(data);
  }

  createUser(user: any, uid: any): any {
    return this.db.object('/users/' + uid).set({
      email: user.email,
      // uid: uid,
      firstname: user.firstname,
      lastname: user.lastname,
      linkfoto: 'https://www.pngitem.com/pimgs/m/30-307416_profile-icon-png-image-free-download-searchpng-employee.png',
    });
  }

  registerUser(value) {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.createUserWithEmailAndPassword(value.email, value.password)
        .then(
          res => {
            resolve(res);
            this.createUser(value, res.user.uid);
          },
          err => reject(err)
        );
    });
  }

  loginUser(value) {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.signInWithEmailAndPassword(value.email, value.password)
        .then(
          res => resolve(res),
          err => reject(err)
        );
    });
  }

  logoutUser() {
    return new Promise<any>((resolve, reject) => {
      if (this.fireAuth.currentUser) {
        this.fireAuth.signOut()
          .then(() => {
            // console.log('log out');
            resolve();
          }).catch((error) => {
            reject();
          });
      }
    });
  }

  userDetails() {
    return this.fireAuth.user;
  }
}
