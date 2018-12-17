export class EventInfo {
  date: string;
  event: string;
  category: string;
  venue_info: string;
  event_abbr: string;
  id: string;
}

export class InfoTab {
  artist_team: string;
  venue: string;
  time: string;
  category: string;
  price_range: string;
  ticket_status: string;
  buy_ticket_at: string;
  seat_map: string;
}

export class MusicTab {
  name: string;
  followers: string;
  popularity: string;
  url: string;
}

export class VenueTab {
  name: string;
  address: string;
  city: string;
  phoneNum: string;
  openHrs: string;
  generalRule: string;
  childRule: string;
  lat: number;
  lng: number;
}

export class UpComingTab {
  name: string;
  artist: string;
  dateTime: string;
  type: string;
  url: string;
}
