import { Component, OnInit, Input } from '@angular/core';
import { EventInfo, InfoTab, MusicTab, VenueTab, UpComingTab } from '../data.model';
import { HttpClient } from '@angular/common/http';
import { trigger , state, style, animate, transition} from '@angular/animations';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'app-event-table',
  templateUrl: './event-table.component.html',
  styleUrls: ['./event-table.component.css'],
  animations: [
    trigger('tabsAnimation', [
      state('event' , style({ opacity: 1, transform: 'translateX(0)' })),
      state('detail' , style({ opacity: 1, transform: 'translateX(0)' })),
      transition('event => detail', [
        style({transform: 'translateX(-100%)'}),
        animate(200)
      ]),
      transition('detail => event', [
        style({transform: 'translateX(100%)'}),
        animate(200)
      ]),
    ]),
    trigger('toggleRows', [
      state('more', style({height: 200})),
      state('less', style({height: 0, display: 'none'})),
      transition('more => less', [animate(200)]),
      transition('less => more', [animate(200)]),
    ]
    )
  ]
})
export class EventTableComponent implements OnInit {
  private _events:  EventInfo[];
  @Input()
  set events(events: EventInfo[]) {
    this._events = events;
    this.modify(this._events);
    this.selectedNumber = -1;
    this.disableDetail = true;
    if (events && events.length === 0) {
      this.musician_arr = [];
      this.photos_arr = [];
      this.spotify_arr = [];
      this.sortedUpcoming = [];
      this.defaultUpcoming = [];
    }
    this.show_table = true;
  }
  get events() {
    this.hideEntire = false;

    return this._events;
  }

  displayedColumns: string[] = ['position', 'date', 'event', 'category', 'venue', 'favorite'];
  hideEntire = true;
  resultsSelected = true;
  show_table = true;
  show_results = true;
  searchFail = false;
  event_info: InfoTab;
  event_selected = '';
  event_id_selected = '';
  event_info_json_selected = {};
  musician_arr = Array();
  others_arr = Array();
  photos_arr = Array();
  spotify_arr = Array();
  venue_addr: VenueTab;
  selected_tab = 'events';
  defaultUpcoming = Array();
  sortBy = 'default';
  ascending = true;
  button1 = 'Default';
  button2 = 'Ascending';
  showProgress2 = false;
  hideRows = true;
  toggleRowsButtonName = 'Show More';
  tweet = '';
  favorite_no_records = true;
  favoriteMap = new Map<string, EventInfo>();
  favoriteEvents = Array();
  show_favorate = 'FAVORITE';
  selectedNumber = -1;
  disableDetail = true;

  eventAsc = Array();
  eventDes = Array();
  timeAsc = Array();
  timeDes = Array();
  artistAsc = Array();
  artistDes = Array();
  typeAsc = Array();
  typeDes = Array();
  sortedUpcoming = Array();

  // serverUrl = 'http://localhost:8081';
  // serverUrl = 'http://csci571hw88888.us-west-1.elasticbeanstalk.com';
   serverUrl = 'http://cs571sohard.us-west-1.elasticbeanstalk.com';

  openModal(content) {
    this.modalService.open(content);
  }

  toggleRows() {
    this.hideRows = !this.hideRows;
    if (this.toggleRowsButtonName === 'Show More') {
      this.toggleRowsButtonName = 'Show Less';
    } else {
      this.toggleRowsButtonName = 'Show More';
    }
  }

  clickResults() {
    this.show_results = true;
  }

  clickFavorites() {
    this.show_results = false;
  }

  clickList() {
    this.show_table = true;
    this.show_results = true;
    this.selected_tab = 'events';
  }

  clickDetail() {
    this.show_table = false;
  }

  clickFavorite() {
    console.log('FAVORITE!');
  }

  clickFavorite2(id: string, event: EventInfo) {
    if (!this.favoriteMap.has(id)) {
      this.favoriteMap.set(id, event);
      localStorage.setItem(id, JSON.stringify(event));
    } else {
      this.favoriteMap.delete(id);
      localStorage.removeItem(id);
    }
    this.favoriteEvents = Array();
    this.favoriteMap.forEach((value, key) => {
      this.favoriteEvents.push(value);
    });
    console.log(event);
    console.log(this.favoriteMap);
    console.log(this.favoriteEvents);
  }

