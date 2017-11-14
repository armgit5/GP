
export class Location {
    constructor(public $key: string,
                public lat: number,
                public lng: number,
                public uid: string,
                public name: string) {

    }

     // tslint:disable-next-line:member-ordering
     static fromJsonList(array): Location[] {
          return array.map(Location.fromJson);
      }

      // tslint:disable-next-line:member-ordering
      static fromJson({$key, lat, lng, uid, name}): Location {
        return new Location($key, lat, lng, uid, name);
    }
}

