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
import { MatExpansionModule } from '@angular/material/expansion';
import { RulesComponent } from '../../components/rules/rules.component';

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
    MatExpansionModule,
    RulesComponent,
  ],
  templateUrl: './hint.component.html',
  styleUrl: './hint.component.scss',
})
export class HintComponent implements OnInit {
  // Variables to hold the data
  name: string = '';
  assignment: string = '';
  letterIndex: number = -1;
  encryptedLetter: string = '';
  decryptionHint: string = '';
  targetName!: string;

  // Other component variables
  rewardVisible: boolean = false;

  public _creators: { name: string }[] = [
    { name: 'Sascha' },
    { name: 'Wilco' },
    { name: 'Lara' },
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Get the 'hintparams' from the URL
    const hintParamsEncoded = this.route.snapshot.paramMap.get('hintparams');
    if (hintParamsEncoded) {
      try {
        // Decode from base64
        const decodedString = decodeURIComponent(atob(hintParamsEncoded));
        // Parse the JSON string
        const data = JSON.parse(decodedString);
        console.log('data', data);

        // Assign the data to component variables
        this.name = data.name || null;
        this.letterIndex = Number(data.letterIndex);
        this.assignment = data.assignment;
        this.encryptedLetter = data.encryptedLetter;
        this.decryptionHint = data.decryptionHint;
        this.targetName = data.targetName;
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

  public get creators(): string {
    if (this._creators.length === 1) {
      return this._creators[0].name;
    }

    return this._creators.reduce((acc, creator, index) => {
      if (index === this._creators.length - 1) {
        return [acc, 'en', '' + creator.name].join(' ');
      }

      if (index > 0) {
        return acc + ', ' + creator.name;
      }

      return creator.name;
    }, '');
  }
}
