import { Routes } from '@angular/router';
import { HintComponent } from './pages/hint/hint.component';
import { GeneratorPageComponent } from './pages/generator-page/generator-page.component';
import { CodeVerificationComponent } from './pages/code-verification/code-verification.component';

export const routes: Routes = [
  { path: 'hint/:hintparams', component: HintComponent },
  { path: 'admin/generator', component: GeneratorPageComponent },
  { path: 'code/:codeparams', component: CodeVerificationComponent },
  { path: '', redirectTo: '/admin/generator', pathMatch: 'full' }, // Default route
];
