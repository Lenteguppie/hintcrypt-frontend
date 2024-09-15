import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-hint',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    CommonModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './hint.component.html',
  styleUrl: './hint.component.scss',
})
export class HintComponent implements OnInit {
  // Variables to hold the data
  name?: string;
  assignment: string = '';
  letterIndex: number = -1;
  encryptedLetter: string = '';
  decryptionHint: string = '';

  // Other component variables
  rewardVisible: boolean = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Get the 'hintparams' from the URL
    const hintParamsEncoded = this.route.snapshot.paramMap.get('hintparams');
    if (hintParamsEncoded) {
      try {
        // Decode from base64
        const decodedString = atob(decodeURIComponent(hintParamsEncoded));
        // Parse the JSON string
        const data = JSON.parse(decodedString);

        // Assign the data to component variables
        this.name = data.name || null;
        this.letterIndex = Number(data.letterIndex);
        this.assignment = data.assignment;
        this.encryptedLetter = data.encryptedLetter;
        this.decryptionHint = data.decryptionHint;
      } catch (error) {
        console.error('Failed to decode or parse hint parameters:', error);
        alert('Invalid hint parameters provided.');
      }
    } else {
      console.error('No hint parameters provided in the URL.');
      alert('No hint parameters provided in the URL.');
    }
  }

  showReward() {
    this.rewardVisible = true;
  }

  hideReward() {
    this.rewardVisible = false;
  }
}
