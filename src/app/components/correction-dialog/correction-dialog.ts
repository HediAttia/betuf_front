import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-correction-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="cd-dialog">
      <div class="cd-header">
        <div class="cd-icon">⚠️</div>
        <h2 class="cd-title">Motif de correction</h2>
        <p class="cd-subtitle">Expliquez à l'ingénieur ce qui doit être corrigé (20 caractères minimum)</p>
      </div>

      <div class="cd-body">
        <textarea
          [(ngModel)]="commentaire"
          class="cd-textarea"
          rows="5"
          placeholder="Ex : Les constats sont insuffisants, veuillez détailler les observations de la voûte centrale et préciser la localisation des fissures constatées…">
        </textarea>
        <div class="cd-count" [class.ok]="commentaire.trim().length >= 20">
          {{ commentaire.trim().length }} / 20 min.
        </div>
      </div>

      <div class="cd-actions">
        <button class="cd-btn cd-btn-ghost" (click)="annuler()">Annuler</button>
        <button class="cd-btn cd-btn-danger"
                [disabled]="commentaire.trim().length < 20"
                (click)="confirmer()">
          Renvoyer pour correction
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cd-dialog {
      padding: 0;
      font-family: inherit;
    }
    .cd-header {
      padding: 24px 24px 16px;
      border-bottom: 1px solid #f1f5f9;
    }
    .cd-icon { font-size: 24px; margin-bottom: 8px; }
    .cd-title {
      margin: 0 0 6px;
      font-size: 18px;
      font-weight: 800;
      color: #1a2744;
    }
    .cd-subtitle {
      margin: 0;
      font-size: 13px;
      color: #64748b;
    }
    .cd-body {
      padding: 20px 24px 8px;
    }
    .cd-textarea {
      width: 100%;
      box-sizing: border-box;
      padding: 12px 14px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 14px;
      font-family: inherit;
      color: #1e293b;
      resize: vertical;
      line-height: 1.6;
      transition: border-color .15s;
      &:focus {
        outline: none;
        border-color: #f59e0b;
        box-shadow: 0 0 0 3px rgba(245,158,11,.12);
      }
    }
    .cd-count {
      text-align: right;
      font-size: 11px;
      color: #94a3b8;
      margin-top: 6px;
      &.ok { color: #16a34a; }
    }
    .cd-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 16px 24px 24px;
    }
    .cd-btn {
      padding: 9px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      font-family: inherit;
      transition: all .15s;
      &:disabled { opacity: .4; cursor: not-allowed; }
    }
    .cd-btn-ghost {
      background: none;
      color: #64748b;
      &:hover:not(:disabled) { background: #f1f5f9; }
    }
    .cd-btn-danger {
      background: #dc2626;
      color: #fff;
      &:hover:not(:disabled) { background: #b91c1c; }
    }
  `]
})
export class CorrectionDialog {
  commentaire: string = '';

  constructor(private dialogRef: MatDialogRef<CorrectionDialog>) {}

  confirmer(): void {
    if (this.commentaire.trim().length >= 20) {
      this.dialogRef.close(this.commentaire.trim());
    }
  }

  annuler(): void {
    this.dialogRef.close(null);
  }
}
