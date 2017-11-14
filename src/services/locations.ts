import { Injectable } from "@angular/core";
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class LocationsService {

    constructor(private db: AngularFireDatabase) {

    }

    getLocations() {
      return this.db.list('locations').valueChanges();
    }
}
