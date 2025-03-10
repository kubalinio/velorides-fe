import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { HlmH1Directive } from '@spartan-ng/ui-typography-helm';

@Component({
  templateUrl: './home.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, HlmH1Directive],
})
export class HomeComponent {}
