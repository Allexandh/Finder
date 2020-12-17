import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  validation_form: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  validation_messages = {
    'email': [
      { type: 'required', message: 'Email is required' },
      { type: 'pattern', message: 'Enter a valid email' }
    ],
    'password': [
      { type: 'required', message: 'Password is required' },
      { type: 'minlength', message: 'Password must be at least 5 characters long' }
    ],
    'confirmpassword': [
      { type: 'required', message: 'Confirm Password is required' },
      { type: 'minlength', message: 'Password must be at least 5 characters long' }
    ],
    'firstname': [
      { type: 'required', message: 'First Name is required' },
      // {type: 'pattern', message: 'Enter a valid email'}
    ],
    'lastname': [
      { type: 'required', message: 'Last Name is required' },
      // {type: 'pattern', message: 'Enter a valid email'}
    ],
  }

  constructor(
    private navCtrl: NavController,
    private authSrv: AuthService,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController,

  ) { }

  ngOnInit() {
    this.validation_form = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[-zA-z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required
      ])),
      confirmpassword: new FormControl('', Validators.compose([
        Validators.required,
        // Validators.pattern('^[-zA-z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      firstname: new FormControl('', Validators.compose([
        Validators.required,
        // Validators.pattern('^[-zA-z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      lastname: new FormControl('', Validators.compose([
        Validators.required,
        // Validators.pattern('^[-zA-z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
    });
  }

  async presentToast() {
    const toast = await this.toastCtrl.create({
      message: 'Your account has been created. Please Log In.',
      duration: 2000,
      color: 'warning',
    });
    toast.present();
  }

  tryRegister(value) {
    if (value.password != value.confirmpassword) {
      this.errorMessage = "Password Berbeda";
    } else {
      this.authSrv.registerUser(value)
        .then(res => {
          this.errorMessage = '';
          // this.successMessage = "Your account has been created. Please Log In."
          this.presentToast();
          this.validation_form.reset();
          this.goLoginPage();

        }, err => {
          this.errorMessage = err.message;
          this.successMessage = '';
        })
    }

  }

  goLoginPage() {
    this.navCtrl.navigateBack('/login');
  }

}
