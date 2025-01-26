import { Component, forwardRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PrimeModule } from './shared/prime/prime.module';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterOutlet,PrimeModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',

  
})
export class AppComponent {
  title = 'app-demo';
  date: Date = new Date();
  value: string | undefined;
}
