import { Component, OnInit, ViewEncapsulation, Input, ViewChildren, ChangeDetectionStrategy, Injector, Self, QueryList, forwardRef, Output, EventEmitter, ElementRef, ChangeDetectorRef } from '@angular/core';
import { LibPinBoxItemDirective } from '../pin-box-item-component/pin-box-item.component';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import {  DeviceDetectorService } from 'ngx-device-detector';

const PIN_BOX_CONTROL_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => LibPinBoxComponent),
  multi: true
};

@Component({
  selector: 'lib-pin-box',
  encapsulation: ViewEncapsulation.None,
  providers: [ PIN_BOX_CONTROL_ACCESSOR ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'lib-pin-box'
  },
  // [value]="_value[_getIndex(groupIndex, _boxInGroupIndex)]"
  template: `

    <div class="lib-pib-box__group" *ngFor="let _ of _groupList; let last = last; let groupIndex = index">
      <input
        *ngFor="let _ of _boxInGroupList; let _boxInGroupIndex = index"
        #inputElems
        lib-pin-box-input
        [type]="type"
        tabindex="0"
        [class.lib-pib-box__input--invalid]="_isBoxInvalid(_getIndex(groupIndex, _boxInGroupIndex))"
        [class.lib-pib-box__input--desktop]="_isDesktop"
        autocapitalize="off"
        [index]="_getIndex(groupIndex, _boxInGroupIndex)"
        [disabled]="_disabled"
        (valueChange)="_onPinValueChange($event.index)"
        (pasteValue)="_onPaste($event)"
        (focusNext)="_focusNext($event)"
        (focusPrev)="_focusPrev($event)"
        (blur)="_onBlur()">

      <div class="lib-pin-box__group-split-wrapper">
        <div class="lib-pin-box__group-split" [class.lib-pin-box__group-split--last]="last"></div>
      </div>

    </div>
  `,
  styles: [`

    .lib-pin-box {
      display: flex;
      flex-wrap: wrap;
    }

    .lib-pib-box__group {
      display: flex;
      justify-content: center;
    }

    .lib-pin-box__group-split-wrapper {
      width: 17px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0px 2px;
    }

    .lib-pin-box__group-split {
      width: 100%;
      height: 3px;
      background-color: rgba(0, 0, 0, 0.42);
    }

    .lib-pin-box__group-split--last {
      background-color: transparent;
    }

    .lib-pib-box__input {
      width: 2.5em;
      height: 2.5em;
      border: 1px solid rgba(0, 0, 0, 0.32);
      transition: border 0.2s, transform 0.2s;
      border-radius: 5px;
      margin: 0.3em;
      text-align: center;
      font-size: 18px;
      display; flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      -webkit-appearance: none;
    }

    .lib-pib-box__input--desktop:hover {
      border: 1px solid rgba(0, 0, 0, 0.8);
    }

    .lib-pib-box__input:focus {
      outline: none;
      border: 2px solid rgba(33, 150, 243, 0.8);
      // transform: scale(1.1);
      transform: translate(-1px, -2px) scale(1.05);
    }

    .lib-pib-box__input:disabled {
      background-color: initial;
      opacity: 0.6;
    }

    .lib-pib-box__input--invalid {
      border: 2px solid rgba(255, 0, 0, 0.5);
    }
  `]
})
export class LibPinBoxComponent implements OnInit, ControlValueAccessor {

  // ---- ControlValueAccessor ----
  public _disabled = false;
  public value = '';
  private onTouch: Function = () => {};
  private onCtrlChange: Function = () => {};

  registerOnTouched(fn) { this.onTouch = fn; }
  registerOnChange(fn) { this.onCtrlChange = fn; }
  writeValue(value: string) { this.value = value; }
  setDisabledState(isDisabled: boolean) { this._disabled = isDisabled; }


  // ---- Component logic ----

