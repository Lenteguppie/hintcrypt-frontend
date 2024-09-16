import { Component, OnInit } from '@angular/core';
import { LibPinBoxComponent } from '../../components/pin-box/pin-box.component';
import { FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-code-verification',
  standalone: true,
  imports: [LibPinBoxComponent, MatCardModule, MatButtonModule],
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
