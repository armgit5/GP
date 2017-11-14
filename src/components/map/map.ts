import { Component } from '@angular/core';
import { Location } from '../../models/location';
import { LocationsService } from '../../services/locations';

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
    lat: 40.7624324,
    lng: -73.9759827,
    uid: '',
    name: ''
  }

  constructor(private locationsService: LocationsService) {
    this.locationsService.getLocations().subscribe(
      locations => {
        console.log(locations[1]);
        this.location.lat = location[1].lat;
        this.location.lng = location[1].lng;
      }
    );
  }

}
