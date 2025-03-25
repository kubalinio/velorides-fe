import { Component, inject, input, OnInit, output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HlmFormFieldModule } from '@spartan-ng/ui-formfield-helm';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports, HlmSelectModule } from '@spartan-ng/ui-select-helm';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { HlmButtonModule } from '@spartan-ng/ui-button-helm';

export interface WayFormData {
  name: string;
  surface: string;
  wayId: string;
}

@Component({
  standalone: true,
  selector: 'route-edit-form',
  imports: [
    ReactiveFormsModule,
    HlmFormFieldModule,
    HlmSelectModule,
    HlmInputDirective,
    HlmSelectImports,
    BrnSelectImports,
    HlmButtonModule,
  ],
  templateUrl: './edit-form.component.html',
})
export class EditFormComponent implements OnInit {
  wayData = input<any | null>(); // Way data from parent component
  formValid = output<boolean>(); // Emit form validity status
  formSubmit = output<WayFormData>(); // Emit form data when submitted

  _fb = inject(FormBuilder);
  _wayForm!: FormGroup;

  ngOnInit() {
    const wayInfo = this.wayData();
    const initialName = wayInfo?.properties?.['name'] || '';
    const initialSurface = wayInfo?.properties?.['surface'] || undefined;

    this._wayForm = this._fb.group({
      name: [initialName, Validators.maxLength(100)],
      surface: [
        initialSurface,
        Validators.pattern(
          /^(asphalt|paved|gravel|dirt|sand|ground|compacted|unpaved|N\/A)$/,
        ),
      ],
    });

    this._wayForm.get('surface')?.setValue(initialSurface);

    this._wayForm.statusChanges.subscribe(() => {
      this.formValid.emit(this._wayForm.valid);
    });

    this.formValid.emit(this._wayForm.valid);
  }

  surfaceOptions = [
    { value: 'asphalt', label: 'Asphalt' },
    { value: 'paved', label: 'Paved' },
    { value: 'gravel', label: 'Gravel' },
    { value: 'dirt', label: 'Dirt' },
    { value: 'sand', label: 'Sand' },
    { value: 'ground', label: 'Ground' },
    { value: 'compacted', label: 'Compacted' },
    { value: 'unpaved', label: 'Unpaved' },
    { value: undefined, label: 'N/A' },
  ];

  getSurfaceLabel(value: string): string {
    const option = this.surfaceOptions.find((opt) => opt.value === value);
    return option ? option.label : 'Select a surface';
  }

  isInvalid(controlName: string): boolean {
    const control = this._wayForm?.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  markAsTouched(): void {
    if (this._wayForm) {
      Object.keys(this._wayForm.controls).forEach((key) => {
        this._wayForm.get(key)?.markAsTouched();
      });
    }
  }

  submitForm(): void {
    if (this._wayForm && this._wayForm.valid) {
      this.formSubmit.emit({
        ...this._wayForm.value,
        wayId: this.wayData()?.id || '',
      });
    } else {
      this.markAsTouched();
    }
  }
}
