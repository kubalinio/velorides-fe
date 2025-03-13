import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmH1Directive } from '@spartan-ng/ui-typography-helm';

@Component({
  templateUrl: './home.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    HlmH1Directive,
    NgOptimizedImage,
    HlmButtonDirective,
    RouterLink,
  ],
})
export class HomeComponent {}
