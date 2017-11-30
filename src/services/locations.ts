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

    }
}
