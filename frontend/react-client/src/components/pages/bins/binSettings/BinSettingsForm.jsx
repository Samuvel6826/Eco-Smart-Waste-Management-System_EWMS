import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Input,
    Select,
    Option,
    Button,
    Typography
} from "@material-tailwind/react";

const validationSchema = Yup.object().shape({
    id: Yup.string().required('Bin ID is required'),
    binLocation: Yup.string().required('Bin Location is required'),
    binType: Yup.string().required('Bin Type is required'),
    geoLocation: Yup.object().shape({
        latitude: Yup.string(),
        longitude: Yup.string()
    }),
    microProcessorStatus: Yup.string().oneOf(['ON', 'OFF']),
    sensorStatus: Yup.string().oneOf(['ON', 'OFF']),
    binLidStatus: Yup.string().oneOf(['OPEN', 'CLOSED']).required('Lid status is required'),
    binActiveStatus: Yup.string().oneOf(['Active', 'inActive']).required('Active status is required'),
    distance: Yup.number().min(0).required('Distance is required'),
    filledBinPercentage: Yup.number().min(0).max(100),
    maxBinCapacity: Yup.number().min(0).required('Maximum capacity is required'),
    lastMaintenance: Yup.string(),
    lastEmptied: Yup.string(),
    temperature: Yup.string(),
    humidity: Yup.string(),
    batteryLevel: Yup.string()
});

