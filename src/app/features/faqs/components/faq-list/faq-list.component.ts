import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';

import { Faq } from '../../../../Core/models/faq.model';

@Component({
  selector: 'app-faqs-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './faq-list.component.html',
  styleUrl: './faq-list.component.css',
})
export class FaqsListComponent implements OnInit, OnDestroy {
  @Input() faqs: Faq[] = [];
  @Input() selectedFaqId: string | null = null;
  @Input() isLoading = false;
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalItems = 0;
  @Input() pageSize = 5;

  @Output() selectFaq = new EventEmitter<Faq>();
  @Output() createNew = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() previousPage = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() deletePermanent = new EventEmitter<string>();

  searchFaq = new FormControl('');
  destroy = new Subject<void>();

  ngOnInit(): void {
    this.searchFaq.valueChanges.subscribe((value) => {
      this.search.emit(value ?? '');
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  onSelect(faq: Faq): void {
    this.selectFaq.emit(faq);
  }

  onCreateNew(): void {
    this.createNew.emit();
  }

  onGoToPage(page: number): void {
    this.pageChange.emit(page);
  }

  onNextPage(): void {
    this.nextPage.emit();
  }

  onPreviousPage(): void {
    this.previousPage.emit();
  }

  onDeletePermanent(faqId: string, event: Event): void {
    event.stopPropagation();

    if (confirm('¿Estás seguro de que quieres borrar esta FAQ definitivamente?')) {
      this.deletePermanent.emit(faqId);
    }
  }

  isSelected(faq: Faq): boolean {
    return !!faq._id && faq._id === this.selectedFaqId;
  }

  trackByFaqId(index: number, faq: Faq): string | number {
    return faq._id ?? index;
  }

  getUserDisplay(faq: Faq): string {
    if (!faq.user) {
      return 'Sin usuario';
    }

    if (typeof faq.user === 'string') {
      return faq.user;
    }

    return faq.user.name || faq.user._id;
  }

  getRespuestasDisplay(faq: Faq): string {
    if (!Array.isArray(faq.respuestas) || faq.respuestas.length === 0) {
      return 'Sin respuestas';
    }

    return faq.respuestas
      .map((resposta) => {
        if (typeof resposta === 'string') {
          return resposta;
        }

        return resposta.respuesta || resposta._id || '-';
      })
      .join(', ');
  }

  formatDate(value?: string): string {
    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleString('es-ES');
  }

  getVisibleFields(faq: Faq): Array<{ label: string; value: string }> {
    return [
      {
        label: 'Usuario',
        value: this.getUserDisplay(faq),
      },
      {
        label: 'Pregunta',
        value: faq.pregunta || '-',
      },
      {
        label: 'Respuestas',
        value: this.getRespuestasDisplay(faq),
      },
      {
        label: 'Estado',
        value: faq.IsDeleted ? 'Eliminada' : 'Activa',
      },
      {
        label: 'Creado',
        value: this.formatDate(faq.createdAt),
      },
      {
        label: 'Actualizado',
        value: this.formatDate(faq.updatedAt),
      },
      {
        label: 'ID',
        value: faq._id || '-',
      },
    ];
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get showingFrom(): number {
    if (this.totalItems === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }
}
