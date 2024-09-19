import { Component, Input, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [MatExpansionModule, MatIconModule],
  templateUrl: './rules.component.html',
  styleUrl: './rules.component.scss',
})
export class RulesComponent implements OnInit {
  @Input() name: string = '';
  juryMembers!: { name: string }[];

  ngOnInit(): void {
    this.juryMembers = [
      { name: 'Sascha' },
      { name: 'Wilco' },
      { name: 'Lara' },
    ];
  }

  public get jury(): string {
    // if (this.jury.length === 1) {
    //   return this.juryMembers[0].name;
    // }

    // return this.juryMembers.reduce((acc, member, index) => {
    //   if (index === this.jury.length - 1) {
    //     return [acc, 'en', '' + member.name].join(' ');
    //   }

    //   if (index > 0) {
    //     return acc + ', ' + member.name;
    //   }

    //   return member.name;
    // }, '');

    return 'Sascha, Wilco en Lara';
  }
}
