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

    // Custom input wrapper component to ensure labels are always visible
    const InputWithLabel = ({ label, children }) => (
        <div className="relative">
            <Typography
                variant="small"
                className="mb-2 block font-medium text-blue-gray-600"
            >
                {label}
            </Typography>
            {children}
        </div>
    );

    return (
        <div className="space-y-6">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <InputWithLabel label="Bin ID">
                        <Input
                            type="text"
                            name="id"
                            value={formik.values.id}
                            onChange={formik.handleChange}
                            error={formik.touched.id && Boolean(formik.errors.id)}
                            disabled={!isEditing}
                            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "hidden"
                            }}
                        />
                    </InputWithLabel>

                    <InputWithLabel label="Bin Location">
                        <Input
                            type="text"
                            name="binLocation"
                            value={formik.values.binLocation}
                            onChange={formik.handleChange}
                            error={formik.touched.binLocation && Boolean(formik.errors.binLocation)}
                            disabled={!isEditing}
                            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "hidden"
                            }}
                        />
                    </InputWithLabel>

                    <InputWithLabel label="Bin Type">
                        <Select
                            value={formik.values.binType}
                            onChange={(value) => formik.setFieldValue('binType', value)}
                            error={formik.touched.binType && Boolean(formik.errors.binType)}
                            disabled={!isEditing}
                            labelProps={{
                                className: "hidden"
                            }}
                        >
                            {binTypes.map((type) => (
                                <Option key={type} value={type}>{type}</Option>
                            ))}
                        </Select>
                    </InputWithLabel>

                    {/* Continue the same pattern for other fields */}
                    <InputWithLabel label="Maximum Capacity (L)">
                        <Input
                            type="number"
                            name="maxBinCapacity"
                            value={formik.values.maxBinCapacity}
                            onChange={formik.handleChange}
                            error={formik.touched.maxBinCapacity && Boolean(formik.errors.maxBinCapacity)}
                            disabled={!isEditing}
                            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "hidden"
                            }}
                        />
                    </InputWithLabel>

                    <InputWithLabel label="Distance (m)">
                        <Input
                            type="number"
                            name="distance"
                            value={formik.values.distance}
                            onChange={formik.handleChange}
                            error={formik.touched.distance && Boolean(formik.errors.distance)}
                            disabled={!isEditing}
                            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "hidden"
                            }}
                        />
                    </InputWithLabel>

                    <InputWithLabel label="Microprocessor Status">
                        <Select
                            value={formik.values.microProcessorStatus}
                            onChange={(value) => formik.setFieldValue('microProcessorStatus', value)}
                            disabled={!isEditing}
                            labelProps={{
                                className: "hidden"
                            }}
                        >
                            {statusOptions.map((status) => (
                                <Option key={status} value={status}>{status}</Option>
                            ))}
                        </Select>
                    </InputWithLabel>

                    <InputWithLabel label="Sensor Status">
                        <Select
                            value={formik.values.sensorStatus}
                            onChange={(value) => formik.setFieldValue('sensorStatus', value)}
                            disabled={!isEditing}
                            labelProps={{
                                className: "hidden"
                            }}
                        >
                            {statusOptions.map((status) => (
                                <Option key={status} value={status}>{status}</Option>
                            ))}
                        </Select>
                    </InputWithLabel>

                    <InputWithLabel label="Lid Status">
                        <Select
                            value={formik.values.binLidStatus}
                            onChange={(value) => formik.setFieldValue('binLidStatus', value)}
                            disabled={!isEditing}
                            labelProps={{
                                className: "hidden"
                            }}
                        >
                            {lidStatuses.map((status) => (
                                <Option key={status} value={status}>{status}</Option>
                            ))}
                        </Select>
                    </InputWithLabel>

                    <InputWithLabel label="Active Status">
                        <Select
                            value={formik.values.binActiveStatus}
                            onChange={(value) => formik.setFieldValue('binActiveStatus', value)}
                            disabled={!isEditing}
                            labelProps={{
                                className: "hidden"
                            }}
                        >
                            {activeStatuses.map((status) => (
                                <Option key={status} value={status}>{status}</Option>
                            ))}
                        </Select>
                    </InputWithLabel>

                    <InputWithLabel label="Latitude">
                        <Input
                            type="text"
                            name="geoLocation.latitude"
                            value={formik.values.geoLocation.latitude}
                            onChange={formik.handleChange}
                            disabled={!isEditing}
                            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "hidden"
                            }}
                        />
                    </InputWithLabel>

                    <InputWithLabel label="Longitude">
                        <Input
                            type="text"
                            name="geoLocation.longitude"
                            value={formik.values.geoLocation.longitude}
                            onChange={formik.handleChange}
                            disabled={!isEditing}
                            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "hidden"
                            }}
                        />
                    </InputWithLabel>

                    <InputWithLabel label="Temperature">
                        <Input
                            type="text"
                            name="temperature"
                            value={formik.values.temperature}
                            onChange={formik.handleChange}
                            disabled={!isEditing}
                            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "hidden"
                            }}
                        />
                    </InputWithLabel>

                    <InputWithLabel label="Humidity">
                        <Input
                            type="text"
                            name="humidity"
                            value={formik.values.humidity}
                            onChange={formik.handleChange}
                            disabled={!isEditing}
                            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "hidden"
                            }}
                        />
                    </InputWithLabel>

                    <InputWithLabel label="Battery Level">
                        <Input
                            type="text"
                            name="batteryLevel"
                            value={formik.values.batteryLevel}
                            onChange={formik.handleChange}
                            disabled={!isEditing}
                            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "hidden"
                            }}
                        />
                    </InputWithLabel>

                    <InputWithLabel label="Last Maintenance">
                        <Input
                            type="text"
                            name="lastMaintenance"
                            value={formik.values.lastMaintenance}
                            onChange={formik.handleChange}
                            disabled={!isEditing}
                            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "hidden"
                            }}
                        />
                    </InputWithLabel>

                    <InputWithLabel label="Last Emptied">
                        <Input
                            type="text"
                            name="lastEmptied"
                            value={formik.values.lastEmptied}
                            onChange={formik.handleChange}
                            disabled={!isEditing}
                            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "hidden"
                            }}
                        />
                    </InputWithLabel>

                    <InputWithLabel label="Filled Percentage">
                        <Input
                            type="number"
                            name="filledBinPercentage"
                            value={formik.values.filledBinPercentage}
                            onChange={formik.handleChange}
                            disabled={!isEditing}
                            error={formik.touched.filledBinPercentage && Boolean(formik.errors.filledBinPercentage)}
                            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                            labelProps={{
                                className: "hidden"
                            }}
                        />
                    </InputWithLabel>
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