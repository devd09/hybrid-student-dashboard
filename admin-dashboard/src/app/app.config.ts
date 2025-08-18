import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient
} from '@angular/common/http';
import { CommonModule } from '@angular/common';     
import { FormsModule } from '@angular/forms';       
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(CommonModule, FormsModule),   
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
