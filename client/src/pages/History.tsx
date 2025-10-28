import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function History() {
  const [searchParams] = useSearchParams();
  const [historyData, setHistoryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [table, setTable] = useState(searchParams.get('table') || '');
  const [date, setDate] = useState(
    searchParams.get('date') || new Date().toLocaleDateString('en-US')
  );

  useEffect(() => {
    if (table) {
      loadHistory();
    }
  }, []);

  const loadHistory = async () => {
    if (!table) return;

    try {
      setLoading(true);
      const data = await dashboardAPI.getHistory(table, date);
      setHistoryData(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadHistory();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Sensor History</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search History</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Device Name</label>
                <Input
                  placeholder="Enter device name"
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Search'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {historyData && (
          <Card>
            <CardHeader>
              <CardTitle>
                {historyData.device.Location} - {historyData.device.Campus}
              </CardTitle>
              <p className="text-sm text-gray-500">
                History for {historyData.currentDate}
              </p>
            </CardHeader>
            <CardContent>
              {historyData.history.length === 0 ? (
                <p className="text-gray-500">No data available for this date.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Time</th>
                        <th className="text-right p-2">Temperature (°F)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.history.map((reading: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{reading.time}</td>
                          <td className="text-right p-2">{reading.temp}°F</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
