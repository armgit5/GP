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
  user: User;
  lastLocation: Location;
  private zoomLevel = 16;
  private tiltLevel = 30;
  private mapOptions: GoogleMapOptions = {
    camera: {
      target: {
        lat: this.myLocation.lat,
        lng: this.myLocation.lng
      },
      zoom: this.zoomLevel,
      tilt: this.tiltLevel
    },
    gestures: {
      scroll: false
    }
  };

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

    let element: HTMLElement = document.getElementById('map');
    this.map = this.googleMaps.create(element, this.mapOptions);

    // Wait the MAP_READY before using any methods.
    this.map.one(GoogleMapsEvent.MAP_READY)
      .then(() => {
        console.log('Map is ready!');

        // Now you can use all methods safely.
        this.map.setTrafficEnabled(true);
        this.map.setAllGesturesEnabled(true);
        this.map.setMyLocationEnabled(true);

        // this.onLocate();
        this.map.on(plugin.google.maps.event.MY_LOCATION_BUTTON_CLICK)
        .subscribe(() => {
          this.map.getMyLocation()
          .then(position => {
                this.map.setCameraZoom(this.zoomLevel);
                this.map.setCameraTilt(this.tiltLevel);
                this.map.setCameraTarget(position.latLng);
          });
        });
      });
  }

  // onLocate() {
  //   const loader = this.loadingCtrl.create({
  //     content: 'Getting your Location...'
  //   });
  //   loader.present();
  //   this.locationsService.getLocations().subscribe(
  //     (locations: Location[]) => {
  //       loader.dismiss();

  //       let bounds = [];
  //       locations.forEach((location) => {
  //         let latLng = {
  //           lat: location.lat,
  //           lng: location.lng
  //         };
  //         bounds.push(latLng);
  //         this.map.addMarker({
  //           position: latLng
  //         });
  //       });

  //       this.map.moveCamera({
  //         target: bounds
  //       });

  //     }
  //   );
  // }

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
        // Check to see if the position has moved. If so then upload location to firebase.
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

  ngOnDestroy() {
    if (this.$geoLocationWatch) {
      this.$geoLocationWatch.unsubscribe();
    }
  }

}
