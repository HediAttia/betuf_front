import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-commentaire-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './commentaire-dialog.html',
  styleUrl: './commentaire-dialog.scss'
})
export class CommentaireDialog {
  commentaire: string = '';

  constructor(
    public dialogRef: MatDialogRef<CommentaireDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { visite: any }
  ) {}

  envoyer(): void {
    if (this.commentaire.trim().length >= 10) {
      this.dialogRef.close(this.commentaire.trim());
    }
  }

  annuler(): void {
    this.dialogRef.close(null);
  }
}
