import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useBinsHook } from '../../contexts/BinsContext';
import Bin from './Bin';
import { GoPlus } from "react-icons/go";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaExclamationTriangle } from "react-icons/fa";

const Bins = () => {
  const { bins, loading, error, fetchBins } = useBinsHook();
  const [selectedLocation, setSelectedLocation] = useState('');

  const fetchBinsData = useCallback(async () => {
    try {
      await fetchBins();
      toast.success('Bins data refreshed successfully!', { icon: '✅' });
    } catch (error) {
      console.error('Failed to fetch bins:', error);
      toast.error('Failed to fetch bins. Please try again.');
    }
  }, [fetchBins]);

  useEffect(() => {
    fetchBinsData();
  }, [fetchBinsData]);

  useEffect(() => {
    if (Object.keys(bins).length > 0) {
      const storedLocation = localStorage.getItem('selectedLocation');
      const validLocation = storedLocation && Object.hasOwn(bins, storedLocation)
        ? storedLocation
        : Object.keys(bins)[0];

      setSelectedLocation(validLocation);
      localStorage.setItem('selectedLocation', validLocation);
    }
  }, [bins]);

  const handleLocationChange = (newLocation) => {
    setSelectedLocation(newLocation);
    localStorage.setItem('selectedLocation', newLocation);
  };

  const binsForSelectedLocation = useMemo(() => bins[selectedLocation] || {}, [bins, selectedLocation]);

  const attentionNeededCount = useMemo(() => {
    return Object.values(binsForSelectedLocation).filter(bin =>
      bin.filledBinPercentage > 80 ||
      bin.binLidStatus?.toLowerCase() === 'open' ||
      bin.microProcessorStatus?.toLowerCase() === 'off' ||
      bin.sensorStatus?.toLowerCase() === 'off' ||
      bin.binActiveStatus?.toLowerCase() === 'inactive'
    ).length;
  }, [binsForSelectedLocation]);

  const renderLoading = () => (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );

  const renderError = () => (
    <div className="mt-4 rounded-lg bg-red-50 p-4 shadow-sm">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="h-6 w-6 text-red-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {error || 'An error occurred. Please try again.'}
          </h3>
        </div>
      </div>
    </div>
  );

  const renderLocationDropdown = () => (
    <div className="relative">
      <label htmlFor="location-select" className="mb-2 block text-sm font-medium text-gray-700">
        Select Location
      </label>
      <div className="relative">
        <select
          id="location-select"
          value={selectedLocation}
          onChange={(event) => handleLocationChange(event.target.value)}
          className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-8 text-gray-700 shadow-sm transition duration-150 ease-in-out focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {Object.keys(bins).map((location) => (
            <option key={location} value={location}>
              {location} ({Object.keys(bins[location]).length} bins)
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <FaMapMarkerAlt className="h-4 w-4" />
        </div>
      </div>
    </div>
  );

  const renderBinGrid = () => (
    <div className="flex h-full w-full flex-wrap items-center justify-center gap-4">
      {Object.entries(binsForSelectedLocation).length > 0 ? (
        Object.entries(binsForSelectedLocation).map(([binId, binData]) => (
          <div key={binId} className="h-full">
            <Bin
              locationId={selectedLocation}
              binId={binId}
              binData={binData}
            />
          </div>
        ))
      ) : (
        <div className="col-span-full">
          <div className="rounded-lg bg-gray-50 p-8 text-center">
            <h2 className="text-lg font-medium text-gray-500">No bins found for this location</h2>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Bins Management</h1>

              <div className="flex items-center space-x-4">
                {attentionNeededCount > 0 && (
                  <div className="flex items-center rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800">
                    <FaExclamationTriangle className="mr-1.5 h-4 w-4" />
                    {attentionNeededCount} bin{attentionNeededCount > 1 ? 's' : ''} need{attentionNeededCount === 1 ? 's' : ''} attention
                  </div>
                )}

                <Link
                  to={`/users/create-bin/${encodeURIComponent(selectedLocation)}`}
                  className={`inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${!selectedLocation ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  disabled={!selectedLocation}
                >
                  <GoPlus className="mr-1.5 h-4 w-4" />
                  Create New Bin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          {renderLocationDropdown()}
        </div>

        {loading ? renderLoading() :
          error ? renderError() :
            selectedLocation ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Bins in {selectedLocation}
                  </h2>
                </div>
                {renderBinGrid()}
              </div>
            ) : (
              <div className="rounded-lg bg-white p-8 text-center shadow">
                <h2 className="text-lg font-medium text-gray-500">
                  Please select a location to view bins
                </h2>
              </div>
            )}
      </main>
    </div>
  );
};

export default Bins;