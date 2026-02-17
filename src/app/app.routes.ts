import { Routes } from '@angular/router';
import { NodeListComponent } from './components/node-list/node-list.component';
import { NodeFormComponent } from './components/node-form/node-form.component';

export const routes: Routes = [
    { path: '', redirectTo: '/nodes', pathMatch: 'full' },
    { path: 'nodes', component: NodeListComponent },
    { path: 'nodes/new', component: NodeFormComponent },
    { path: 'nodes/edit/:id', component: NodeFormComponent }
];
