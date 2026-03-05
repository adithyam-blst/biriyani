import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {Home} from './pages/home/home';
import {HomeS} from './pages//home-s/home-s'
import { About } from './pages/about/about';
import { History } from './pages/history/history';


export const routes: Routes = [
  { path: '', component: Home},
  { path: 'session', component: HomeS},
  { path: 'About', component: About},
  { path: 'History', component: History}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}