import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngFor
import { FormsModule } from '@angular/forms'; // For ngModel
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HuntService } from '../../services/hunt.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  hunt = { code: '', clues: [{ description: '', address: '' }], prize: '', adminPassword: '' };

  constructor(private huntService: HuntService, private router: Router) {}

  addClue() {
    this.hunt.clues.push({ description: '', address: '' });
  }

  createHunt() {
    this.huntService.createHunt(this.hunt).subscribe(
      response => {
        console.log('Hunt created:', response);
        this.router.navigate(['/hunt', this.hunt.code]);
      },
      error => console.error('Error:', error)
    );
  }
}