import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private supabaseService = inject(SupabaseService);

  // Subir imagen
  async uploadImage(file: File, nombre: string): Promise<any> {
    const filePath = nombre;
    try {
      const { data, error } = await this.supabaseService.client.storage
        .from('Angular-Image') // Nombre del contenedor
        .upload(filePath, file);

      if (error) {
        console.error('Error al subir imagen:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en uploadImage:', error);
      throw error;
    }
  }

  async updateImge(file: File, filePath: string, pathUuid:string): Promise<any> {
    if (!file || !filePath) {
      throw new Error('El archivo y el nombre son requeridos');
    }

    try {
      // Eliminar la imagen existente
      const { error: deleteError } = await this.supabaseService.client.storage
        .from('Angular-Image')
        .remove([filePath]);

      if (deleteError) {
        console.error('Error al eliminar imagen:', deleteError.message);
        throw deleteError;
      }

      // Subir la nueva imagen
      const { data, error: uploadError } =
        await this.supabaseService.client.storage
          .from('Angular-Image')
          .upload(pathUuid, file);

      if (uploadError) {
        console.error('Error al subir imagen:', uploadError.message);
        throw uploadError;
      }
      return data;
    } catch (error) {
      console.error('Error en replaceImage:', error);
      throw error;
    }
  }
}
