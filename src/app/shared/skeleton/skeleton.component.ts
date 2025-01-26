import { Component, Input, OnInit } from '@angular/core';
import { PrimeModule } from '../prime/prime.module';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [PrimeModule],
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.css',
})
export class SkeletonComponent implements OnInit {
  products: any[] = [];

  ngOnInit() {
    this.products = Array.from({ length: 10 }).map((_, i) => `Item #${i}`);
  }
}
