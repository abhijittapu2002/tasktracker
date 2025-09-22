import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // ✅ Handles routing dynamically
    provideHttpClient(), // ✅ Ensures API requests work
    importProvidersFrom(
      HttpClientModule, // ✅ Keep for HTTP requests
      NgbModalModule // ✅ Keep if using modal dialogs
    )
  ]
}).catch(err => console.error(err));