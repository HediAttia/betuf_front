import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private snackBar: MatSnackBar) {}

  success(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['snack-success'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 4000,
      panelClass: ['snack-error'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  warning(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3500,
      panelClass: ['snack-warning'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  info(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
