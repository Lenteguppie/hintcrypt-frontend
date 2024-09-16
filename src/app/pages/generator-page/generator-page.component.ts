import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';

import { QRCodeModule } from 'angularx-qrcode';
import {
  GeneratedEntry,
  LocalStorageGameInfoKey,
  LocalStorageHintEntriesKey,
} from './generator-page.models';
import { MatStepperModule } from '@angular/material/stepper';

interface Entry {
  name?: string;
  assignment: string;
  letterIndex?: number;
  encryptedLetter: string;
  decryptionHint: string;
}

@Component({
  selector: 'app-generator-page',
  standalone: true,
  imports: [
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    QRCodeModule,
    MatIconModule,
    MatDivider,
    MatExpansionModule,
    MatTooltipModule,
  ],
  templateUrl: './generator-page.component.html',
  styleUrl: './generator-page.component.scss',
})
export class GeneratorPageComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  receiverForm: FormGroup;

  hintsForm: FormGroup;

  public generatedTargetEntry!: GeneratedEntry;

  public generatedHintEntries: GeneratedEntry[] = [];

  constructor(private fb: FormBuilder) {
    this.hintsForm = this.fb.group({
      formArray: this.fb.array([this._createForm()]),
    });

    this.receiverForm = this.fb.group({
      name: [''],
      code: [''],
    });
  }

  ngOnInit(): void {
    const storedHintEntries = localStorage.getItem(LocalStorageHintEntriesKey);

    if (storedHintEntries) {
      this._loadFormArrayValues(JSON.parse(storedHintEntries));
    }

    const gameInfoEntries = localStorage.getItem(LocalStorageGameInfoKey);

    if (gameInfoEntries) {
      const parsedInfoEntries = JSON.parse(gameInfoEntries);
      this.receiverForm.patchValue(parsedInfoEntries);
    }

    this.receiverForm.valueChanges.subscribe(() => {
      this.generatedHintEntries = [];
    });

    this.hintsForm.valueChanges.subscribe(() => {
      this.generatedHintEntries = [];
    });
  }

  // Add a new form group to the form array
  public addEntry() {
    (this.hintsForm.get('formArray') as FormArray).push(this._createForm());
  }

  private _createForm(): FormGroup {
    return this.fb.group({
      name: [''],
      assignment: ['', Validators.required],
      encryptedLetter: ['', Validators.required],
      decryptionHint: ['', Validators.required],
    });
  }

  // Remove a form group from the form array
  public removeHint(index: number) {
    (this.hintsForm.get('formArray') as FormArray).removeAt(index);

    this._pushHintsToLocalStorage();
  }

  // Get the form array as a FormArray object
  get hintsArray(): FormArray {
    return this.hintsForm.get('formArray') as FormArray;
  }

  // Check if all forms in the formArray are valid
  areFormsValid(): boolean {
    return this.hintsArray.valid && this.hintsArray.length == 15;
  }

  // Function to load formArray values from localStorage into the formArray
  private _loadFormArrayValues(savedValues: any[]) {
    // Clear current form array if needed
    const formArrayControl = this.hintsForm.get('formArray') as FormArray;
    formArrayControl.clear(); // Clear any existing controls

    // Populate the form array with saved values
    savedValues.forEach((value) => {
      const newForm = this._createForm();
      newForm.patchValue(value); // Use patchValue to set the values
      formArrayControl.push(newForm);
    });
  }

  private _base64EncodeURLData(data: any, path: string) {
    try {
      // Convert to JSON string
      const jsonString = JSON.stringify(data);

      // Encode to base64
      const base64Encoded = btoa(jsonString);

      // URL encode the base64 string
      const urlEncoded = encodeURIComponent(base64Encoded);

      // Construct the URL
      const url = `${window.location.origin}/${path}/${urlEncoded}`;

      return { url: url, name: data['name'] };
    } catch (error) {
      console.error('Error encoding data:', error);
      return { url: 'Error generating URL' };
    }
  }

  generate(fromLocalStorage?: boolean) {
    const receiverValue = this.receiverForm.getRawValue();
    console.log('target', receiverValue);
    this.generatedTargetEntry = this._base64EncodeURLData(
      receiverValue,
      'code'
    );
    this.generatedHintEntries = this.hintsArray
      .getRawValue()
      .map((entry: Entry, index: number) => {
        const data = {
          name: entry.name,
          assignment: entry.assignment,
          letterIndex: index,
          encryptedLetter: entry.encryptedLetter,
          decryptionHint: entry.decryptionHint,
          targetName: this.receiverForm.get('name')?.value || null,
        };
        return this._base64EncodeURLData(data, 'hint');
      });

    if (!fromLocalStorage) {
      this._pushReceiverToLocalStorage();
      this._pushHintsToLocalStorage();
    }
  }

  private _pushReceiverToLocalStorage() {
    localStorage.setItem(
      LocalStorageGameInfoKey,
      JSON.stringify(this.receiverForm.getRawValue())
    );
  }

  private _pushHintsToLocalStorage() {
    localStorage.setItem(
      LocalStorageHintEntriesKey,
      JSON.stringify(this.hintsArray.getRawValue())
    );
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (fileExtension === 'csv') {
          this.parseCSV(content);
        } else {
          alert('Unsupported file format.');
        }
      };
      reader.readAsText(file);
    }
  }

  parseCSV(content: string) {
    try {
      const lines = content.split('\n').filter((line) => line.trim() !== '');
      const headers = lines[0].split(',').map((header) => header.trim());
      const entries = lines.slice(1).map((line, index) => {
        const values = line.split(',').map((value) => value.trim());
        const entry: any = {};
        headers.forEach((header, index) => {
          entry[header] = values[index] || '';
        });
        return {
          name: entry.name || null,
          assignment: entry.assignment || '',
          encryptedLetter: entry.encryptedLetter || '',
          decryptionHint: entry.decryptionHint || '',
        };
      });

      this._loadFormArrayValues(entries);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file.');
    }
  }
}
