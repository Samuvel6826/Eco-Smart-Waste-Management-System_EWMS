import React, { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import Navbar from './common/Navbar';
import Bin from './Bin';
import { useBinContext } from '../contexts/BinsContext';

const Bins = () => {
  const { bins, locations, binLoading, binError, deleteBin } = useBinContext();

  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem('selectedLocation') || '';
  });

  console.log("Bins component re-rendered");

  // Set the first location as default if not already set
  useEffect(() => {
    console.log("Locations changed or component mounted");

    if (locations.length > 0 && !selectedLocation) {
      const initialLocation = locations[0];
      setSelectedLocation(initialLocation);
      localStorage.setItem('selectedLocation', initialLocation); // Save to localStorage
    }
  }, [locations, selectedLocation]);

  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    setSelectedLocation(newLocation);
    localStorage.setItem('selectedLocation', newLocation); // Save new location to localStorage
    console.log(`Location changed to: ${newLocation}`);
  };

  const handleBinDelete = (binId) => {
    toast.remove(); // Remove any existing toasts before showing a new one
    deleteBin(selectedLocation, binId);
    toast.success('Bin successfully deleted!');
    console.log(`Bin with ID ${binId} deleted`);
  };

  if (binLoading) return <div>Loading bins...</div>;
  if (binError) return <div className="text-red-500">{binError}</div>;

  return (
    <>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Object.entries(bins[selectedLocation] || {}).map(([binId, binData]) => (
              <Bin key={binId} locationId={selectedLocation} binId={binId} onDelete={handleBinDelete} />
            ))}
          </div>

          {Object.keys(bins[selectedLocation] || {}).length === 0 && (
            <p className="text-red-500">No bins found for this location.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Bins;