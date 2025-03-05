import { PrimeModule } from '@/shared/prime/prime.module';
import { Component } from '@angular/core';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [PrimeModule],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.css',
})
export class AccessDeniedComponent {}
