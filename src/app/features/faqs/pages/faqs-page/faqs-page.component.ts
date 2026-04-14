import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { Faq } from '../../../../Core/models/faq.model';
import { Resposta } from '../../../../Core/models/resposta.model';
import { Usuario } from '../../../../Core/models/usuario.model';
import { FaqsService } from '../../../../Core/services/faq.service';
import { RespostaService } from '../../../../Core/services/resposta.service';
import { UsuariosService } from '../../../../Core/services/usuarios.service';
import { FaqFormComponent } from '../../components/faq-form/faq-form.component';
import { FaqsListComponent } from '../../components/faq-list/faq-list.component';

@Component({
  selector: 'app-faqs-page',
  standalone: true,
  imports: [CommonModule, FaqFormComponent, FaqsListComponent],
  templateUrl: './faqs-page.component.html',
  styleUrl: './faqs-page.component.css',
})
export class FaqsPageComponent implements OnInit {
  private readonly faqsService = inject(FaqsService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly respostaService = inject(RespostaService);

  readonly faqs = signal<Faq[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly respostas = signal<Resposta[]>([]);
  readonly selectedFaq = signal<Faq | null>(null);

  readonly isLoading = signal(false);
  readonly isLoadingUsuarios = signal(false);
  readonly isLoadingRespostas = signal(false);
  readonly isSaving = signal(false);
  readonly isDeleting = signal(false);
  readonly isCreating = signal(true);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly currentPage = signal(1);
  readonly pageSize = signal(5);

  readonly searchFaq = signal('');

  readonly filteredFaqs = computed(() => {
    const term = this.searchFaq().toLowerCase().trim();
    const allFaqs = this.faqs();

    if (!term) {
      return allFaqs;
    }

    return allFaqs.filter((faq) =>
      faq.pregunta?.toLowerCase().includes(term)
    );
  });

  readonly totalItems = computed(() => this.filteredFaqs().length);

  readonly totalPages = computed(() => {
    const total = Math.ceil(this.totalItems() / this.pageSize());
    return total > 0 ? total : 1;
  });

  readonly paginatedFaqs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredFaqs().slice(start, end);
  });

  ngOnInit(): void {
    this.loadUsuarios();
    this.loadRespostas();
    this.loadFaqs();
  }

  onSearch(term: string): void {
    this.searchFaq.set(term);
    this.currentPage.set(1);
  }

