import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { authInterceptor } from './core/interceptor/auth.interceptor';
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { LOCALE_ID } from '@angular/core';

registerLocaleData(localeEsPe, 'es-PE');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    provideHttpClient(withInterceptors([authInterceptor])), // Agregar provideHttpClient con interceptores
    MessageService, // Agregar MessageService aquí
    ConfirmationService,
    { provide: LOCALE_ID, useValue: 'es-PE' }, // Configura la localización regiona
  ],
};
