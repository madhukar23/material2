import {Subject} from 'rxjs/Subject';


/**
 * Class to be used to power selecting one or more options from a list.
 * @docs-private
 */
export class SelectionModel<T> {
  /** Currently-selected values. */
  private _selection: Set<T> = new Set();

  /** Keeps track of the deselected options that haven't been emitted by the change event. */
  private _deselectedToEmit: T[] = [];

  /** Keeps track of the selected option that haven't been emitted by the change event. */
  private _selectedToEmit: T[] = [];

  /** Cache for the array value of the selected items. */
  private _selected: T[];

  /** Selected value(s). */
  get selected(): T[] {
    if (!this._selected) {
      this._selected = Array.from(this._selection.values());
    }

    return this._selected;
  }

  /** Event emitted when the value has changed. */
  onChange: Subject<SelectionChange<T>> = new Subject();

  constructor(private _isMulti = false, initiallySelectedValues?: T[]) {
    if (initiallySelectedValues) {
      if (_isMulti) {
        initiallySelectedValues.forEach(value => this._select(value));
      } else {
        this._select(initiallySelectedValues[0]);
      }

      // Clear the array in order to avoid firing the change event for preselected values.
      this._selectedToEmit.length = 0;
    }
  }

  /**
   * Selects a value or an array of values.
   */
  select(value: T): void {
    if (!this._isMulti) {
      this._clear();
    }

    this._select(value);
    this._flushChangeEvent();
  }

  /**
   * Deselects a value or an array of values.
   */
  deselect(value: T): void {
    this._deselect(value);
    this._flushChangeEvent();
  }

  /**
   * Determines whether a value is selected.
   */
  isSelected(value: T): boolean {
    return this._selection.has(value);
  }

  /**
   * Determines whether the model has a value.
   */
  isEmpty(): boolean {
    return this._selection.size === 0;
  }

  /**
   * Clears all of the selected values.
   */
  clear(): void {
    this._clear();
    this._flushChangeEvent();
  }

  /** Emits a change event and clears the records of selected and deselected values. */
  private _flushChangeEvent() {
    if (this._selectedToEmit.length || this._deselectedToEmit.length) {
      let eventData = new SelectionChange(this._selectedToEmit, this._deselectedToEmit);

      this.onChange.next(eventData);
      this._deselectedToEmit = [];
      this._selectedToEmit = [];
      this._selected = null;
    }
  }

  /** Selects a value. */
  private _select(value: T) {
    if (!this.isSelected(value)) {
      this._selection.add(value);
      this._selectedToEmit.push(value);
    }
  }

   /** Deselects a value. */
   private _deselect(value: T) {
     if (this.isSelected(value)) {
       this._selection.delete(value);
       this._deselectedToEmit.push(value);
     }
   }

  /** Clears out the selected values. */
  private _clear() {
    if (!this.isEmpty()) {
      this._selection.forEach(value => this._deselect(value));
    }
  }
}

/**
 * Describes an event emitted when the value of a MdSelectionModel has changed.
 * @docs-private
 */
export class SelectionChange<T> {
  constructor(public added?: T[], public removed?: T[]) { }
}
