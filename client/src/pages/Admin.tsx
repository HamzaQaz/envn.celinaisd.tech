import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import type { AdminData } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Trash2 } from 'lucide-react';

export default function Admin() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [deviceForm, setDeviceForm] = useState({
    name: '',
    campus: '',
    location: '',
    type: '',
    room: '',
  });

  const [locationForm, setLocationForm] = useState({
    name: '',
    shortcode: '',
  });

  const [alarmForm, setAlarmForm] = useState({
    email: '',
    temp: '',
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getData();
      setAdminData(data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.addDevice(deviceForm);
      setDeviceForm({ name: '', campus: '', location: '', type: '', room: '' });
      loadAdminData();
    } catch (error) {
      console.error('Error adding device:', error);
    }
  };

  const handleDeleteDevice = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete device ${name}?`)) {
      try {
        await adminAPI.deleteDevice(id, name);
        loadAdminData();
      } catch (error) {
        console.error('Error deleting device:', error);
      }
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.addLocation(locationForm);
      setLocationForm({ name: '', shortcode: '' });
      loadAdminData();
    } catch (error) {
      console.error('Error adding location:', error);
    }
  };

  const handleDeleteLocation = async (id: number) => {
    if (confirm('Are you sure you want to delete this location?')) {
      try {
        await adminAPI.deleteLocation(id);
        loadAdminData();
      } catch (error) {
        console.error('Error deleting location:', error);
      }
    }
  };

  const handleAddAlarm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.addAlarm({ email: alarmForm.email, temp: Number(alarmForm.temp) });
      setAlarmForm({ email: '', temp: '' });
      loadAdminData();
    } catch (error) {
      console.error('Error adding alarm:', error);
    }
  };

  const handleDeleteAlarm = async (id: number) => {
    if (confirm('Are you sure you want to delete this alarm?')) {
      try {
        await adminAPI.deleteAlarm(id);
        loadAdminData();
      } catch (error) {
        console.error('Error deleting alarm:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">No data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Devices Section */}
          <Card>
            <CardHeader>
              <CardTitle>Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddDevice} className="space-y-3 mb-4">
                <Input
                  placeholder="Device Name"
                  value={deviceForm.name}
                  onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Campus"
                  value={deviceForm.campus}
                  onChange={(e) => setDeviceForm({ ...deviceForm, campus: e.target.value })}
                  required
                />
                <Input
                  placeholder="Location"
                  value={deviceForm.location}
                  onChange={(e) => setDeviceForm({ ...deviceForm, location: e.target.value })}
                  required
                />
                <Input
                  placeholder="Type (e.g., MDF, IDF)"
                  value={deviceForm.type}
                  onChange={(e) => setDeviceForm({ ...deviceForm, type: e.target.value })}
                  required
                />
                <Input
                  placeholder="Room"
                  value={deviceForm.room}
                  onChange={(e) => setDeviceForm({ ...deviceForm, room: e.target.value })}
                  required
                />
                <Button type="submit" className="w-full">Add Device</Button>
              </form>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {adminData.devices.map((device: any) => (
                  <div
                    key={device.ID}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <div className="font-medium">{device.Name}</div>
                      <div className="text-sm text-gray-500">
                        {device.Campus} - {device.Location}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteDevice(device.ID, device.Name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Locations Section */}
          <Card>
            <CardHeader>
              <CardTitle>Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddLocation} className="space-y-3 mb-4">
                <Input
                  placeholder="Location Name"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Shortcode"
                  value={locationForm.shortcode}
                  onChange={(e) => setLocationForm({ ...locationForm, shortcode: e.target.value })}
                  required
                />
                <Button type="submit" className="w-full">Add Location</Button>
              </form>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {adminData.locations.map((location) => (
                  <div
                    key={location.ID}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <div className="font-medium">{location.NAME}</div>
                      <div className="text-sm text-gray-500">{location.SHORTCODE}</div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteLocation(location.ID)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alarms Section */}
          <Card>
            <CardHeader>
              <CardTitle>Temperature Alarms</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAlarm} className="space-y-3 mb-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={alarmForm.email}
                  onChange={(e) => setAlarmForm({ ...alarmForm, email: e.target.value })}
                  required
                />
                <Input
                  type="number"
                  placeholder="Temperature Threshold (°F)"
                  value={alarmForm.temp}
                  onChange={(e) => setAlarmForm({ ...alarmForm, temp: e.target.value })}
                  required
                />
                <Button type="submit" className="w-full">Add Alarm</Button>
              </form>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {adminData.alarms.map((alarm) => (
                  <div
                    key={alarm.ID}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <div className="font-medium">{alarm.EMAIL}</div>
                      <div className="text-sm text-gray-500">Threshold: {alarm.TEMP}°F</div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAlarm(alarm.ID)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Unknown Devices Section */}
          <Card>
            <CardHeader>
              <CardTitle>Unknown Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {adminData.unknowndevices.map((device, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <div className="font-medium">{device.NAME}</div>
                    <div className="text-sm text-gray-500">
                      MAC: {device.MAC} | IP: {device.IP}
                    </div>
                    <div className="text-xs text-gray-400">
                      Last Seen: {device.LastSeen}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
