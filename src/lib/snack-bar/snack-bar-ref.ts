/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayRef} from '@angular/cdk/overlay';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {MatSnackBarContainer} from './snack-bar-container';

/** Event that is emitted when a snack bar is closed. */
export interface MatSnackBarClose {
  /** Whether the snack bar was closed using the action button. */
  closedByAction: boolean;
}

/**
 * Reference to a snack bar dispatched from the snack bar service.
 */
export class MatSnackBarRef<T> {
  /** The instance of the component making up the content of the snack bar. */
  instance: T;

  /**
   * The instance of the component making up the content of the snack bar.
   * @docs-private
   */
  containerInstance: MatSnackBarContainer;

  /** Subject for notifying the user that the snack bar has closed. */
  private _afterClosed = new Subject<MatSnackBarClose>();

  /** Subject for notifying the user that the snack bar has opened and appeared. */
  private _afterOpened = new Subject<void>();

  /** Subject for notifying the user that the snack bar action was called. */
  private _onAction = new Subject<void>();

  /** Whether the snack bar was closed using the action button. */
  private _closedByAction = false;

  /**
   * Timeout ID for the duration setTimeout call. Used to clear the timeout if the snackbar is
   * closed before the duration passes.
   */
  private _durationTimeoutId: number;

  constructor(containerInstance: MatSnackBarContainer,
              private _overlayRef: OverlayRef) {
    this.containerInstance = containerInstance;
    // Close the snackbar on action.
    this.onAction().subscribe(() => this.close());
    containerInstance._onExit.subscribe(() => this._finishClose());
  }

  /** Closes the snack bar. */
  close(): void {
    if (!this._afterClosed.closed) {
      this.containerInstance.exit();
    }
    clearTimeout(this._durationTimeoutId);
  }

  /** Marks the snackbar action clicked. */
  closeWithAction(): void {
    if (!this._onAction.closed) {
      this._closedByAction = true;
      this._onAction.next();
      this._onAction.complete();
    }
  }

  /** Closes the snack bar after some duration */
  _closeAfter(duration: number): void {
    this._durationTimeoutId = setTimeout(() => this.close(), duration);
  }

  /** Marks the snackbar as opened */
  _open(): void {
    if (!this._afterOpened.closed) {
      this._afterOpened.next();
      this._afterOpened.complete();
    }
  }

  /** Cleans up the DOM after closing. */
  private _finishClose(): void {
    this._overlayRef.dispose();

    if (!this._onAction.closed) {
      this._onAction.complete();
    }

    this._afterClosed.next({closedByAction: this._closedByAction});
    this._afterClosed.complete();
    this._closedByAction = false;
  }

  /**
   * Gets an observable that is notified when the snack bar is finished closing.
   */
  afterClosed(): Observable<MatSnackBarClose> {
    return this._afterClosed.asObservable();
  }

  /** Gets an observable that is notified when the snack bar has opened and appeared. */
  afterOpened(): Observable<void> {
    return this.containerInstance._onEnter;
  }

  /** Gets an observable that is notified when the snack bar action is called. */
  onAction(): Observable<void> {
    return this._onAction.asObservable();
  }

  /**
   * Dismisses the snack bar.
   * @deprecated Use `close` instead.
   */
  dismiss(): void {
    this.close();
  }

  /**
   * Gets an observable that is notified when the snack bar is finished closing.
   * @deprecated Use `afterClosed` instead.
   */
  afterDismissed(): Observable<MatSnackBarClose> {
    return this.afterClosed();
  }
}
