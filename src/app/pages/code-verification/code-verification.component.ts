import { Component, OnInit } from '@angular/core';
import { LibPinBoxComponent } from '../../components/pin-box/pin-box.component';
import { FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-code-verification',
  standalone: true,
  imports: [
    LibPinBoxComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule,
  ],
  templateUrl: './code-verification.component.html',
  styleUrl: './code-verification.component.scss',
})
export class CodeVerificationComponent implements OnInit {
  invitationCodeCtrl = new FormControl('');

  public name!: string;
  public correct_code!: string;

  public isCorrectLength = false;

  private _code: string | null = '';

  public isCodeCorrect = false;
  public isCodeVerified = false;
  public requestLastHintAtCreator = true;

  private _creators = ['Sascha', 'Wilco', 'Lara'];

  errors = {
    required: 'Enter Invitation Code',
    minlength: 'Fill all fields',
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this._getCodeParams();

    this._subscribeToCodeFormChanges();
  }

  public verify() {
    this.isCodeVerified = true;
    this.isCodeCorrect = this._code === this.correct_code;
    console.log('Is verified', this.isCodeVerified);
    console.log('Is correct', this.isCodeCorrect);
  }

  public get creators(): string {
    if (this._creators.length === 1) {
      return this._creators[0];
    }

    return this._creators.reduce((acc, creator, index) => {
      if (index === this._creators.length - 1) {
        return [acc, 'en ' + creator].join(' ');
      }

      return acc + ', ' + creator;
    }, '');
  }

  private _getCodeParams() {
    const hintParamsEncoded = this.route.snapshot.paramMap.get('codeparams');
    if (hintParamsEncoded) {
      try {
        // Decode from base64
        const decodedString = atob(decodeURIComponent(hintParamsEncoded));
        // Parse the JSON string
        const data = JSON.parse(decodedString);

        // Assign the data to component variables
        this.name = data.name || null;
        this.correct_code = data.code || null;
      } catch (error) {
        console.error('Failed to decode or parse code parameters:', error);
        alert('Invalid code parameters provided.');
      }
    } else {
      console.error('No code parameters provided in the URL.');
      alert('No code parameters provided in the URL.');
    }
  }

  private _subscribeToCodeFormChanges() {
    this.invitationCodeCtrl.valueChanges.subscribe((value: string | null) => {
      this.isCodeVerified = false;
      this.isCodeCorrect = false;
      if (!value) {
        this._code = '';
      }

      this._code = value;
      this.isCorrectLength =
        this._code?.split('').filter((char) => char !== ' ').length ===
        this.correct_code.length;

      if (this.isCorrectLength) {
        this.verify();
      }
    });
  }

  removeLog() {
    const logElem = document.querySelector('pre');

    if (!logElem) {
      return;
    }

    logElem.innerText = '';
  }

  onValueChanged(value: string[]) {
    // console.log('EMITTER', value);
  }
}
