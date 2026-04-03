import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  success(title: string): void {
    this.toast.fire({ icon: 'success', title });
  }

  error(title: string): void {
    this.toast.fire({ icon: 'error', title });
  }

  warning(title: string): void {
    this.toast.fire({ icon: 'warning', title });
  }

  info(title: string): void {
    this.toast.fire({ icon: 'info', title });
  }

  /** Confirmation modale (non-toast) avant action critique */
  async confirm(title: string, text: string): Promise<boolean> {
    const result = await Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1a5276',
      cancelButtonColor: '#85929e',
      confirmButtonText: 'Confirmer',
      cancelButtonText: 'Annuler'
    });
    return result.isConfirmed;
  }
}
