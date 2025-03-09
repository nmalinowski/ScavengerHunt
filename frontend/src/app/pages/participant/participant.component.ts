import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf
import { FormsModule } from '@angular/forms'; // For ngModel
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { HuntService } from '../../services/hunt.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-participant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss']
})
export class ParticipantComponent implements OnInit {
  hunt: any = {};
  currentClue: any = null;
  participantName: string = '';
  huntCode: string = '';
  isJoined: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private huntService: HuntService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.huntCode = this.route.snapshot.paramMap.get('code') || '';
    if (this.huntCode) {
      this.loadHunt();
    }
  }

  loadHunt() {
    this.huntService.getHuntByCode(this.huntCode).subscribe(
      hunt => {
        this.hunt = hunt;
        if (this.isJoined) {
          this.currentClue = hunt.clues[0];
          this.checkLocation();
        }
      },
      error => console.error('Load error:', error)
    );
  }

  joinHunt() {
    if (this.participantName && this.huntCode) {
      this.huntService.joinHunt(this.huntCode, this.participantName).subscribe(
        hunt => {
          this.hunt = hunt;
          this.isJoined = true;
          this.currentClue = hunt.clues[0];
          this.checkLocation();
        },
        error => console.error('Join error:', error)
      );
    }
  }

  checkLocation() {
    this.locationService.getCurrentPosition().subscribe(
      pos => {
        if (this.currentClue && 
            Math.abs(pos.latitude - this.currentClue.latitude) < 0.01 &&
            Math.abs(pos.longitude - this.currentClue.longitude) < 0.01) {
          this.hunt.clues.shift();
          this.currentClue = this.hunt.clues[0] || null;
        }
      },
      err => console.error('Location error:', err)
    );
  }
}