export const BinSettingsForm = ({ initialData, onSubmit, isLoading }) => {
    const [isEditing, setIsEditing] = useState(false);

    const formik = useFormik({
        initialValues: {
            id: initialData?.id || '',
            binLocation: initialData?.binLocation || '',
            binType: initialData?.binType || '',
            geoLocation: {
                latitude: initialData?.geoLocation?.latitude || '',
                longitude: initialData?.geoLocation?.longitude || ''
            },
            microProcessorStatus: initialData?.microProcessorStatus || 'OFF',
            sensorStatus: initialData?.sensorStatus || 'OFF',
            binLidStatus: initialData?.binLidStatus || 'CLOSED',
            binActiveStatus: initialData?.binActiveStatus || 'inActive',
            distance: initialData?.distance || 0,
            filledBinPercentage: initialData?.filledBinPercentage || 0,
            maxBinCapacity: initialData?.maxBinCapacity || 0,
            lastMaintenance: initialData?.lastMaintenance || '',
            lastEmptied: initialData?.lastEmptied || '',
            temperature: initialData?.temperature || '0',
            humidity: initialData?.humidity || '0',
            batteryLevel: initialData?.batteryLevel || '0'
        },
        validationSchema,
        onSubmit: (values) => {
            onSubmit(values);
            setIsEditing(false);
        }
    });

    const binTypes = ['Plastic', 'Paper', 'Glass', 'Metal', 'Organic', 'E-waste'];
    const statusOptions = ['ON', 'OFF'];
    const lidStatuses = ['OPEN', 'CLOSED'];
    const activeStatuses = ['Active', 'inActive'];

    const handleEditClick = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            formik.setValues(initialData || formik.initialValues);
        }
    };

    return (
        <div className="space-y-6">

            <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <Input
                            type="text"
                            label="Bin ID"
                            name="id"
                            value={formik.values.id}
                            onChange={formik.handleChange}
                            error={formik.touched.id && Boolean(formik.errors.id)}
                            disabled={!isEditing}
                        />
                        {formik.touched.id && formik.errors.id && (
                            <Typography color="red" className="mt-1 text-sm">
                                {formik.errors.id}
                            </Typography>
                        )}
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Bin Location"
                            name="binLocation"
                            value={formik.values.binLocation}
                            onChange={formik.handleChange}
                            error={formik.touched.binLocation && Boolean(formik.errors.binLocation)}
                            disabled={!isEditing}
                        />
                        {formik.touched.binLocation && formik.errors.binLocation && (
                            <Typography color="red" className="mt-1 text-sm">
                                {formik.errors.binLocation}
                            </Typography>
                        )}
                    </div>

                    <div>
                        <Select
                            label="Bin Type"
                            value={formik.values.binType}
                            onChange={(value) => formik.setFieldValue('binType', value)}
                            error={formik.touched.binType && Boolean(formik.errors.binType)}
                            disabled={!isEditing}
                        >
                            {binTypes.map((type) => (
                                <Option key={type} value={type}>{type}</Option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <Input
                            type="number"
                            label="Maximum Capacity (L)"
                            name="maxBinCapacity"
                            value={formik.values.maxBinCapacity}
                            onChange={formik.handleChange}
                            error={formik.touched.maxBinCapacity && Boolean(formik.errors.maxBinCapacity)}
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <Input
                            type="number"
                            label="Distance (m)"
                            name="distance"
                            value={formik.values.distance}
                            onChange={formik.handleChange}
                            error={formik.touched.distance && Boolean(formik.errors.distance)}
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <Select
                            label="Microprocessor Status"
                            value={formik.values.microProcessorStatus}
                            onChange={(value) => formik.setFieldValue('microProcessorStatus', value)}
                            disabled={!isEditing}
                        >
                            {statusOptions.map((status) => (
                                <Option key={status} value={status}>{status}</Option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <Select
                            label="Sensor Status"
                            value={formik.values.sensorStatus}
                            onChange={(value) => formik.setFieldValue('sensorStatus', value)}
                            disabled={!isEditing}
                        >
                            {statusOptions.map((status) => (
                                <Option key={status} value={status}>{status}</Option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <Select
                            label="Lid Status"
                            value={formik.values.binLidStatus}
                            onChange={(value) => formik.setFieldValue('binLidStatus', value)}
                            disabled={!isEditing}
                        >
                            {lidStatuses.map((status) => (
                                <Option key={status} value={status}>{status}</Option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <Select
                            label="Active Status"
                            value={formik.values.binActiveStatus}
                            onChange={(value) => formik.setFieldValue('binActiveStatus', value)}
                            disabled={!isEditing}
                        >
                            {activeStatuses.map((status) => (
                                <Option key={status} value={status}>{status}</Option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Latitude"
                            name="geoLocation.latitude"
                            value={formik.values.geoLocation.latitude}
                            onChange={formik.handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Longitude"
                            name="geoLocation.longitude"
                            value={formik.values.geoLocation.longitude}
                            onChange={formik.handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Temperature"
                            name="temperature"
                            value={formik.values.temperature}
                            onChange={formik.handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Humidity"
                            name="humidity"
                            value={formik.values.humidity}
                            onChange={formik.handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Battery Level"
                            name="batteryLevel"
                            value={formik.values.batteryLevel}
                            onChange={formik.handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Last Maintenance"
                            name="lastMaintenance"
                            value={formik.values.lastMaintenance}
                            onChange={formik.handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label="Last Emptied"
                            name="lastEmptied"
                            value={formik.values.lastEmptied}
                            onChange={formik.handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <Input
                            type="number"
                            label="Filled Percentage"
                            name="filledBinPercentage"
                            value={formik.values.filledBinPercentage}
                            onChange={formik.handleChange}
                            disabled={!isEditing}
                            error={formik.touched.filledBinPercentage && Boolean(formik.errors.filledBinPercentage)}
                        />
                    </div>
                </div>

                {isEditing && (
                    <Button
                        type="submit"
                        disabled={isLoading || !formik.isValid}
                        className="mt-6"
                        fullWidth
                    >
                        {isLoading ? "Updating..." : "Update Bin"}
                    </Button>
                )}


                <Button
                    onClick={handleEditClick}
                    variant="outlined"
                    className="mt-6"
                    fullWidth
                >
                    {isEditing ? "Cancel" : "Edit"}
                </Button>

            </form>
        </div>
    );
};

export default BinSettingsForm;