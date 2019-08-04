import { Component, ViewChild } from "@angular/core";
import { Platform, Nav } from "ionic-angular";

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';

import { LoginPage } from "../pages/login/login";
import { ProfilePage } from "../pages/profile/profile";
import { ViolationlistPage } from "../pages/violationlist/violationlist"
import { MapPage } from "../pages/map/map"
export interface MenuItem {
  title: string;
  component: any;
  icon: string;
}

@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  @ViewChild(Nav) nav: Nav;
  compliance;
  rootPage: any = LoginPage;

  appMenuItems: Array<MenuItem>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public keyboard: Keyboard
  ) {
    this.initializeApp();


  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.show()
      this.splashScreen.hide();
    });
  }

  openPage1() {
    this.nav.setRoot(MapPage);

  }

  openPage2() {
    this.nav.push(ProfilePage);

  }
  openPage3() {
    this.nav.setRoot(ViolationlistPage);

  }


  logout() {
    this.nav.setRoot(LoginPage);
  }

}
