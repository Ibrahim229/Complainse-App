import { Component, OnInit } from "@angular/core";
import { NavController, AlertController, ToastController, MenuController, LoadingController } from "ionic-angular";
import { MapPage } from "../map/map";
import { RegisterPage } from "../register/register";
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http/';
import { HttpClient } from "@angular/common/http";
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  userPreviliges: number[];
  boxesNumbers
  showList: boolean = false;
  userData: any;
  userToken;
  ngOnInit() {
    this.getUserToken().then(token => {
      this.userToken = token;
    });
  }

  validation_messages = {
    'username': [
      { type: 'required', message: 'UserName is required.' },
      // { type: 'pattern', message: 'Enter a valid email.' }
    ],
    'password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 3 characters long.' }
    ]
  };
  constructor(public nav: NavController, public forgotCtrl: AlertController, public menu: MenuController, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public storage: Storage,public nativHttp: HTTP, public http: HttpClient,private nativePageTransitions: NativePageTransitions
  ) {
    this.menu.swipeEnable(false);
    this.loginForm = new FormGroup({
      'username': new FormControl('', Validators.compose([
        Validators.required,
        // Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      'password': new FormControl('', Validators.compose([
        Validators.minLength(3),
        Validators.required
      ]))
    });
  }

  // go to register page
  register() {
    this.nav.setRoot(RegisterPage);
  }


  getData(key: string): Promise<any> {
    return this.storage.get(key);
  }
  getUserToken(): Promise<any> {
    return this.storage.get("token");
  }
  getFullUrl(url: string): Promise<string> {
    const promise = new Promise<string>((resolve, reject) => {
      this.getData("Services_configurations").then(resolved => {
        if (resolved != null && resolved.url != null) {
          console.log("Cached services URL: " + resolved.url);
          alert(resolved.url)
          resolve(resolved.url + url);
        }
        else {
          console.log("Failed to load cached services IP, resolving default");
          resolve("http://85.194.99.134:8002" + url);
        }
      }, rejected => {
        console.log("Failed to load cached services IP, resolving default");
        console.error(rejected);
        resolve("http://85.194.99.134:8002" + url);
      });
    });
    return promise;

  }
  setData(key: string, data: any) {
    this.storage.set(key, data);
  }
  runService(url: string, method: string, requireToken?: boolean, request?: any, specialHeaders?: any): Promise<any> {
    console.log(url);
    let headers: any;

    if (specialHeaders) {
      headers = specialHeaders;
    }
    else {
      headers = {
        "Content-Type": "application/json"
      }
      if (requireToken) {
        headers.token = this.userToken;
      }
    }
    let requestOptions: any = {
      method: method,
      body: request,
      headers: headers
    }
    // const options = {
    //   method: 'post',
    //   data: { id: 12, message: 'test' },
    //   headers: { Authorization: 'OAuth2: token' }
    // };
    this.nativHttp.setDataSerializer('json');
    if (method === "GET") {
      return this.nativHttp.get(url, {}, headers);
    }
    else {
      return this.nativHttp.post(url, request, headers);
    }
    // return this.nativHttp.sendRequest(url, requestOptions);

  }
  async doLogin() {
    console.log("Submitted login form");
    console.log(this.loginForm.value)
    let loading = this.loadingCtrl.create({
      spinner: 'dots',
      cssClass: 'transparent'
    });

    loading.present()
    let loginRequest = {
      "USER_NAME": this.loginForm.value.username,
      "USER_PASSWORD": this.loginForm.value.password
    };
    console.log("Login request");
    console.log(loginRequest);

    this.getFullUrl("/security/LoginAuth").then(url => {
      this.runService(url, 'POST', false, loginRequest).then(response => {
        this.userData = JSON.parse(response.data);
        // this.getMyPriviliges(this.userData);
        loading.dismiss();
        console.log('userData', this.userData);
        if (this.userData.valid == "Y") {
          this.setData("UserBasicData", this.userData.rows[0]);
          let options: NativeTransitionOptions = {
            direction: 'up',
            duration: 500,
            slowdownfactor: -1,
            slidePixels: 20,
           }
        
         this.nativePageTransitions.slide(options)
          this.nav.setRoot(MapPage);

        }
        else {
          // this.dialogsProvider.showAlertDialog('Error', 'Username or password is incorrect');
          let loading = this.loadingCtrl.create({
            content: 'Username or password is incorrect',
            spinner: "hide"
          });
          loading.present()
          setTimeout(() => {
            loading.dismiss();
          }, 2000);
        }
      }, error => {
        loading.dismiss();
        console.log("Service failed");
        console.log(error.status);
        if (error.status && error.status === 401) {
          let loading1 = this.loadingCtrl.create({
            content: 'Username or password is incorrect',
            spinner: "hide"
          });
          loading1.present()
          setTimeout(() => {
            loading1.dismiss();
          }, 2000);
        }
        else {
          // this.dialogsProvider.showAlertDialog('Error', 'Please check your internet connection');
          let loading = this.loadingCtrl.create({
            content: 'Please check your internet connection',
            spinner: "hide"
          });
          loading.present()
          setTimeout(() => {
            loading.dismiss();
          }, 2000);
        }
      });
    });

  }
  forgotPass() {
    let forgot = this.forgotCtrl.create({
      title: 'Forgot Password?',
      message: "Enter you email address to send a reset link password.",
      inputs: [
        {
          name: 'email',
          placeholder: 'Email',
          type: 'email'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Send',
          handler: data => {
            console.log('Send clicked');
            let toast = this.toastCtrl.create({
              message: 'Email was sended successfully',
              duration: 3000,
              position: 'top',
              cssClass: 'dark-trans',
              closeButtonText: 'OK',
              showCloseButton: true
            });
            toast.present();
          }
        }
      ]
    });
    forgot.present();
  }

}
