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
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker
 } from '@ionic-native/google-maps';

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
  lastLocation: Location = new Location('', 0, 0, '', '', 0);
  $geoLocationWatch: Subscription;
  aLine: any[];
  lastTime = Date.now();
  step = 10000;
  count = 0;
  intervalTime = 15000;
  timeoutTime = 2000;
  diffDist = 0.003;

  map: GoogleMap;

  constructor(private locationsService: LocationsService,
    private loadingCtrl: LoadingController,
    private geolocation: Geolocation,
    private toastCtrl: ToastController,
    private authService: AuthService,
    private platform: Platform,
    private googleMaps: GoogleMaps) {

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

  // http://www.geodatasource.com/developers/javascript
  private distance(lat1, lon1, lat2, lon2, unit) {
    let radlat1 = Math.PI * lat1 / 180;
    let radlat2 = Math.PI * lat2 / 180;
    let theta = lon1 - lon2;
    let radtheta = Math.PI * theta / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist;
  }

  // https://stackoverflow.com/questions/8720334/geolocation-watchposition-breaks-geolocation-getcurrentposition
  private watchPosition() {
    let options = {
      timeout: 1000
    };
    this.$geoLocationWatch = this.geolocation.watchPosition(options)
      .filter((p) => p.coords !== undefined) //Filter Out Errors
      .subscribe(position => {
        let diffLat = Math.abs(this.lastLocation.lat - position.coords.latitude);
        let diffLng = Math.abs(this.lastLocation.lng - position.coords.longitude);
        if (diffLat >= this.diffDist || diffLng >= this.diffDist) {
          this.getLocationAndUpload(position);
          this.lastLocation.lat = position.coords.latitude;
          this.lastLocation.lng = position.coords.longitude;
        }
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
      // let timeNow = Date.now();
      // if ((timeNow - this.lastTime) >= this.step) {
      //   this.lastTime = timeNow;
      //   this.locationsService.sendLocation(this.myLocation);
      // }
      this.locationsService.sendLocation(this.myLocation);
    }
  }

  ngOnDestroy() {
    if (this.$geoLocationWatch) {
      this.$geoLocationWatch.unsubscribe();
    }
  }

}
