import { PrimeModule } from '@/shared/prime/prime.module';
import { Component, inject } from '@angular/core';
import { CategoriaService } from '../../categoria/infraestructure/categoria.service';
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '@/core/services/notification-service';
import {
  CategoriaFilterRequest,
  CategoriaResponse,
} from '../../categoria/domain/categoria.interface';
import { urlcategoria } from '@/core/constantes/constantes';

@Component({
  selector: 'app-reporte-inventario',
  standalone: true,
  imports: [PrimeModule],
  templateUrl: './reporte-inventario.component.html',
  styleUrl: './reporte-inventario.component.css',
})
export class ReporteInventarioComponent {
  private categoriaService = inject(CategoriaService);
  private confirmationService = inject(ConfirmationService);
  private notification = inject(NotificationService);
  tabs: { title: string; content: string }[] = [];

  urlCategoria: string = urlcategoria;
  isLoading: boolean = true;
  //api
  dataCategoria!: CategoriaResponse[];
  totalElements!: number;
  categoriaFilter: CategoriaFilterRequest = {
    page: 1,
    size: 10,
    sortBy: 'id',
    sortDir: 'asc',
  };
  responsiveOptions: any[] | undefined;

  ngOnInit() {
    this.loadCategorias();
    this.tabs = [
      { title: 'Tab 1', content: 'Tab 1 Content' },
      { title: 'Tab 2', content: 'Tab 2 Content' },
      { title: 'Tab 3', content: 'Tab 3 Content' },
    ];

    this.responsiveOptions = [
      {
        breakpoint: '1199px',
        numVisible: 1,
        numScroll: 1,
      },
      {
        breakpoint: '991px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '767px',
        numVisible: 1,
        numScroll: 1,
      },
    ];
  }

  loadCategorias() {
    this.categoriaService.findAllPaginated(this.categoriaFilter).subscribe({
      next: (data) => {
        this.dataCategoria = data.content;
        this.totalElements = data.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        console.log('Error al cargar categorías:' + error);
        this.isLoading = false;
      },
    });
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'not-found.png';
  }
}
