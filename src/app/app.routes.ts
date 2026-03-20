import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { HomeS } from './pages/home-s/home-s';
import { About } from './pages/about/about';
import { History } from './pages/history/history';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    component: Home
  },
  { 
    path: 'session', 
    component: HomeS,
    canActivate: [AuthGuard]
  },
  { 
    path: 'About', 
    component: About
  },
  { 
    path: 'History', 
    component: History,
    canActivate: [AuthGuard]
  },
  { 
    path: 'Login', 
    component: LoginComponent
  },
  // Redirect unknown paths to home
  { 
    path: '**', 
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
