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
  user: User = new User('', '', '');
  $geoLocationWatch: Subscription;
  aLine: any[];

  constructor(private locationsService: LocationsService,
              private loadingCtrl: LoadingController,
              private geolocation: Geolocation,
              private toastCtrl: ToastController,
              private authService: AuthService,
              private platform: Platform) {

    this.authService.onUserUpdate.subscribe(
      (user: User) => {
        if (user.uid !== '') {
          this.user = user;
        }
      }
    );
    this.getALocationLine('rw07invSPBbGv1oY7hcViS83yrR2');
  }

  private getALocationLine($key: string) {
    this.locationsService.getALocationLine().subscribe(
      (points) => {
        console.log('points');
        console.log(points);
        console.log(points[1]);
        this.aLine = points;
      }
    );
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.onLocate();
      this.watchPosition();
    });
  }

  onLocate() {
    console.log('locate');
    const loader = this.loadingCtrl.create({
      content: 'Getting your Location...'
    });
    loader.present();
    this.locationsService.getLocations().subscribe(
      (locations: Location[]) => {
        loader.dismiss();
        this.locations = locations;
        this.startLoc = locations[0];
        console.log('this location, ', this.locations);

      }
    );
  }

  // private getCurrentPosition() {
  //   this.geolocation.getCurrentPosition().then(
  //     location => {

  //       this.location.lat = location.coords.latitude;
  //       this.location.lng = location.coords.longitude;

  //       console.log(this.location.lat, this.location.lng);
  //   }).catch((error) => {
  //     const toast = this.toastCtrl.create({
  //       message: 'Could not get location, please pick it manually',
  //       duration: 2500
  //     });
  //     console.log('Error getting location', error);
  //     toast.present();
  //   });
  // }

  private watchPosition() {
    console.log('start watch');
    this.$geoLocationWatch = this.geolocation.watchPosition()
        .filter((p) => p.coords !== undefined) //Filter Out Errors
        .subscribe(position => {
          console.log(position.coords.longitude + ' ' + position.coords.latitude);
          this.getLocationAndUpload(position);
        });
  }

  private getLocationAndUpload(position: Position) {
    console.log('watched');
    let lat = position.coords.latitude;
    let lng = position.coords.longitude;
    this.myLocation.lat = lat;
    this.myLocation.lng = lng;
    this.myLocation.$key = this.user.$key;
    this.myLocation.dateTime = Date.now();
    this.myLocation.uid = this.user.uid;
    // If user is logged in then send info to firebase
    if (this.user.$key !== '') {
      this.locationsService.sendLocation(this.myLocation);
    }
  }

  ngOnDestroy() {
    this.$geoLocationWatch.unsubscribe();
  }

}
