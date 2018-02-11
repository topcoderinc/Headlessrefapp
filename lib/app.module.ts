import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Router } from '@angular/router';
import {APP_BASE_HREF} from '@angular/common';
import { RedocModule } from './redoc.module';
import { Redoc } from './components/index';
import { routes } from './app.routes';
@NgModule({
  imports: [ BrowserModule, RedocModule, RouterModule.forRoot(routes)],
  bootstrap: [ Redoc ],
  exports: [ Redoc ],
  providers: [{provide: APP_BASE_HREF, useValue : '/' }]
})
export class AppModule {
  constructor(public router: Router) {
    // output all route paths
    console.log(this.router.config.map(c=>c.path));
  }
}