  loadFaqs(selectedFaqId?: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.faqsService
      .getFaqs()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (faqs) => {
          const safeFaqs = Array.isArray(faqs) ? faqs : [];
          this.faqs.set(safeFaqs);

          this.ensureValidPage();

          if (selectedFaqId) {
            const faqRecienAfectada =
              safeFaqs.find((faq) => faq._id === selectedFaqId) ?? null;

            this.selectedFaq.set(
              faqRecienAfectada ? this.mapFaqToFormValue(faqRecienAfectada) : null
            );
            this.isCreating.set(false);
            return;
          }

          const selectedId = this.selectedFaq()?._id;

          if (selectedId) {
            const refreshedSelectedFaq =
              safeFaqs.find((faq) => faq._id === selectedId) ?? null;

            this.selectedFaq.set(
              refreshedSelectedFaq
                ? this.mapFaqToFormValue(refreshedSelectedFaq)
                : this.createEmptyFaq()
            );

            if (!refreshedSelectedFaq) {
              this.isCreating.set(true);
            }

            return;
          }

          this.selectedFaq.set(this.createEmptyFaq());
          this.isCreating.set(true);
        },
        error: (error) => {
          console.error('Error al cargar FAQs:', error);
          this.errorMessage.set('No se pudieron cargar las FAQs.');
        },
      });
  }

  loadUsuarios(): void {
    this.isLoadingUsuarios.set(true);

    this.usuariosService
      .getUsuarios()
      .pipe(finalize(() => this.isLoadingUsuarios.set(false)))
      .subscribe({
        next: (usuarios) => {
          this.usuarios.set(Array.isArray(usuarios) ? usuarios : []);
        },
        error: (error) => {
          console.error('Error al cargar usuarios:', error);
          this.errorMessage.set('No se pudieron cargar los usuarios.');
        },
      });
  }

  loadRespostas(): void {
    this.isLoadingRespostas.set(true);

    this.respostaService
      .getRespostas()
      .pipe(finalize(() => this.isLoadingRespostas.set(false)))
      .subscribe({
        next: (respostas) => {
          this.respostas.set(Array.isArray(respostas) ? respostas : []);
        },
        error: (error) => {
          console.error('Error al cargar respostas:', error);
          this.errorMessage.set('No se pudieron cargar las respostas.');
        },
      });
  }

  onCreateNew(): void {
    this.isCreating.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.selectedFaq.set(this.createEmptyFaq());
  }

  onSelectFaq(faq: Faq): void {
    this.isCreating.set(false);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.selectedFaq.set(this.mapFaqToFormValue(faq));
  }

  onSaveFaq(faqData: Faq): void {
    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.isCreating() || !faqData._id) {
      const createPayload = this.buildCreateFaqPayload(faqData);

      this.faqsService
        .createFaq(createPayload)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: (createdFaq) => {
            this.isCreating.set(false);
            this.successMessage.set('FAQ creada correctamente.');

            if (createdFaq._id) {
              this.loadFaqs(createdFaq._id);
            } else {
              this.loadFaqs();
            }
          },
          error: (error) => {
            console.error('Error al crear FAQ:', error);
            this.errorMessage.set(
              error?.error?.message ||
                error?.error?.details?.[0]?.message ||
                'No se pudo crear la FAQ.'
            );
          },
        });

      return;
    }

    const updatePayload = this.buildUpdateFaqPayload(faqData);

    this.faqsService
      .updateFaq(faqData._id, updatePayload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (updatedFaq) => {
          this.isCreating.set(false);
          this.successMessage.set('FAQ actualizada correctamente.');

          if (updatedFaq._id) {
            this.loadFaqs(updatedFaq._id);
          } else {
            this.loadFaqs();
          }
        },
        error: (error) => {
          console.error('Error al actualizar FAQ:', error);
          this.errorMessage.set(
            error?.error?.message ||
              error?.error?.details?.[0]?.message ||
              'No se pudo actualizar la FAQ.'
          );
        },
      });
  }

  onDeleteFaq(faq: Faq): void {
    if (!faq._id) {
      return;
    }

    const confirmed = window.confirm(
      `¿Seguro que quieres marcar como eliminada la FAQ "${faq.pregunta}"?`
    );

    if (!confirmed) {
      return;
    }

    this.isDeleting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.faqsService
      .updateFaq(faq._id, {
        IsDeleted: true,
      })
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('FAQ eliminada correctamente.');
          this.selectedFaq.set(this.createEmptyFaq());
          this.isCreating.set(true);
          this.loadFaqs();
        },
        error: (error) => {
          console.error('Error al eliminar FAQ:', error);
          this.errorMessage.set(
            error?.error?.message ||
              error?.error?.details?.[0]?.message ||
              'No se pudo eliminar la FAQ.'
          );
        },
      });
  }

  onDeletePermanent(faqId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.faqsService
      .permanentDeleteFaq(faqId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('FAQ eliminada permanentemente.');
          this.loadFaqs();
        },
        error: (error) => {
          console.error('Error al eliminar permanentemente la FAQ:', error);
          this.errorMessage.set('Error al eliminar permanentemente la FAQ.');
        },
      });
  }

  onRestore(faq: Faq): void {
    if (!faq || !faq._id) {
      return;
    }

    this.isLoading.set(true);

    this.faqsService
      .restoreFaq(faq._id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('FAQ restaurada con éxito.');
          this.loadFaqs(faq._id);
        },
        error: () => {
          this.errorMessage.set('Error al restaurar la FAQ.');
        },
      });
  }

  onCancelEdit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.selectedFaq.set(this.createEmptyFaq());
    this.isCreating.set(true);
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
  }

  onNextPage(): void {
    this.onPageChange(this.currentPage() + 1);
  }

  onPreviousPage(): void {
    this.onPageChange(this.currentPage() - 1);
  }

  trackByFaqId(index: number, faq: Faq): string | number {
    return faq._id ?? index;
  }

  private ensureValidPage(): void {
    if (this.currentPage() > this.totalPages()) {
      this.currentPage.set(this.totalPages());
    }

    if (this.currentPage() < 1) {
      this.currentPage.set(1);
    }
  }

  private createEmptyFaq(): Faq {
    return {
      user: '',
      pregunta: '',
      respuestas: [],
      IsDeleted: false,
    };
  }

  private mapFaqToFormValue(faq: Faq): Faq {
    return {
      _id: faq._id,
      user: this.extractUserId(faq.user),
      pregunta: faq.pregunta ?? '',
      respuestas: this.extractRespostaIds(faq.respuestas),
      IsDeleted: faq.IsDeleted ?? false,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt,
    };
  }

  private buildCreateFaqPayload(faq: Faq): Faq {
    return {
      user: this.extractUserId(faq.user),
      pregunta: faq.pregunta.trim(),
      respuestas: this.extractRespostaIds(faq.respuestas),
      IsDeleted: faq.IsDeleted ?? false,
    };
  }

  private buildUpdateFaqPayload(faq: Faq): Partial<Faq> {
    return {
      user: this.extractUserId(faq.user),
      pregunta: faq.pregunta.trim(),
      respuestas: this.extractRespostaIds(faq.respuestas),
      IsDeleted: faq.IsDeleted ?? false,
    };
  }

  private extractUserId(user: Faq['user']): string {
    if (typeof user === 'string') {
      return user;
    }

    return user?._id ?? '';
  }

  private extractRespostaIds(respostas: Faq['respuestas']): string[] {
    if (!Array.isArray(respostas)) {
      return [];
    }

    return respostas
      .map((resposta) => (typeof resposta === 'string' ? resposta : resposta._id))
      .filter((respostaId): respostaId is string => !!respostaId);
  }
}
