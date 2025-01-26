import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  private supabase!: SupabaseClient;

  constructor() {
    try {
      this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false, // Desactiva el intento de renovar automáticamente el token
          detectSessionInUrl: false,
        }
      });
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
    }
  }

  get client() {
    return this.supabase;
  }
}
