import {Routes} from '@angular/router';
import {Redoc, SecurityDefinitions} from './components/index';
import {MdRenderer} from '../lib/utils/md-renderer';
// below routes may did not cover all routes and just example codes to integrate with Routes module
export const routes: Routes = [
  {path: '', component: Redoc},
  {path: 'section/Authentication', component: SecurityDefinitions},
  {path: 'section/:sectionName', component: MdRenderer},
  {path: 'tag/:tagName', component: MdRenderer},
  {path: 'operation/:operationName', component: MdRenderer},
  { path: '**',component: MdRenderer },
];
