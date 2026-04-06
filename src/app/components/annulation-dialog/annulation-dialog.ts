import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-annulation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './annulation-dialog.html',
  styleUrl: './annulation-dialog.scss'
})
export class AnnulationDialog {
  motif: string = '';

  constructor(
    public dialogRef: MatDialogRef<AnnulationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  confirmer(): void {
    if (this.motif.length >= 20) {
      this.dialogRef.close(this.motif);
    }
  }

  annuler(): void {
    this.dialogRef.close(null);
  }
}
