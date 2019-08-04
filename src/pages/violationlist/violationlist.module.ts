import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViolationlistPage } from './violationlist';

@NgModule({
  declarations: [
    ViolationlistPage,
  ],
  imports: [
    IonicPageModule.forChild(ViolationlistPage),
  ],
})
export class ViolationlistPageModule {}
