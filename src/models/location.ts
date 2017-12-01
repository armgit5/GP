
export class Location {
    constructor(public $key: string,
                public lat: number,
                public lng: number,
                public uid: string,
                public name: string,
                public dateTime: number) {

    }
}

export class TimeStampedLocation {
  constructor(public dateTime: string,
              public lat: number,
              public lng: number) {

              }
}
