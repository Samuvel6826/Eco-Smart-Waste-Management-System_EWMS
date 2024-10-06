import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { database, ref, remove, onValue } from '../firebase.config';
import { useNavigate } from 'react-router-dom';

const Bin = React.memo(({ locationId, binId, onDelete }) => {
    const [binData, setBinData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    // Function to handle delete confirmation modal
    const handleDelete = useCallback(() => {
        setShowModal(true);
    }, []);

    // Confirm deletion and call parent handler
    const confirmDelete = useCallback(async () => {
        try {
            const binRef = ref(database, `Trash-Bins/${locationId}/${binId}`);
            await remove(binRef);
            toast.success('Bin deleted successfully');
            onDelete(binId);
        } catch (error) {
            console.error('Error deleting bin:', error);
            toast.error('Error deleting bin. Please try again.');
        } finally {
            setShowModal(false);
        }
    }, [binId, locationId, onDelete]);

    // Close modal without deleting
    const handleCloseModal = useCallback(() => {
        setShowModal(false);
    }, []);

    useEffect(() => {
        const binRef = ref(database, `Trash-Bins/${locationId}/${binId}`);
        const unsubscribe = onValue(binRef, (snapshot) => {
            if (snapshot.exists()) {
                setBinData(snapshot.val());
            } else {
                console.log('No data available for this bin');
                toast.error('No data available for this bin');
                setBinData(null);
            }
        });

        return () => unsubscribe();
    }, [locationId, binId]);

    if (!binData) return <p className="text-red-500">Loading bin data...</p>;

    return (
        <>
            <div className="mb-4 rounded-lg bg-gray-100 p-4 text-black shadow-md">
                <h3 className="text-lg font-semibold">Bin Location: {binData.location || 'N/A'}</h3>
                <p>Bin ID: {binData._id || 'N/A'}</p>
                <p>GeoLocation: {binData.geoLocation || 'N/A'}</p>
                <p>Distance: {binData.distance || 0} cm</p>
                <p>Bin Color: {binData.binColor || 'N/A'}</p>
                <p>Bin Lid Status: {binData.binLid_status || 'N/A'}</p>
                <p>MicroProcessor Status: {binData.microProcessor_status || 'N/A'}</p>
                <p>Sensor Status: {binData.sensor_status || 'N/A'}</p>

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