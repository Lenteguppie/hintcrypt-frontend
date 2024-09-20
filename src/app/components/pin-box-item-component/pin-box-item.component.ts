import {
    ACCEPTABLE_KEY,
    ARROW_LEFT,
    ARROW_RIGHT,
    BACK_SPACE_CODE,
    FOCUS_NEXT_KEY,
    FOCUS_PREVIOUS_KEY,
    DELETE,
    TAB,
    V_KEY
    } from './pin-box-item.model';
  import {
    Directive,
    ElementRef,
    Input,
    OnInit,
    Output,
    EventEmitter,
    forwardRef,
    Inject
    } from '@angular/core';
  import { LibPinBoxComponent } from '../pin-component/pin-box.component';
  import { DeviceDetectorService } from 'ngx-device-detector';


  @Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[lib-pin-box-input]',
    host: {
      class: 'lib-pib-box__input',
      '(input)': '_onInput($event)',
      '(keydown)': '_onKeydown($event)',
      '(paste)': '_onPaste($event)',
      '(focus)': '_onFocus($event)',
    }
  })
  export class LibPinBoxItemDirective implements OnInit {


    set value(value: string) {
      // In Android:
      // If user try to change value at last box, then browser set no new value into input field
      // and oldValue and newValue in input are always same.
      // But if we don't set same value into inputFiled there in no problem any more.
      if (value === this.value) {
        return;
      }

      this.elemRef.nativeElement.value = value ? value.trim() : '';
    }
    get value() {
      return this.elemRef.nativeElement.value;
    }

    @Input() index: number | undefined;

    @Output() pasteValue = new EventEmitter<string>();
    @Output() valueChange = new EventEmitter<{value: string, index: number}>();
    @Output() focusNext = new EventEmitter<number>();
    @Output() focusPrev = new EventEmitter<number>();

    private valueOnKeydown: string | undefined;

    constructor(
      private elemRef: ElementRef<HTMLInputElement>,
      private deviceService: DeviceDetectorService
    ) { }


    ngOnInit() {
    }

    public _onFocus(e: FocusEvent) {

      // User want to chang value of a box.
      // If cursel is at left position of input field value, then work fine.
      // But cursel is at right position and on input broswer set no new value to input field.
      // oldVlaue and newValue are same at input event.
      // To avoid this bug, on focus we select all text in input field,
      // and on input browser override new value with old value
      if (this.isAndroid) {
        this.elemRef.nativeElement.select();
      }

    }

    public _onPaste(e: ClipboardEvent) {

      e.preventDefault();

      const pastedValue = e.clipboardData.getData('text').trim();
      const isPastedValueValid = this.isPastedValueValid(pastedValue);

      if (isPastedValueValid) {
        this.pasteValue.emit(pastedValue);
      }
    }


    // Just for Pc and Ios. In android event value is a deferent.
    // (e.key, e.keyCode for sring is allways 229)
    // On keydown: save current value of input field.
    // On input: update value of input field if new value is valid, otherwise set empty string
    public _onKeydown(e: KeyboardEvent) {

      this.valueOnKeydown = this.value;


      // Focus next element
      if (
        e.key === ARROW_RIGHT
        // (!e.shiftKey && e.key === TAB)
      ) {
        e.preventDefault();
        this._focusNext();
        return;
      }

      // Focus prev element
      if (
        (e.keyCode === BACK_SPACE_CODE && !this.hasValue) ||
        e.key === ARROW_LEFT
        // (e.shiftKey && e.key === TAB)
      ) {
        e.preventDefault();
        this._focusPrev();
        return;
      }

      // Remove value
      if (
        e.keyCode === BACK_SPACE_CODE ||
        e.key === DELETE
      ) {

        e.preventDefault();
        this.setValueAndEmit(null);
        return;
      }

    }

    public _onInput(e: KeyboardEvent) {

      // Android: some time if user type s same char as input field,
      // then value of input field is just one char, but it should be 2 char.
      // To fix it: we remove valueOnKeydown from current value of input field,
      // then if there is no value, then set oldValur to newValue
      let newChar = this.value.replace(this.valueOnKeydown, '');
      newChar = newChar ? newChar : this.valueOnKeydown;

      // Set value
      if ( isValidKey(newChar) ) {
        this.setValueAndEmit(newChar);
        this._focusNext();

      } else {
        this.setValueAndEmit(null);
      }

    }

    private setValueAndEmit(value) {

      this.value = value;
      this.valueChange.emit({value, index: this.index});
    }

    private isPastedValueValid(value: string) {

      if (typeof value !== 'string') {
        return false;
      }

      return Array.from(value).every(key => isValidKey(key));
    }


    private _focusNext() {

      this.focusNext.emit(this.index);
    }

    private _focusPrev() {

      this.focusPrev.emit(this.index);
    }

    private get hasValue() {
      return this.value.length === 1;
    }

    private get isAndroid() {
      return this.deviceService.os === 'Android';
    }

  }


  function isValidKey(key: string) {
    return (ACCEPTABLE_KEY as any).includes(key);
  }
