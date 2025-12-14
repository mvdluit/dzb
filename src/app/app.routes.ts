import { Routes } from '@angular/router';
import { FileUpdater } from './file-updater/file-updater';
import { FileCompare } from './file-compare/file-compare';
import { NotFound } from './not-found/not-found';

export const routes: Routes = [
  { path: '', component: FileUpdater },
  { path: 'file-compare', component: FileCompare },
  { path: '**', component: NotFound },
];
