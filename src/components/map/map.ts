import { Component } from '@angular/core';
import { Location } from '../../models/location';

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

  constructor() {
  }

}
