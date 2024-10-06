import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { database, ref, onValue, remove } from '../firebase.config';
import { toast } from 'react-hot-toast';

const BinContext = createContext();

export const BinProvider = ({ children }) => {
    const [bins, setBins] = useState({});
    const [locations, setLocations] = useState([]);
    const [binLoading, setBinLoading] = useState(true);
    const [binError, setBinError] = useState(null);
    const prevDataRef = useRef();

    // Fetch bin data function for explicit fetching
    const fetchBinData = () => {
        setBinLoading(true);
        const binsRef = ref(database, 'Trash-Bins');

        const unsubscribe = onValue(binsRef, (snapshot) => {
            setBinLoading(false);
            if (snapshot.exists()) {
                const binsData = snapshot.val();
                if (JSON.stringify(binsData) !== JSON.stringify(prevDataRef.current)) {
                    setBins(binsData);
                    prevDataRef.current = binsData;
                    setLocations(Object.keys(binsData));
                    console.log("Fetched Data from Firebase:", binsData);
                    toast.success('Bins fetched successfully from Firebase!');
                }
            } else {
                console.error('No data found in Firebase.');
                toast.error('No bins found. Please check your Firebase data.');
            }
        }, (error) => {
            setBinLoading(false);
            console.error('Error fetching bins from Firebase:', error);
            toast.error('Error fetching bins from Firebase. Please try again.');
            setBinError('Error fetching bins.');
        });

        return unsubscribe;
    };

    useEffect(() => {
        const unsubscribe = fetchBinData(); // Initial fetch when the component mounts
        return () => unsubscribe(); // Cleanup function to remove the listener on unmount
    }, []);

    const deleteBin = (location, binId) => {
        const binRef = ref(database, `Trash-Bins/${location}/Bin-${binId}`);
        remove(binRef)
            .then(() => {
                setBins(prevData => {
                    const updatedData = { ...prevData };
                    if (updatedData[location]) {
                        delete updatedData[location][`Bin-${binId}`];
                    }
                    return updatedData;
                });
                toast.success('Bin deleted successfully!');
            })
            .catch((error) => {
                console.error('Error deleting bin from Firebase:', error);
                toast.error('Error deleting bin. Please try again.');
            });
    };

    return (
        <BinContext.Provider value={{ bins, binLoading, binError, fetchBinData, deleteBin, locations }}>
            {children}
        </BinContext.Provider>
    );
};

export const useBinContext = () => {
    return useContext(BinContext);
};