  clickTwitter() {
    let tmUrl = '';
    if (this.event_info.buy_ticket_at) {
      tmUrl = this.event_info.buy_ticket_at;
    }
    this.tweet = 'Check out' + this.event_selected + 'located at ' + this.event_info.venue + '. Website:';
    const twitterUrl = 'https://twitter.com/intent/tweet?text=' + this.tweet + '&url=' + tmUrl + '&hashtags=CSCI571EventSearch';
    window.open(twitterUrl);
    console.log('TWITTER!' + tmUrl);
  }

  clickDefault() {
    this.sortBy = 'default';
    this.sortedUpcoming = this.defaultUpcoming.slice(0);
    this.button1 = 'Default';
  }

  clickEvent() {
    this.sortBy = 'event';
    if (this.ascending) { this.sortedUpcoming = this.eventAsc.slice(0); } else {this.sortedUpcoming = this.eventDes.slice(0); }
    this.button1 = 'Event Name';
  }

  clickTime() {
    this.sortBy = 'time';
    if (this.ascending) { this.sortedUpcoming = this.timeAsc.slice(0); } else {this.sortedUpcoming = this.timeDes.slice(0); }
    this.button1 = 'Time';
  }

  clickArtist() {
    this.sortBy = 'artist';
    if (this.ascending) { this.sortedUpcoming = this.artistAsc.slice(0); } else {this.sortedUpcoming = this.artistDes.slice(0); }
    this.button1 = 'Artist';
  }

  clickType() {
    this.sortBy = 'type';
    if (this.ascending) { this.sortedUpcoming = this.typeAsc.slice(0); } else {this.sortedUpcoming = this.typeDes.slice(0); }
    this.button1 = 'Type';
  }

  clickAsd() {
    this.ascending = true;
    if (this.sortBy === 'event') {
      this.sortedUpcoming = this.eventAsc;
    } else if (this.sortBy === 'time' ) {
      this.sortedUpcoming = this.timeAsc;
    } else if (this.sortBy === 'artist' ) {
      this.sortedUpcoming = this.artistAsc;
    } else {
      this.sortedUpcoming = this.typeAsc;
    }
    this.button2 = 'Ascending';
  }

  clickDesc() {
    this.ascending = false;
    if (this.sortBy === 'event') {
      this.sortedUpcoming = this.eventDes;
    } else if (this.sortBy === 'time' ) {
      this.sortedUpcoming = this.timeDes;
    } else if (this.sortBy === 'artist' ) {
      this.sortedUpcoming = this.artistDes;
    } else {
      this.sortedUpcoming = this.typeDes;
    }
    this.button2 = 'Descending';
  }

  sortEverything() {
    this.sortedUpcoming = this.defaultUpcoming.slice(0);
    this.eventAsc = this.defaultUpcoming.slice(0);
    this.eventDes = this.defaultUpcoming.slice(0);
    this.timeAsc = this.defaultUpcoming.slice(0);
    this.timeDes = this.defaultUpcoming.slice(0);
    this.artistAsc = this.defaultUpcoming.slice(0);
    this.artistDes = this.defaultUpcoming.slice(0);
    this.typeAsc = this.defaultUpcoming.slice(0);
    this.typeDes = this.defaultUpcoming.slice(0);
    this.eventAsc.sort(function(a, b) {return a.name.localeCompare(b.name); });
    this.eventDes.sort(function(a, b) {return b.name.localeCompare(a.name); });
    this.artistAsc.sort(function(a, b) {return a.artist.localeCompare(b.artist); });
    this.artistDes.sort(function(a, b) {return b.artist.localeCompare(a.artist); });
    this.typeAsc.sort(function(a, b) {return a.type.localeCompare(b.type); });
    this.typeDes.sort(function(a, b) {return b.type.localeCompare(a.type); });
    this.timeAsc.sort(function(b, a) {return new Date(b.dateTime) >= new Date(a.dateTime) ? 1 : -1; });
    this.timeDes.sort(function(a, b) {return new Date(b.dateTime) >= new Date(a.dateTime) ? 1 : -1; });
    console.log(this.timeAsc);
    console.log(this.eventAsc);
  }