  @Input() length = 1;
  @Input() groupLength = 1;
  @Input() type: 'password' | 'text' = 'text';
  @Input() formControl: FormControl;
  @Input() errorsMessage: any;

  @ViewChildren(LibPinBoxItemDirective) pinBoxItemDirective: QueryList<LibPinBoxItemDirective>;
  @ViewChildren(LibPinBoxItemDirective, { read: ElementRef }) pinBoxItemElem: QueryList<ElementRef<HTMLInputElement>>;

  public _groupList: Array<any>;
  public _boxInGroupList: Array<any>;
  public _boxInGroupLength: number;
  public _isDesktop = true;

  @Output() private valueChanged = new EventEmitter<string[]>();

  constructor(
    private cd: ChangeDetectorRef,
    private deviceService: DeviceDetectorService
  ) {}

  ngOnInit() {

    this._groupList = Array(this.groupLength).fill(0);
    this._boxInGroupLength = Math.ceil(this.length / this.groupLength);
    this._boxInGroupList = Array(this._boxInGroupLength).fill(0);

    this._isDesktop = this.deviceService.isDesktop();
  }

  public _onBlur() {

    // On blur browser focus first body elem and then any other target.
    // but after setTimeout activeElement(Focused element) is correct element
    setTimeout(() => {

      const isAnyInputElemFocus =
        this.pinBoxItemElem.some(inputElem =>
          document.activeElement === inputElem.nativeElement
        );

      // Dirty: we don't need to make form as touch, if user dos't change any value and just select a box,then select somether else.
      if (!isAnyInputElemFocus && this.formControl.dirty) {
        this.onTouch();
        this.cd.detectChanges(); // Becuse of setTimeout
      }

    });

  }


  public _onPaste(pasetedValue: string) {

    const value = pasetedValue.slice(0, this.length);
    this.setValue(value);

    this.pinBoxItemDirective.forEach((pinBoxItem, index) =>
      pinBoxItem.value = this.value[index]
    );

    this._focusByIndex(this.value.length);
    this.onTouch();
  }

  public _onPinValueChange(index: number) {

    // Merge values and set all empty box to ' '.
    const value =
      this.pinBoxItemDirective.reduce((oldValue, inputDire) => {
        const pinValue = inputDire.value.trim().length === 1 ? inputDire.value.trim() : ' ';
        return oldValue + pinValue;
      }, '');

    this.setValue(value);
  }

  // Value of empty box have to be ' '.
  private setValue(value: string) {

    if (this.value === value) {
      return;
    }
    this.value = value;

    // To emit value and set value in to reactive form we don't need ' '.
    const valueAsList = value.split('').map(a => a !== ' ' ? a : '');

    this.valueChanged.emit(valueAsList);
    this.onCtrlChange(valueAsList.join(''));
  }

  public _focusByIndex(index: number) {

    const indexInBound = Math.max(0, Math.min(index, this.pinBoxItemElem.length - 1));

    const nextPinBox = this.pinBoxItemElem.toArray()[indexInBound].nativeElement;
    nextPinBox.focus();

  }

  public _focusNext(index: number) {
    if (index >= this.pinBoxItemElem.length - 1) {
      return;
    }

    const nextPinBox = this.pinBoxItemElem.toArray()[index + 1].nativeElement;
    nextPinBox.focus();

  }

  public _focusPrev(index: number) {
    if (index <= 0) {
      return;
    }

    const prevPinBox = this.pinBoxItemElem.toArray()[index - 1].nativeElement;
    prevPinBox.focus();
  }

  public _getIndex(groupIndex: number, boxInGroupIndex: number ) {
    return (groupIndex * (this._boxInGroupLength)) + boxInGroupIndex;
  }

  public _isBoxInvalid(index: number) {
    return this.formControl.touched && hasNotValue(this.value[index]);
  }

}

 function hasNotValue(value) {
    return !(value !== null && value !== undefined && value.trim() !== '');
  }
