import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Sentry from "@sentry/angular";

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, Sentry.TraceModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})

export class CardComponent {}
