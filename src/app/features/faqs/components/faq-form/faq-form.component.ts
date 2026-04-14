import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Faq } from '../../../../Core/models/faq.model';
import { Usuario } from '../../../../Core/models/usuario.model';

export interface FaqSavePayload {
  faq: Faq;
  nuevasRespuestas: string[];
}

@Component({
  selector: 'app-faq-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './faq-form.component.html',
  styleUrl: './faq-form.component.css',
})
export class FaqFormComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() faq: Faq | null = null;
  @Input() usuarios: Usuario[] = [];
  @Input() isSaving = false;
  @Input() isDeleting = false;
  @Input() isCreating = true;
  @Input() isLoadingUsuarios = false;
  @Input() errorMessage = '';
  @Input() successMessage = '';

  @Output() save = new EventEmitter<FaqSavePayload>();
  @Output() delete = new EventEmitter<Faq>();
  @Output() deletePermanent = new EventEmitter<Faq>();
  @Output() cancel = new EventEmitter<void>();
  @Output() restoreFaq = new EventEmitter<Faq>();

  readonly form = this.fb.nonNullable.group({
    _id: [''],
    user: ['', [Validators.required]],
    pregunta: ['', [Validators.required, Validators.maxLength(1000)]],
    IsDeleted: [false],
    nuevasRespuestasTexto: [''],
  });

  ngOnInit(): void {
    this.applyModeValidators();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['faq']) {
      this.patchForm(this.faq);
    }

    if (changes['isCreating']) {
      this.applyModeValidators();
    }
  }

  get userControl() {
    return this.form.controls.user;
  }

  get preguntaControl() {
    return this.form.controls.pregunta;
  }

  get nuevasRespuestasTextoControl() {
    return this.form.controls.nuevasRespuestasTexto;
  }

  get formTitle(): string {
    return this.isCreating ? 'Nueva FAQ' : 'Editar FAQ';
  }

  get formSubtitle(): string {
    return this.isCreating
      ? 'Completa los datos para crear una nueva pregunta frecuente.'
      : 'Modifica los datos de la FAQ seleccionada.';
  }

  get respuestasCount(): number {
    return Array.isArray(this.faq?.respuestas) ? this.faq!.respuestas.length : 0;
  }

  onSubmit(): void {
    this.applyModeValidators();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue();
    const nuevasRespuestas = this.extractNewResponses(rawValue.nuevasRespuestasTexto);

    const payload: Faq = {
      _id: rawValue._id || undefined,
      user: rawValue.user.trim(),
      pregunta: rawValue.pregunta.trim(),
      respuestas: this.extractRespostaIds(this.faq?.respuestas),
      IsDeleted: rawValue.IsDeleted ?? false,
    };

    this.save.emit({
      faq: payload,
      nuevasRespuestas,
    });
  }

  onDelete(): void {
    const currentFaq = this.buildCurrentFaqFromForm();

    if (!currentFaq || !currentFaq._id) {
      return;
    }

    this.delete.emit(currentFaq);
  }

  onDeletePermanent(): void {
    const currentFaq = this.buildCurrentFaqFromForm();

    if (!currentFaq || !currentFaq._id) {
      return;
    }

    if (
      confirm(
        '¿Estás seguro de que quieres borrar esta FAQ definitivamente de la base de datos?'
      )
    ) {
      this.deletePermanent.emit(currentFaq);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onRestore(event: MouseEvent, faq: Faq): void {
    event.preventDefault();
    event.stopPropagation();
    this.restoreFaq.emit(faq);
  }

  trackByUsuarioId(index: number, usuario: Usuario): string | number {
    return usuario._id ?? index;
  }

  private applyModeValidators(): void {
    this.userControl.setValidators([Validators.required]);
    this.preguntaControl.setValidators([
      Validators.required,
      Validators.maxLength(1000),
    ]);

    this.userControl.updateValueAndValidity({ emitEvent: false });
    this.preguntaControl.updateValueAndValidity({ emitEvent: false });
  }

  private patchForm(faq: Faq | null): void {
    this.form.reset({
      _id: faq?._id ?? '',
      user: this.extractUserId(faq?.user),
      pregunta: faq?.pregunta ?? '',
      IsDeleted: faq?.IsDeleted ?? false,
      nuevasRespuestasTexto: '',
    });

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private extractUserId(user: Faq['user'] | undefined): string {
    if (!user) {
      return '';
    }

    return typeof user === 'string' ? user : user._id;
  }

  private extractRespostaIds(respostas: Faq['respuestas'] | undefined): string[] {
    if (!Array.isArray(respostas)) {
      return [];
    }

    return respostas
      .map((resposta) =>
        typeof resposta === 'string' ? resposta : resposta._id
      )
      .filter((respostaId): respostaId is string => !!respostaId);
  }

  private buildCurrentFaqFromForm(): Faq | null {
    const rawValue = this.form.getRawValue();

    if (!rawValue._id && !rawValue.user.trim() && !rawValue.pregunta.trim()) {
      return null;
    }

    return {
      _id: rawValue._id || undefined,
      user: rawValue.user.trim(),
      pregunta: rawValue.pregunta.trim(),
      respuestas: this.extractRespostaIds(this.faq?.respuestas),
      IsDeleted: rawValue.IsDeleted ?? false,
    };
  }

  private extractNewResponses(value: string): string[] {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
}
