export interface Device {
  Name: string;
  temp: number | string;
  location: string;
  campus: string;
  humidity: number | string;
  room: string;
  status: 'alert' | 'normal';
  type: string;
  time: string;
  date: string;
}

export interface Location {
  ID: number;
  NAME: string;
  SHORTCODE: string;
}

export interface DashboardData {
  deviceData: Device[];
  locations: Location[];
  alerts: string[];
  filter: string;
  summary: {
    totalLocations: number;
    activeAlerts: number;
    avgTemp: number | string;
    avgHumidity: number | string;
  };
}

export interface UnknownDevice {
  NAME: string;
  MAC: string;
  IP: string;
  FIRSTSEEN: string;
  LastSeen: string;
}

export interface Alarm {
  ID: number;
  EMAIL: string;
  TEMP: number;
}

export interface AdminData {
  devices: Device[];
  locations: Location[];
  alarms: Alarm[];
  unknowndevices: UnknownDevice[];
}
