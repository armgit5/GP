import { Component, ViewChild } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { SigninPage } from '../pages/signin/signin';
import { SignupPage } from '../pages/signup/signup';
import { NavController } from 'ionic-angular/navigation/nav-controller';
import { MenuController } from 'ionic-angular/components/app/menu-controller';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../services/auth';
import { User } from '../models/user';
import { HomePage } from '../pages/home/home';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  tabsPage: any = TabsPage;
  signinPage = SigninPage;
  signupPage = SignupPage;
  isAuthenticated = false;

  @ViewChild('nav') nav: NavController;

  constructor(platform: Platform,
              statusBar: StatusBar,
              splashScreen: SplashScreen,
              private menuCtrl: MenuController,
              private afAuth: AngularFireAuth,
              private authService: AuthService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });

    console.log(this.authService.user.$key);
    if (this.authService.user.$key === '') {
      this.isAuthenticated = false;
      this.tabsPage = SigninPage;
    }

    this.authService.onUserUpdate.subscribe(
      (user: User) => {
        console.log(user);
        console.log(user.uid !== '');
        if (user.uid !== '') {
          this.isAuthenticated = true;
          this.tabsPage = TabsPage;
        } else {
          this.isAuthenticated = false;
          this.tabsPage = SigninPage;
        }
      }
    );
  }

  onLoad(page: any) {
    this.nav.setRoot(page);
    this.menuCtrl.close();
  }

  onLogout() {
    this.authService.logout();
    this.menuCtrl.close();
    this.nav.setRoot(HomePage);
  }
}

