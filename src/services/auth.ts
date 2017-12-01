
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from 'angularfire2/database';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {

    constructor(private afAuth: AngularFireAuth,
                private db: AngularFireDatabase) {

    }

    signup(email: string, password: string, uid: string) {
      return new Promise((resolve, reject) => {

        // Check to see if UID exists first
        let existingUid = this.db.list('/users', ref =>
          ref.orderByChild('uid').equalTo(uid)
          ).valueChanges().subscribe(
          existingUids => {
            console.log('existing uids', existingUids);
            if (existingUids.length == 0) {
              this.afAuth.auth.createUserWithEmailAndPassword(email, password)
              .then(authState => {

                // Add user to db
                this.db.object(`/users/${authState.uid}`).set({
                  uid: uid,
                  email: email
                })
                .catch(error => reject(error));

                resolve(authState);
              })
              .catch(error => reject(error));
            } else {
              reject({message: 'UID already exists'});
            }
          }
        );
      });
    }

    signin(email: string, password: string) {
        return firebase.auth().signInWithEmailAndPassword(email, password);
    }

    logout() {
        firebase.auth().signOut();
    }

    getActiveUser() {
        return firebase.auth().currentUser;
    }

}
