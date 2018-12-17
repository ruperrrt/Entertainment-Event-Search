import { Component, OnInit} from '@angular/core';
import { FormControl, FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule} from '@angular/forms';
import { ViewChild } from '@angular/core';
import {EventInfo} from '../data.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css'],
})


export class SearchFormComponent implements OnInit {

  eventData: EventInfo[];
  @ViewChild('searchForm') form: NgForm;
  checkLocal = true;
  category = 'all';
  unit = 'miles';
  keywordValue = '';
  locationValue = '';
  myControl = new FormControl();
  lat = '';
  lng = '';
  distance = '10';
  submitted = false;
  cleared = false;
  showProgress = false;
  searchFail = false;

  // serverUrl = 'http://localhost:8081';
  // serverUrl = 'http://csci571hw88888.us-west-1.elasticbeanstalk.com';
   serverUrl = 'http://cs571sohard.us-west-1.elasticbeanstalk.com';

  categories = [{ type: 'All', value: 'all' },
    { type: 'Music', value: 'music' },
    { type: 'Sports', value: 'sports' },
    { type: 'Arts & Theatre', value: 'at' },
    { type: 'Film', value: 'film' },
    { type: 'Miscellaneous', value: 'miscellaneous' }
  ];

  units = [{type: 'Miles', value: 'miles'},
    {type: 'Kilometers', value: 'kms'}
  ];

  options: string[] = [];

  submitSearch(form: NgForm) {
    console.log(form.value);
    if (!form.value.keyword) {
      return;
    }
    // form.reset();
    this.checkLocal = form.value.location ? false : true;
    if (form.value.distance) {
     this.distance = form.value.distance;
    }
    this.category = form.value.category;
    this.unit = form.value.unit;
    this.getResult();

    /*this.category = 'all';
    this.unit = 'miles';
    this.cleared = false;
    (<HTMLInputElement>document.getElementById('category')).value = 'all';
    (<HTMLInputElement>document.getElementById('unit')).value = 'miles';
    console.log(this.keywordValue);*/
    // (<HTMLInputElement>document.getElementById('eventTable')).style.display = 'block';
  }

  local_check_flag(x) {
    if (x === 2)  {this.checkLocal = false; } else  {this.checkLocal = true; }
  }

  getAutoComplete() {
    this.http.get<{autocomplete: {name: string}[]}>(this.serverUrl + '/api/getAutoComplete?keyword=' + this.keywordValue)
    .subscribe((autoCompletes) => {
      // console.log('autoCompletes' , autoCompletes);
      this.options = [];
      for (let index = 0; index < autoCompletes.autocomplete.length; index++) {
        // console.log(autoCompletes.autocomplete);
        this.options.push(autoCompletes.autocomplete[index].name);
      }
      console.log(this.options);
    });
    // console.log(this.options);
  }

  clickClear() {
    this.form.reset({showProgress: false, category: 'all', unit: 'miles', location: '', distance: '10'});
    this.cleared = true;
    console.log(!this.submitted || this.cleared);
    this.eventData = Array();
  }

  alertFav() {
    alert('Please search first!');
  }
/**
 *   getGeoCode() {
    this.http.get('http://localhost:3000/api/getGeoCode?location=' + this.locationValue)
    .subscribe(geocode => {
      this.lat = geocode['lati'];
      this.lng = geocode['longi'];
      console.log(this.lat);
      console.log(this.lng);
    });
  }

 */

  getResult() {
    this.showProgress = true;
    console.log(this.lat);
    console.log(this.lng);
    this.http.get<EventInfo[]>
    (this.serverUrl + '/api/getEvents?lat=' + this.lat + '&lng=' + this.lng
    + '&distance=' + this.distance + '&keyword=' + this.keywordValue + '&category=' + this.category
    + '&location=' + this.locationValue + '&unit=' + this.unit)
    .subscribe(events => {
      console.log(events);
      events.sort((e1, e2) => e1.date.localeCompare(e2.date));
      this.eventData = events;
      this.submitted = true;
      this.showProgress = false;
      this.cleared = false;
      this.searchFail = false;
    }, error => {
      this.searchFail = true;
      this.showProgress = false;
    }
    );
  }

  onKey(event: any) {
    this.keywordValue = event.target.value;
    if (!this.keywordValue) {
      this.options = [];
      return;
    }
    this.getAutoComplete();
  }

  ngOnInit() {
    // this.getAutoComplete();
    this.checkLocal = true;
    this.category = 'all';
    this.unit = 'miles';
    this.http.get('http://ip-api.com/json').subscribe(resp => {
      this.lat = resp['lat'];
      this.lng = resp['lon'];
      // console.log(resp);
    });
  }

  /*private _filter(value: string): string[] {
    this.keywordValue = value;
    this.getAutoComplete();
    console.log(this.keywordValue);
    return this.options;
  }*/

  constructor(private http: HttpClient) { }
}
