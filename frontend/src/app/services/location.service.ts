import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LocationService {
  getCurrentPosition(): Observable<{ latitude: number; longitude: number }> {
    return new Observable(observer => {
      if (!navigator.geolocation) {
        observer.error('Geolocation not supported');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => observer.next({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        err => observer.error(err)
      );
    });
  }
}