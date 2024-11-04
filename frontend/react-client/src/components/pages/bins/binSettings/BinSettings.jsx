import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useBinsContext } from '../../../contexts/BinsContext';
import { Card, CardHeader, CardBody, Typography, Tabs, TabsHeader, TabsBody, Tab, TabPanel, Button } from "@material-tailwind/react";
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
                if (!bins || Object.keys(bins).length === 0) {
                    await fetchBins();
                }
                if (!isMounted) return;
                const binData = bins?.[locationId]?.[binId];
                if (binData) {
                    setCurrentBinData(binData);
                } else {
                    if (bins && Object.keys(bins).length > 0) {
                        toast.error('No data found for this bin');
                        navigate('/users/bins');
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
            setIsEditing(false);
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

    if (!currentBinData && !isLoading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <Typography variant="h5" color="blue-gray">
                    Bin Not Found
                </Typography>
                <Button
                    onClick={() => navigate('/users/bins')}
                    variant="filled"
                    color="blue"
                >
                    Return to Bins List
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-7xl p-4">
            <Card className="w-full">

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