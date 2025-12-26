import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as Sentry from "@sentry/angular";

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [FormsModule, CommonModule, Sentry.TraceModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
  // Optional CSS classes for the button element
  @Input() buttonClass = '';
  @Input() type = 'button';
  @Input() width = 'auto';
  // Emits when the button is clicked
  @Output() clicked = new EventEmitter<void>();
}
