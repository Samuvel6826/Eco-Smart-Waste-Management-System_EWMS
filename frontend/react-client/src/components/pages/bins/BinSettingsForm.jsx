// BinSettingsForm.jsx
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Input, Select, Option, Button } from "@material-tailwind/react";

const validationSchema = Yup.object().shape({
    binId: Yup.string().required('Bin ID is required'),
    binLocation: Yup.string().required('Bin Location is required'),
    binType: Yup.string().required('Bin Type is required'),
    maxBinCapacity: Yup.number().required('Maximum capacity is required'),
    distance: Yup.number().required('Distance is required'),
    binLidStatus: Yup.string().required('Lid status is required'),
    binActiveStatus: Yup.string().required('Active status is required')
});

export const BinSettingsForm = ({ initialData, onSubmit, isLoading }) => {
    const formik = useFormik({
        initialValues: {
            binId: initialData?.id || '',
            binLocation: initialData?.binLocation || '',
            binType: initialData?.binType || '',
            maxBinCapacity: initialData?.maxBinCapacity || 100,
            distance: initialData?.distance || 0,
            binLidStatus: initialData?.binLidStatus || 'CLOSED',
            binActiveStatus: initialData?.binActiveStatus || 'Active'
        },
        validationSchema,
        onSubmit
    });

    const binTypes = ['Plastic', 'Paper', 'Glass', 'Metal', 'Organic', 'E-waste'];
    const lidStatuses = ['OPEN', 'CLOSED'];
    const activeStatuses = ['Active', 'Inactive'];

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input
                    type="text"
                    label="Bin ID"
                    name="binId"
                    value={formik.values.binId}
                    onChange={formik.handleChange}
                    error={formik.touched.binId && formik.errors.binId}
                />

                <Input
                    type="text"
                    label="Bin Location"
                    name="binLocation"
                    value={formik.values.binLocation}
                    onChange={formik.handleChange}
                    error={formik.touched.binLocation && formik.errors.binLocation}
                />

                <Select
                    label="Bin Type"
                    value={formik.values.binType}
                    onChange={(value) => formik.setFieldValue('binType', value)}
                    error={formik.touched.binType && formik.errors.binType}
                >
                    {binTypes.map((type) => (
                        <Option key={type} value={type}>{type}</Option>
                    ))}
                </Select>

                <Input
                    type="number"
                    label="Maximum Capacity (L)"
                    name="maxBinCapacity"
                    value={formik.values.maxBinCapacity}
                    onChange={formik.handleChange}
                    error={formik.touched.maxBinCapacity && formik.errors.maxBinCapacity}
                />

                <Input
                    type="number"
                    label="Distance (m)"
                    name="distance"
                    value={formik.values.distance}
                    onChange={formik.handleChange}
                    error={formik.touched.distance && formik.errors.distance}
                />

                <Select
                    label="Lid Status"
                    value={formik.values.binLidStatus}
                    onChange={(value) => formik.setFieldValue('binLidStatus', value)}
                    error={formik.touched.binLidStatus && formik.errors.binLidStatus}
                >
                    {lidStatuses.map((status) => (
                        <Option key={status} value={status}>{status}</Option>
                    ))}
                </Select>

                <Select
                    label="Active Status"
                    value={formik.values.binActiveStatus}
                    onChange={(value) => formik.setFieldValue('binActiveStatus', value)}
                    error={formik.touched.binActiveStatus && formik.errors.binActiveStatus}
                >
                    {activeStatuses.map((status) => (
                        <Option key={status} value={status}>{status}</Option>
                    ))}
                </Select>
            </div>

            <Button
                type="submit"
                disabled={isLoading || !formik.isValid}
                className="mt-6"
                fullWidth
            >
                {isLoading ? "Updating..." : "Update Bin"}
            </Button>
        </form>
    );
};
