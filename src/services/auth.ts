
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from 'angularfire2/database';
import { Injectable, EventEmitter } from '@angular/core';
import { User } from '../models/user';

@Injectable()
export class AuthService {

    user: User = new User('','','');
    onUserUpdate = new EventEmitter<User>();
    constructor(private afAuth: AngularFireAuth,
                private db: AngularFireDatabase) {

      this.afAuth.authState.subscribe(authState => {
        if (authState) {
          this.user.$key = authState.uid;
          this.user.email = authState.email;
          this.findUserUIDByKey(authState.uid);
        }
      });
    }

    private findUserUIDByKey($key: string) {
      this.db.object(`/users/${$key}`).valueChanges().subscribe(
        (user: User) => {
          this.user.uid = user.uid;
          console.log('user info', this.user);
          this.onUserUpdate.emit(this.user);
        }
      );
    }



    signup(email: string, password: string, uid: string) {
      return new Promise((resolve, reject) => {

        // Check to see if UID exists first
        this.db.list('/users', ref =>
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
      return new Promise((resolve, reject) => {
        this.afAuth.auth.signInWithEmailAndPassword(email, password)
        .then(authState => {
            resolve(authState);
        })
        .catch(error => reject(error));
      });
    }

    logout() {
        this.afAuth.auth.signOut();
        this.user.$key = '';
        this.user.email = '';
        this.user.uid = '';
        this.onUserUpdate.emit(this.user);
    }

    getActiveUser() {
        return firebase.auth().currentUser;
    }

}
