import { Injectable } from "@angular/core";
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from "rxjs/Observable";
import { Location } from '../models/location';

@Injectable()
export class LocationsService {

    constructor(private db: AngularFireDatabase) {

    }

    getLocations() {
      return this.db.list('locations')
                    .valueChanges();
    }

    sendLocation(location: Location) {
      console.log('sent ', location);
      this.db.object(`/timestampedLocations/${location.$key}/${location.dateTime}` ).set({
        lat: location.lat,
        lng: location.lng
      });
    }
}