  constructor(private http: HttpClient, private modalService: NgbModal) { }

  ngOnInit() {
    // console.log(this.events);
    if (localStorage.length > 0) {
      this.favorite_no_records = false;
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        this.favoriteMap.set(key, JSON.parse(localStorage.getItem(key)));
      }
      this.favoriteMap.forEach((value, key) => {
        this.favoriteEvents.push(value);
      });
    }
    console.log(localStorage.length);
  }

  modify(events: EventInfo[]) {
    if (!events) {
      return;
    }
    this.events.forEach(element => {
      element.event_abbr = this.cutting(element.event);
    });
  }

  cutting(name: string) {
    if (name.length <= 35) {
      return name;
    }
    name = name.substring(0, 34);
    while (name.charAt(name.length - 1) !== ' ') {
      name = name.slice(0, -1);
    }
    name = name.slice(0, -1);
    return name + '...';
  }


  async getDetails(eventId: string, eventName: string, eventJSON: EventInfo, i) {
    // console.log('hhhhhhh');
    this.selectedNumber = i;
    this.show_table = false;
    this.disableDetail = false;
    this.showProgress2 = true;
    this.musician_arr = Array();
    await this.getInfoTab(eventId);
    this.event_selected = eventName;
    this.event_id_selected = eventId;
    this.event_info_json_selected = eventJSON;
    if (this.event_info.category.toLocaleLowerCase().indexOf('music') !== -1) {
      this.musician_arr = this.event_info.artist_team.split('|');
      this.photos_arr = Array(this.musician_arr.length);
      this.spotify_arr = Array(this.musician_arr.length);
      for (let index = 0; index < this.musician_arr.length; index++) {
        this.getArtistTab(this.musician_arr[index], index);
        this.getPhotos(this.musician_arr[index], index);
      }
    } else {
      this.others_arr = this.event_info.artist_team.split('|');
      this.photos_arr = Array(this.others_arr.length);
      for (let index = 0; index < this.others_arr.length; index++) {
        this.getPhotos(this.others_arr[index], index);
      }
    }

    // this.getPhotos('houston rockets');
    this.getVenueTab(this.event_info.venue);
    this.getUpcoming(this.event_info.venue);
    this.showProgress2 = false;
  }

  getInfoTab(id: string) {
    return new Promise<void>((resolve) => {
      this.http.get<InfoTab>
      (this.serverUrl + '/api/getInfoTab?id=' + id)
      .subscribe(info_tab_res => {
        this.event_info = info_tab_res;
        console.log(this.event_info);
        if (!this.event_info) {
          this.searchFail = true;
        }
        resolve();
      });
    });
  }


  getArtistTab(musicianName: string, index: number) {
    this.http.get<MusicTab>
    (this.serverUrl + '/api/getMusicTab?artist=' + musicianName)
    .subscribe(music_tab_res => {
      this.spotify_arr[index] = music_tab_res;
      this.spotify_arr.forEach(element => {
        if (element) {
          element.followers = element.followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
      });
      console.log(music_tab_res);
      console.log(this.spotify_arr);
    });
  }

  getVenueTab(venueName: string) {
    this.http.get<VenueTab>
    (this.serverUrl + '/api/getVenueTab?venue=' + venueName)
    .subscribe(venue_tab_res => {
      this.venue_addr = venue_tab_res;
      console.log(this.venue_addr);
    });
  }

  getUpcoming(venueName: string) {
    this.http.get<UpComingTab[]>
    (this.serverUrl + '/api/getUpcoming?venue=' + venueName)
    .subscribe(upcoming_tab_res => {
      this.defaultUpcoming = upcoming_tab_res;
      console.log(this.defaultUpcoming);
    });
  }

  getPhotos(q_name: string, index: number) {
    this.http.get<string[]>
    (this.serverUrl + '/api/getPhotos?q_name=' + q_name)
    .subscribe(photo_arr => {
      this.photos_arr[index] = {name: q_name, photos: photo_arr};
      console.log(photo_arr);
      console.log(this.photos_arr);
    });
  }


}
