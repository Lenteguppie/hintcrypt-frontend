import { provideRouter, Routes, withDebugTracing } from '@angular/router';
import { HintComponent } from './pages/hint/hint.component';
import { ApplicationConfig } from '@angular/core';
import { GeneratorPageComponent } from './pages/generator-page/generator-page.component';

export const routes: Routes = [
  { path: 'hint/:hintparams', component: HintComponent },
  { path: 'admin/generator', component: GeneratorPageComponent },
  { path: '', redirectTo: '/admin/generator', pathMatch: 'full' },
  //   { path: '', redirectTo: '/hint', pathMatch: 'full' }, // Default route
];
