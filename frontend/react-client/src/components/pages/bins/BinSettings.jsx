import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useBinsContext } from '../../contexts/BinsContext';
import { Card, CardHeader, CardBody, Typography, Tabs, TabsHeader, TabsBody, Tab, TabPanel } from "@material-tailwind/react";
import { BinSettingsForm } from './BinSettingsForm';
import { BinStatus } from './BinStatus';
import { BinLocation } from './BinLocation';

const BinSettings = () => {
    const { editBin, fetchBins, bins } = useBinsContext();
    const [isLoading, setIsLoading] = useState(true);
    const [currentBinData, setCurrentBinData] = useState(null);
    const [activeTab, setActiveTab] = useState("settings");
    const navigate = useNavigate();
    const { locationId, binId } = useParams();

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setIsLoading(true);

                // First, ensure bins are fetched
                if (!bins || Object.keys(bins).length === 0) {
                    await fetchBins();
                }

                // Check if component is still mounted
                if (!isMounted) return;

                // Access the bin data after fetching
                const binData = bins?.[locationId]?.[binId];

                if (binData) {
                    setCurrentBinData(binData);
                } else {
                    // Only show error if we have bins data but can't find this specific bin
                    if (bins && Object.keys(bins).length > 0) {
                        toast.error('No data found for this bin');
                        navigate('/users/bins'); // Optionally redirect back to bins list
                    }
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error loading bin data:', error);
                    toast.error('Error loading bin data. Please try again.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadData();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [locationId, binId, bins, fetchBins, navigate]);

    const handleSubmit = async (values) => {
        try {
            setIsLoading(true);
            await editBin(locationId, binId, {
                ...currentBinData,
                ...values,
                lastUpdated: new Date().toLocaleString()
            });
            toast.success('Bin updated successfully!');
            navigate('/users/bins');
        } catch (error) {
            console.error('Error updating bin:', error);
            toast.error('Error updating bin. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // If we have no data after loading, show an error state
    if (!currentBinData && !isLoading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <Typography variant="h5" color="blue-gray">
                    Bin Not Found
                </Typography>
                <button
                    onClick={() => navigate('/users/bins')}
                    className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                    Return to Bins List
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-7xl p-4">
            <Card className="w-full">
                <CardHeader color="blue" className="relative h-16">
                    <div className="flex h-full items-center px-4">
                        <Typography variant="h5" color="white">
                            Bin Management System
                        </Typography>
                    </div>
                </CardHeader>
                <CardBody>
                    <Tabs value={activeTab}>
                        <TabsHeader>
                            <Tab value="settings" onClick={() => setActiveTab("settings")}>
                                Settings
                            </Tab>
                            <Tab value="status" onClick={() => setActiveTab("status")}>
                                Status
                            </Tab>
                            <Tab value="location" onClick={() => setActiveTab("location")}>
                                Location
                            </Tab>
                        </TabsHeader>

                        <TabsBody>
                            <TabPanel value="settings">
                                <BinSettingsForm
                                    initialData={currentBinData}
                                    onSubmit={handleSubmit}
                                    isLoading={isLoading}
                                />
                            </TabPanel>
                            <TabPanel value="status">
                                <BinStatus binData={currentBinData} />
                            </TabPanel>
                            <TabPanel value="location">
                                <BinLocation binData={currentBinData} />
                            </TabPanel>
                        </TabsBody>
                    </Tabs>
                </CardBody>
            </Card>
        </div>
    );
};

export default BinSettings;