import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from './common/Navbar';
import Bin from './Bin';
import { useBinsContext } from '../contexts/BinsContext';

const Bins = () => {
  const { bins, locations, loading: binLoading, error: binError, deleteBin, fetchBins } = useBinsContext();

  const [selectedLocation, setSelectedLocation] = useState(() => {
    const savedLocation = localStorage.getItem('selectedLocation');
    return savedLocation || ''; // Set to empty string if no saved location
  });

  // Fetch bins on component mount
  useEffect(() => {
    fetchBins().catch((error) => {
      console.error('Failed to fetch bins:', error); // Log error if fetching fails
      toast.error('Failed to fetch bins.');
    });
  }, [fetchBins]);

  // Set the first location as default if not already set
  useEffect(() => {
    if (locations.length > 0 && !selectedLocation) {
      const initialLocation = locations[0];
      setSelectedLocation(initialLocation);
      localStorage.setItem('selectedLocation', initialLocation); // Save to localStorage
    }
  }, [locations, selectedLocation]);

  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    setSelectedLocation(newLocation);
    localStorage.setItem('selectedLocation', newLocation);
  };

  const handleBinDelete = async (binId) => {
    toast.remove(); // Remove any existing toasts before showing a new one
    try {
      await deleteBin(selectedLocation, binId);
      toast.success('Bin successfully deleted!');
    } catch (error) {
      console.error('Failed to delete bin:', error); // Log error if deletion fails
      toast.error('Failed to delete bin.'); // Handle any deletion error
    }
  };

  // Handle loading and error states
  if (binLoading) return <div>Loading bins...</div>;
  if (binError) return <div className="text-red-500">{binError}</div>;

  // Correctly access bins based on the selected location
  const binsForSelectedLocation = bins[selectedLocation] || {}; // Access bins safely

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
            {locations.map(location => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Optional: Display number of bins for each location */}
        <div className="mb-4">
          {locations.map(location => (
            <div key={location}>
              <strong>{location}</strong>: {bins[location] ? Object.keys(bins[location]).length : 0} bins
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Object.keys(binsForSelectedLocation).length > 0 ? (
            Object.entries(binsForSelectedLocation).map(([binId, binData]) => (
              <Bin key={binId} locationId={selectedLocation} binId={binId} onDelete={handleBinDelete} />
            ))
          ) : (
            <p className="text-red-500">No bins found for this location.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bins;