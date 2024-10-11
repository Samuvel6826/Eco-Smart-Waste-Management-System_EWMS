import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from './common/Navbar';
import Bin from './Bin';
import { useBinsContext } from '../contexts/BinsContext';

const Bins = () => {
  const { bins, locations, loading: binLoading, error: binError, deleteBin, fetchBins } = useBinsContext();

  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem('selectedLocation') || '';
  });

  const fetchBinsData = useCallback(async () => {
    try {
      await fetchBins();
    } catch (error) {
      console.error('Failed to fetch bins:', error);
      toast.error('Failed to fetch bins. Please try again.');
    }
  }, [fetchBins]);

  useEffect(() => {
    fetchBinsData();
  }, [fetchBinsData]);

  useEffect(() => {
    if (locations.length > 0 && !selectedLocation) {
      const initialLocation = locations[0];
      setSelectedLocation(initialLocation);
      localStorage.setItem('selectedLocation', initialLocation);
    }
  }, [locations, selectedLocation]);

  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    setSelectedLocation(newLocation);
    localStorage.setItem('selectedLocation', newLocation);
  };

  const handleBinDelete = async (binId) => {
    toast.remove();
    try {
      await deleteBin(selectedLocation, binId);
      toast.success('Bin successfully deleted!');
      // Refetch bins to update the list
      fetchBinsData();
    } catch (error) {
      console.error('Failed to delete bin:', error);
      toast.error('Failed to delete bin. Please try again.');
    }
  };

  if (binLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl font-semibold">Loading bins...</div>
      </div>
    );
  }

  if (binError) {
    toast.error(binError);
    return null; // Return null to prevent rendering the rest of the component
  }

  const binsForSelectedLocation = bins[selectedLocation] || {};

  return (
    <div className='flex min-h-screen flex-col bg-gray-100'>
      <div className="bg-blue-600 p-4 text-white">
        <Navbar />
      </div>

      <div className="flex-grow p-4">
        <h1 className="mb-4 text-2xl font-bold">Bins List</h1>
        <div className="mb-4">
          <label htmlFor="location-select" className="mb-2 block text-lg font-semibold">Select Location:</label>
          <select
            id="location-select"
            value={selectedLocation}
            onChange={handleLocationChange}
            className="rounded border p-2"
          >
            <option value="">Select a location</option>
            {locations.map(location => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          {locations.map(location => (
            <div key={location}>
              <strong>{location}</strong>: {bins[location] ? Object.keys(bins[location]).length : 0} bins
            </div>
          ))}
        </div>

        {selectedLocation ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Object.keys(binsForSelectedLocation).length > 0 ? (
              Object.entries(binsForSelectedLocation).map(([binId, binData]) => (
                <Bin key={binId} locationId={selectedLocation} binId={binId} onDelete={handleBinDelete} />
              ))
            ) : (
              <p className="text-red-500">No bins found for this location.</p>
            )}
          </div>
        ) : (
          <p className="text-blue-500">Please select a location to view bins.</p>
        )}
      </div>
    </div>
  );
};

export default Bins;