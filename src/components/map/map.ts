import { Component } from '@angular/core';
import { Location, TimeStampedLocation } from '../../models/location';
import { LocationsService } from '../../services/locations';
import { LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { OnDestroy, OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Subscription } from 'rxjs/Subscription';

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

  $geoLocationWatch: Subscription;

  constructor(private locationsService: LocationsService,
              private loadingCtrl: LoadingController,
              private geolocation: Geolocation,
              private toastCtrl: ToastController) {
    this.onLocate();
  }

  ngOnInit() {
    this.watchPosition();
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
    this.$geoLocationWatch = this.geolocation.watchPosition()
        .filter((p) => p.coords !== undefined) //Filter Out Errors
        .subscribe(position => {
          console.log(position.coords.longitude + ' ' + position.coords.latitude);
          let lat = position.coords.latitude;
          let lng = position.coords.longitude;
          this.myLocation.lat = lat;
          this.myLocation.lng = lng;
          this.myLocation.$key = 'fdsakfienksakd';
          this.myLocation.dateTime = Date.now();
          this.locationsService.sendLocation(this.myLocation);
        });
  }

  ngOnDestroy() {
    this.$geoLocationWatch.unsubscribe();
  }

}
