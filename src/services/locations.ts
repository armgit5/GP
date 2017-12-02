import { Injectable } from "@angular/core";
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from "rxjs/Observable";
import { Location } from '../models/location';


@Injectable()
export class LocationsService {

    maxLinePoints = 10;

    constructor(private db: AngularFireDatabase) {

    }

    getLocations() {
      return this.db.list('locations')
                    .valueChanges();
    }

    sendLocation(location: Location) {
      console.log('sent ', location);
      let ref = this.db.list(`/timestampedLocations/${location.$key}`);

      ref.valueChanges()
      .subscribe(
        points => {
          console.log(points);
          if (points.length >= this.maxLinePoints) {
            ref.snapshotChanges(['child_added']).subscribe(
              items => {
                console.log('child added');
                console.log(items[0].key);
                this.db.object(`/timestampedLocations/${location.$key}/${items[0].key}`).remove();
              }
            );
          }
        }
      )

      this.db.list(`/timestampedLocations/${location.$key}`).push({
        dateTime: location.dateTime,
        lat: location.lat,
        lng: location.lng
      });
      this.updateCurrentLocation(location);
    }

    private deletePoint(location: Location, dateTime: string) {

    }

    private updateCurrentLocation(location: Location) {
      this.db.object(`/locations/${location.$key}`).update({
        dateTime: location.dateTime,
        lat: location.lat,
        lng: location.lng,
        uid: location.uid
      });
    }

    getALocationLine() {
      return this.db.list(`/timestampedLocations/rw07invSPBbGv1oY7hcViS83yrR2`).valueChanges();
    }
}
