import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'precioDescuento',
  standalone: true,
})
export class PrecioDescuentoPipe implements PipeTransform {
  transform(precio: number, descuento: number): number {
    if (!precio || !descuento) {
      return precio; // Si no hay descuento, retorna el precio original
    }
    return precio * (1 - descuento / 100);
  }
}
