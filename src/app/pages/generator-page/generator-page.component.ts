import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { QRCodeModule } from 'angularx-qrcode';
import { LocalStorageHintEntriesKey } from './generator-page.models';

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
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    QRCodeModule,
    MatIconModule,
    MatDivider,
    MatExpansionModule,
  ],
  templateUrl: './generator-page.component.html',
  styleUrl: './generator-page.component.scss',
})
export class GeneratorPageComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  entries: Entry[] = [
    {
      assignment: '',
      encryptedLetter: '',
      decryptionHint: '',
    },
  ];

  generatedEntries: {
    url: string;
    name?: string;
  }[] = [];

  ngOnInit(): void {
    const storedHintEntries = localStorage.getItem(LocalStorageHintEntriesKey);

    if (storedHintEntries) {
      this.entries = JSON.parse(storedHintEntries);

      this.generate(true);
    }
  }

  addEntry() {
    this.entries.push({
      assignment: '',
      encryptedLetter: '',
      decryptionHint: '',
    });
  }

  removeEntry(index: number) {
    this.entries.splice(index, 1);

    this.generate();
  }

  generate(fromLocalStorage?: boolean) {
    this.generatedEntries = this.entries.map((entry: Entry, index: number) => {
      const data = {
        name: entry.name,
        assignment: entry.assignment,
        letterIndex: index,
        encryptedLetter: entry.encryptedLetter,
        decryptionHint: entry.decryptionHint,
      };

      console.log('data', data);

      try {
        // Convert to JSON string
        const jsonString = JSON.stringify(data);

        // Encode to base64
        const base64Encoded = btoa(jsonString);

        // URL encode the base64 string
        const urlEncoded = encodeURIComponent(base64Encoded);

        // Construct the URL
        const url = `${window.location.origin}/hint/${urlEncoded}`;


        return { url: url, name: data.name };
      } catch (error) {
        console.error('Error encoding data:', error);
        return { url: 'Error generating URL' };
      }
    });

    if(!fromLocalStorage){
      localStorage.setItem(LocalStorageHintEntriesKey, JSON.stringify(this.entries));
    }
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
      this.entries = entries;
      this.generate();
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file.');
    }
  }
}
