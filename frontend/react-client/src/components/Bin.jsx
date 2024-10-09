import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useBinsContext } from '../contexts/BinsContext';

const Bin = React.memo(({ locationId, binId }) => {
    const { bins, deleteBin, fetchBins, loading, error } = useBinsContext();
    const navigate = useNavigate();
    const [binData, setBinData] = useState(null);

    useEffect(() => {
        if (Object.keys(bins).length === 0) {
            fetchBins();
        } else {
            const foundBin = bins[locationId]?.[binId];
            if (foundBin) {
                setBinData(foundBin);
            } else {
                console.warn(`No bin found for binId: ${binId} in locationId: ${locationId}`);
                setBinData(null);
            }
        }
    }, [bins, locationId, binId, fetchBins]);

    // Show loading message or error message
    if (loading) {
        return <p className="text-blue-500">Loading bins...</p>;
    }

    if (error) {
        return <p className="text-red-500">Error: {error}</p>;
    }

    if (!binData) {
        return <p className="text-red-500">No bin found for this location.</p>;
    }

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this bin?')) {
            try {
                await deleteBin(locationId, binId);
                toast.success('Bin deleted successfully');
            } catch (error) {
                console.error('Error deleting bin:', error);
                toast.error('Error deleting bin. Please try again.');
            }
        }
    };

    return (
        <div className="mb-4 rounded-lg bg-gray-100 p-4 text-black shadow-md">
            <h3 className="text-lg font-semibold">Bin Location: {binData.binLocation || 'N/A'}</h3>
            <p>Bin ID: {binData.id || 'N/A'}</p>
            <p>GeoLocation: {`Latitude: ${binData.geoLocation.latitude}, Longitude: ${binData.geoLocation.longitude}` || 'N/A'}</p>
            <p>Distance: {binData.distance || 0} cm</p>
            <p>Bin Color: {binData.binType || 'N/A'}</p>
            <p>Bin Lid Status: {binData.binLidStatus || 'N/A'}</p>
            <p>MicroProcessor Status: {binData.microProcessorStatus || 'N/A'}</p>
            <p>Sensor Status: {binData.sensorStatus || 'N/A'}</p>

            <div className="mt-2 flex justify-between">
                <button
                    className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                    onClick={() => navigate(`/users/edit-bin/${locationId}/${binId}`)}
                >
                    Edit
                </button>
                <button
                    className="rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                    onClick={handleDelete}
                >
                    Delete
                </button>
            </div>
        </div>
    );
});

Bin.displayName = 'Bin';

export default Bin;