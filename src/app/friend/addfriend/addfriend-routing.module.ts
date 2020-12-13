import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddfriendPage } from './addfriend.page';

const routes: Routes = [
  {
    path: '',
    component: AddfriendPage
  },
  {
    path: ':key',
    loadChildren: () => import('./add/add.module').then( m => m.AddPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddfriendPageRoutingModule {}
