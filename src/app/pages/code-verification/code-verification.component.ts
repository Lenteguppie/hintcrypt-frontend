import { Component, OnInit } from '@angular/core';
import { LibPinBoxComponent } from '../../components/pin-box/pin-box.component';
import { FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { LocalStorageEnteredCodeKey } from './code-verification.models';
import { RulesComponent } from '../../components/rules/rules.component';

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
    ClipboardModule,
    RulesComponent,
  ],
  templateUrl: './code-verification.component.html',
  styleUrl: './code-verification.component.scss',
})
export class CodeVerificationComponent implements OnInit {
  public name: string = '';
  public correct_code!: string;

  public isCorrectLength = false;

  private _code: string = '';

  invitationCodeCtrl = new FormControl('');

  public isCodeCorrect = false;
  public isCodeVerified = false;
  public requestLastHintAtCreator = true;

  public _creators: { name: string }[] = [
    { name: 'Sascha' },
    { name: 'Wilco' },
    { name: 'Lara' },
  ];

  errors = {
    required: 'Enter Invitation Code',
    minlength: 'Fill all fields',
  };

  constructor(private route: ActivatedRoute, private clipboard: Clipboard) {}

  ngOnInit(): void {
    this._getCodeParams();
    this._code = localStorage.getItem(LocalStorageEnteredCodeKey) || '';

    console.log(this._code);

    this.invitationCodeCtrl.setValue(this._code);

    this._subscribeToCodeFormChanges();
  }

  public verify() {
    this.isCodeVerified = true;
    this.isCodeCorrect = this._code === this.correct_code;
  }

  public copyCode() {
    if (this._code) {
      this.clipboard.copy(this._code);
    }
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

        this.requestLastHintAtCreator = data.lastHintByCreators || false;
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
      this.isCorrectLength = false;

      if (!value || value == null) {
        this._code = '';
        return;
      }

      this._code = value;
      this.isCorrectLength =
        this._code?.split('').filter((char) => char !== ' ').length ===
        this.correct_code.length;

      console.log('code', this._code);

      localStorage.setItem(LocalStorageEnteredCodeKey, this._code || '');

      console.log(this._code);

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
