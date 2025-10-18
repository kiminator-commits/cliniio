'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  fetchLocations,
  createLocation,
  deleteLocation,
  updateLocationStatus,
} from '@/services/location/locationService';
import type { Location } from '@/types/locationTypes';
import { Button } from 'react-bootstrap';

export default function LocationManagementPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [_parentId, _setParentId] = useState<string | null>(null);
  const [capacity, setCapacity] = useState<number | null>(null);
  const [_facilityId, _setFacilityId] = useState<string>(''); // populate from auth/session if available
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLocations(_facilityId);
      setLocations(data);
    } catch (_e) {
      console.error('Failed to fetch locations', _e);
    } finally {
      setLoading(false);
    }
  }, [_facilityId]);

  async function handleCreate() {
    if (!name || !barcode) return alert('Name and barcode are required');
    setCreating(true);
    try {
      await createLocation(
        _facilityId,
        name,
        barcode,
        _parentId ?? undefined,
        capacity ?? undefined
      );
      await loadData();
      setName('');
      setBarcode('');
      setCapacity(null);
    } catch {
      alert('Failed to create location');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this location?')) return;
    try {
      await deleteLocation(id);
      setLocations((prev) => prev.filter((l) => l.id !== id));
    } catch {
      alert('Failed to delete location');
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      await updateLocationStatus(id, status);
      await loadData();
    } catch {
      alert('Failed to update status');
    }
  }

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Location Management</h1>

      <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
        <h2 className="text-lg font-medium">Add New Location</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="form-control"
            placeholder="Location Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="form-control"
            placeholder="Barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
          <input
            className="form-control"
            placeholder="Capacity (optional)"
            type="number"
            value={capacity ?? ''}
            onChange={(e) => setCapacity(Number(e.target.value) || null)}
          />
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? 'Adding...' : 'Add Location'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-medium mb-2">Existing Locations</h2>
        {loading ? (
          <p className="flex items-center gap-2">Loading…</p>
        ) : locations.length === 0 ? (
          <p className="text-muted">No locations found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Barcode</th>
                <th className="text-left p-2">Capacity</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc) => (
                <tr key={loc.id} className="border-b hover:bg-muted/30">
                  <td className="p-2">{loc.name}</td>
                  <td className="p-2 font-mono">{loc.barcode}</td>
                  <td className="p-2">{loc.capacity ?? '—'}</td>
                  <td className="p-2">
                    <select
                      className="form-select"
                      value={loc.status}
                      onChange={(e) =>
                        handleStatusChange(loc.id, e.target.value)
                      }
                    >
                      <option value="active">Active</option>
                      <option value="full">Full</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(loc.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
