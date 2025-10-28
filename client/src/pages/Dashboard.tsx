import { useEffect, useState } from 'react';
import { socketService } from '../services/socket';
import { dashboardAPI } from '../services/api';
import type { Device, DashboardData } from '../types';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { formatTimeAgo } from '../lib/utils';
import { 
  Thermometer, 
  Droplets, 
  Clock, 
  RefreshCw, 
  AlertTriangle,
  Building,
} from 'lucide-react';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    setupSocket();

    return () => {
      socketService.disconnect();
    };
  }, [filter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getData(filter);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    const socket = socketService.connect();
    
    socket.on('dashboard:full', (payload: DashboardData) => {
      setDashboardData(payload);
    });

    socket.on('dashboard:diff', (diff: any) => {
      setDashboardData((prev) => {
        if (!prev) return prev;
        
        const deviceMap = new Map(prev.deviceData.map((d) => [d.Name, d]));
        
        // Apply updates
        diff.updated?.forEach((device: Device) => {
          deviceMap.set(device.Name, device);
        });
        
        // Apply additions
        diff.added?.forEach((device: Device) => {
          deviceMap.set(device.Name, device);
        });
        
        // Apply removals
        diff.removed?.forEach((name: string) => {
          deviceMap.delete(name);
        });

        const newSummary = { ...prev.summary, ...diff.summary };
        
        return {
          ...prev,
          deviceData: Array.from(deviceMap.values()),
          summary: newSummary,
        };
      });
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">No data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-md bg-white"
            >
              <option value="">All Locations</option>
              {dashboardData.locations.map((loc) => (
                <option key={loc.ID} value={loc.SHORTCODE}>
                  {loc.NAME}
                </option>
              ))}
            </select>
            <Button
              onClick={loadDashboardData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total Locations</p>
                  <p className="text-3xl font-bold mt-1">
                    {dashboardData.summary.totalLocations}
                  </p>
                </div>
                <Building className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Active Alerts</p>
                  <p className="text-3xl font-bold mt-1">
                    {dashboardData.summary.activeAlerts}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Avg Temperature</p>
                  <p className="text-3xl font-bold mt-1">
                    {dashboardData.summary.avgTemp}°F
                  </p>
                </div>
                <Thermometer className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Avg Humidity</p>
                  <p className="text-3xl font-bold mt-1">
                    {dashboardData.summary.avgHumidity}%
                  </p>
                </div>
                <Droplets className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Device Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboardData.deviceData.map((device) => (
            <Card
              key={device.Name}
              className={`transition-all ${
                device.status === 'alert' ? 'border-red-500 border-2 animate-pulse' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{device.room}</h3>
                    <p className="text-sm text-gray-500">
                      {device.location} ({device.campus})
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      device.status === 'alert'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {device.status === 'alert' ? 'Alert' : 'Normal'}
                  </span>
                </div>

                <div className="mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      device.type === 'MDF'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {device.type}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Temperature</span>
                    </div>
                    <span className="font-semibold">{device.temp}°F</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Humidity</span>
                    </div>
                    <span className="font-semibold">{device.humidity}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Last Updated</span>
                    </div>
                    <span className="text-sm text-gray-600">{formatTimeAgo(device.time)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
