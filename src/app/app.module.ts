import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { CdkTableModule } from '@angular/cdk/table';
import {
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatRippleModule
} from '@angular/material';
import { AppComponent } from './app.component';
import { SearchFormComponent } from './search-form/search-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EventTableComponent } from './event-table/event-table.component';
import { CdkTreeModule } from '@angular/cdk/tree';
import {MatTooltipModule} from '@angular/material/tooltip';

import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';

import {RoundProgressModule} from 'angular-svg-round-progressbar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
@NgModule({
  declarations: [
    AppComponent,
    SearchFormComponent,
    EventTableComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    CdkTreeModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatTableModule,
    CdkTableModule,
    BrowserAnimationsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCxskM9D4d1a_nQ6G2aoFBRhH9sQK6vd54'
    }),
    CommonModule,
    MatTooltipModule,
    RoundProgressModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
