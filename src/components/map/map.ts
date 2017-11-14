import { Component } from '@angular/core';
import { Location } from '../../models/location';
import { LocationsService } from '../../services/locations';
import { LoadingController } from 'ionic-angular';
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
export class MapComponent {

  text: string;
  location: Location = {
    $key: '',
    lat: 40.7624324,
    lng: -73.9759827,
    uid: '',
    name: ''
  }

  constructor(private locationsService: LocationsService,
              private loadingCtrl: LoadingController) {
    this.onLocate();
  }

  onLocate() {
    const loader = this.loadingCtrl.create({
      content: 'Getting your Location...'
    });
    loader.present();
    this.locationsService.getLocations().subscribe(
      (locations: Location[]) => {
        loader.dismiss();
        this.location.lat = locations[1].lat;
        this.location.lng = locations[1].lng;
      }
    );
  }


}
