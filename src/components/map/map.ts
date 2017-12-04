import { Component } from '@angular/core';
import { Location, TimeStampedLocation } from '../../models/location';
import { LocationsService } from '../../services/locations';
import { LoadingController, Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { OnDestroy, OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../../services/auth';
import { User } from '../../models/user';
import { Point } from '../../models/point';

/**
 * Generated class for the MapComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'map',
  templateUrl: 'map.html'
})
export class MapComponent implements OnInit, OnDestroy {

  text: string;
  myLocation: Location = {
    $key: '',
    lat: 40.7624324,
    lng: -73.9759827,
    uid: '',
    name: '',
    dateTime: 0
  }

  locations: Location[];
  startLoc: Location;
  $geoLocationWatch: Subscription;
  aLine: any[];
  lastTime = Date.now();
  step = 10000;
  count = 0;
  intervalTime = 15000;
  timeoutTime = 3000;

  constructor(private locationsService: LocationsService,
              private loadingCtrl: LoadingController,
              private geolocation: Geolocation,
              private toastCtrl: ToastController,
              private authService: AuthService,
              private platform: Platform) {

    this.getALocationLine('rw07invSPBbGv1oY7hcViS83yrR2');
  }

  private getALocationLine($key: string) {
    this.locationsService.getALocationLine().subscribe(
      (points) => {
        this.aLine = points;
      }
    );
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.onLocate();
      setInterval(() => {
        this.watchPosition();
      }, this.intervalTime);

      // this.getCurrentPosition();
      // setInterval(() => {
      //   this.getCurrentPosition();
      // }, 10000);
    });

  }

  onLocate() {
    const loader = this.loadingCtrl.create({
      content: 'Getting your Location...'
    });
    loader.present();
    this.locationsService.getLocations().subscribe(
      (locations: Location[]) => {
        loader.dismiss();
        this.locations = locations;
        this.startLoc = locations[0];
      }
    );
  }

  private getCurrentPosition() {
    let options = {
      timeout: 10000,
      enableHighAccuracy: true
    };
    this.count += 1;
    console.log(this.count);
    this.geolocation.getCurrentPosition(options).then(
      location => {
        console.log(location);
        this.getLocationAndUpload(location);
    }).catch((error) => {
      const toast = this.toastCtrl.create({
        message: 'Could not get location, please pick it manually',
        duration: 2500
      });
      console.log('Error getting location', error);
      toast.present();
    });
  }

  // https://stackoverflow.com/questions/8720334/geolocation-watchposition-breaks-geolocation-getcurrentposition
  private watchPosition() {
    let options = {
      timeout: this.timeoutTime
      // enableHighAccuracy: true
    };
    this.$geoLocationWatch = this.geolocation.watchPosition(options)
    .filter((p) => p.coords !== undefined) //Filter Out Errors
    .subscribe(position => {
      console.log(position.coords.longitude + ' ' + position.coords.latitude);
      this.getLocationAndUpload(position);
    });

    setTimeout(() => {
      this.$geoLocationWatch.unsubscribe();
    }, this.timeoutTime);
  }

  private getLocationAndUpload(position: Position) {
    let user = this.authService.user;
    let lat = position.coords.latitude;
    let lng = position.coords.longitude;
    this.myLocation.lat = lat;
    this.myLocation.lng = lng;
    this.myLocation.$key = user.$key;
    this.myLocation.dateTime = Date.now();
    this.myLocation.uid = user.uid;
    // If user is logged in then send info to firebase

    if (user.$key !== '') {
      let timeNow = Date.now();
      console.log(timeNow, this.lastTime);
      if ((timeNow - this.lastTime) >= this.step) {
        console.log('time ok');
        this.lastTime = timeNow;
        this.locationsService.sendLocation(this.myLocation);
      }

      // console.log('sending location');
      // this.locationsService.sendLocation(this.myLocation);
    }
  }

  ngOnDestroy() {
    if (this.$geoLocationWatch) {
      this.$geoLocationWatch.unsubscribe();
    }
  }

}
