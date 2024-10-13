import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useBinsContext } from '../contexts/BinsContext'; // Import the useBinsContext hook

const Bin = React.memo(({ locationId, binId, binData }) => {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const { deleteBin } = useBinsContext(); // Use the deleteBin function from context

    // Function to handle delete confirmation modal
    const handleDelete = useCallback(() => {
        setShowModal(true);
    }, []);

    // Confirm deletion and call deleteBin from context
    const confirmDelete = useCallback(async () => {
        try {
            await deleteBin(locationId, binId);
            toast.success('Bin deleted successfully');
        } catch (error) {
            console.error('Error deleting bin:', error);
            toast.error('Error deleting bin. Please try again.');
        } finally {
            setShowModal(false);
        }
    }, [binId, locationId, deleteBin]);

    // Close modal without deleting
    const handleCloseModal = useCallback(() => {
        setShowModal(false);
    }, []);

    if (!binData) return <p className="text-red-500">Loading bin data...</p>;

    // Safely destructure binData with default values
    const { binLocation = 'N/A', id = 'N/A', geoLocation = {}, distance = 0, binType = 'N/A', binLidStatus = 'N/A', microProcessorStatus = 'N/A', sensorStatus = 'N/A', filledBinPercentage = 0, maxBinCapacity = 'N/A' } = binData;

    return (
        <>
            <div className="mb-4 rounded-lg bg-gray-100 p-4 text-black shadow-md">
                <h3 className="text-lg font-semibold">Bin Location: {binLocation}</h3>
                <p>Bin ID: {id}</p>
                <p>GeoLocation: {`Latitude: ${geoLocation.latitude || 'N/A'}, Longitude: ${geoLocation.longitude || 'N/A'}`}</p>
                <p>Distance: {distance} cm</p>
                <p>Bin Type: {binType}</p>
                <p>Bin Lid Status: {binLidStatus}</p>
                <p>MicroProcessor Status: {microProcessorStatus}</p>
                <p>Sensor Status: {sensorStatus}</p>
                <p>Filled Bin Percentage: {filledBinPercentage}%</p>
                <p>Max Bin Capacity: {maxBinCapacity}</p>

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

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
                        <h2 className="mb-4 text-xl font-semibold">Confirm Deletion</h2>
                        <p>Are you sure you want to delete this bin?</p>
                        <div className="mt-6 flex justify-between">
                            <button
                                className="rounded bg-gray-300 px-4 py-2 font-semibold text-black hover:bg-gray-400"
                                onClick={handleCloseModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

Bin.displayName = 'Bin';

export default Bin;