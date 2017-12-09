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
  Marker,
  LatLng
} from '@ionic-native/google-maps';

declare var plugin;

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
    lat: 41.799240000000005, lng: 140.75875000000002,
    uid: '',
    name: '',
    dateTime: 0
  };
  lastLocation: Location;

  $geoLocationWatch: Subscription;
  aLine: any[];
  lastTime = Date.now();
  intervalTime = 15000;
  timeoutTime = 2000;
  diffDist = 0.003;

  map: GoogleMap;
  marker: Marker;

  constructor(private locationsService: LocationsService,
    private loadingCtrl: LoadingController,
    private geolocation: Geolocation,
    private toastCtrl: ToastController,
    private authService: AuthService,
    private platform: Platform,
    private googleMaps: GoogleMaps) {

    this.getALocationLine('rw07invSPBbGv1oY7hcViS83yrR2');

  }

  ngOnInit() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.loadMap();
      // setInterval(() => {
      //   this.watchPosition();
      // }, this.intervalTime);
    });

  }

  private getALocationLine($key: string) {
    this.locationsService.getALocationLine().subscribe(
      (points) => {
        this.aLine = points;
      }
    );
  }

  // https://forum.ionicframework.com/t/ionic-google-map-native-geolocation-plugin-update-userposition/100028
  private loadMap() {

    let mapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: this.myLocation.lat,
          lng: this.myLocation.lng
        },
        zoom: 18,
        tilt: 30
      },
      gestures: {
        scroll: false
      }
    };

    let element: HTMLElement = document.getElementById('map');
    this.map = this.googleMaps.create(element, mapOptions);

    // Wait the MAP_READY before using any methods.
    this.map.one(GoogleMapsEvent.MAP_READY)
      .then(() => {
        console.log('Map is ready!');

        // Now you can use all methods safely.
        this.map.setTrafficEnabled(true);
        this.map.setAllGesturesEnabled(true);

        let GORYOKAKU_POINTS = [
          {lat: 41.79883, lng: 140.75675},
          {lat: 41.799240000000005, lng: 140.75875000000002},
          {lat: 41.797650000000004, lng: 140.75905},
          {lat: 41.79637, lng: 140.76018000000002},
          {lat: 41.79567, lng: 140.75845},
          {lat: 41.794470000000004, lng: 140.75714000000002},
          {lat: 41.795010000000005, lng: 140.75611},
          {lat: 41.79477000000001, lng: 140.75484},
          {lat: 41.79576, lng: 140.75475},
          {lat: 41.796150000000004, lng: 140.75364000000002},
          {lat: 41.79744, lng: 140.75454000000002},
          {lat: 41.79909000000001, lng: 140.75465}
        ];

        let positionList = new plugin.google.maps.BaseArrayClass(GORYOKAKU_POINTS);

        GORYOKAKU_POINTS.forEach((position) => {
          this.map.addMarker({
            position: position
          });
        });

        this.map.moveCamera({
          target: GORYOKAKU_POINTS
        });

        // this.onLocate();
      });
  }

  private addPoint(location: Location) {
    let position = {
      lat: location.lat,
      lng: location.lng
    };

    let cameraPosition = {
      target: position
    }
    this.map.moveCamera(cameraPosition);
    this.map.addMarker({
      title: 'Arm',
      icon: 'blue',
      animation: 'DROP',
      position: position
    }).then(
      marker => this.marker = marker
    );
  }

  private updatePoint(location: Location) {

    let cameraPosition = {
      target: {
        lat: location.lat,
        lng: location.lng
      }
    }
    this.map.moveCamera(cameraPosition);
    let userPosition = new LatLng(location.lat, location.lng);
    this.marker.setPosition(userPosition);
  }

  onLocate() {
    const loader = this.loadingCtrl.create({
      content: 'Getting your Location...'
    });
    loader.present();
    this.locationsService.getLocations().subscribe(
      (locations: Location[]) => {
        loader.dismiss();


        // .then((markers) => {
        //   var bounds = [];
        //   GORYOKAKU_POINTS.forEach((POI) => {
        //     bounds.push(POI);
        //   });

        //   this.map.moveCamera({
        //     target: bounds
        //   });
        // });

      }
    );
  }

  private getCurrentPosition() {
    let options = {
      timeout: 10000,
      enableHighAccuracy: true
    };
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
      this.locationsService.sendLocation(this.myLocation);
    }
  }

  ngOnDestroy() {
    if (this.$geoLocationWatch) {
      this.$geoLocationWatch.unsubscribe();
    }
  }

}
