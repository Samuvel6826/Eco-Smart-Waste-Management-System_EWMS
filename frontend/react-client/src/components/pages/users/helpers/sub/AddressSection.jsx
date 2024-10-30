// AddressSection.jsx
import React, { useEffect, useState } from 'react';
import { Country, State, City } from 'country-state-city';
import CustomSelect from './CustomSelect';

const AddressSection = ({
    isEditing = true,
    values = {},
    setFieldValue,
    touched = {},
    errors = {}
}) => {
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedState, setSelectedState] = useState(null);

    // Safe access to address values with fallbacks
    const address = values.address || {};
    const addressTouched = touched.address || {};
    const addressErrors = errors.address || {};

    // Initialize countries and set initial selections
    useEffect(() => {
        const allCountries = Country.getAllCountries().map(country => ({
            isoCode: country.isoCode,
            name: country.name
        }));
        setCountries(allCountries);

        // If we have initial country value, find and set it
        if (address.country) {
            const country = allCountries.find(
                c => c.name === address.country
            );
            if (country) {
                setSelectedCountry(country);
                const countryStates = State.getStatesOfCountry(country.isoCode).map(state => ({
                    isoCode: state.isoCode,
                    name: state.name
                }));
                setStates(countryStates);

                if (address.state) {
                    const state = countryStates.find(
                        s => s.name === address.state
                    );
                    if (state) {
                        setSelectedState(state);
                        const stateCities = City.getCitiesOfState(
                            country.isoCode,
                            state.isoCode
                        ).map(city => ({
                            isoCode: city.name,
                            name: city.name
                        }));
                        setCities(stateCities);
                    }
                }
            }
        }
    }, [address.country, address.state]);

    // Handle country change
    const handleCountryChange = (event) => {
        const countryCode = event.target.value;
        const country = countries.find(c => c.isoCode === countryCode);

        if (country) {
            setSelectedCountry(country);
            setSelectedState(null);
            setFieldValue('address.country', country.name);
            setFieldValue('address.state', '');
            setFieldValue('address.city', '');

            const countryStates = State.getStatesOfCountry(country.isoCode).map(state => ({
                isoCode: state.isoCode,
                name: state.name
            }));
            setStates(countryStates);
            setCities([]);
        }
    };

    // Handle state change
    const handleStateChange = (event) => {
        const stateCode = event.target.value;
        const state = states.find(s => s.isoCode === stateCode);

        if (state && selectedCountry) {
            setSelectedState(state);
            setFieldValue('address.state', state.name);
            setFieldValue('address.city', '');

            const stateCities = City.getCitiesOfState(
                selectedCountry.isoCode,
                state.isoCode
            ).map(city => ({
                isoCode: city.name, // Use city name as isoCode
                name: city.name
            }));
            setCities(stateCities);
        }
    };

    return (
        <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-xl font-semibold text-gray-900">
                Address Information
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <CustomSelect
                        label="Country"
                        options={countries}
                        value={selectedCountry?.isoCode || ''}
                        onChange={handleCountryChange}
                        disabled={!isEditing}
                        error={addressErrors?.country}
                        touched={addressTouched?.country}
                        name="address.country"
                    />

                    <CustomSelect
                        label="State"
                        options={states}
                        value={selectedState?.isoCode || ''}
                        onChange={handleStateChange}
                        disabled={!isEditing || !selectedCountry}
                        error={errors?.address?.state}
                        touched={touched?.address?.state}
                        name="address.state"
                        helperText={!selectedCountry ? "Please select a country first" : ""}
                    />

                    <CustomSelect
                        label="City"
                        options={cities}
                        value={values.address.city}
                        onChange={(e) => setFieldValue('address.city', e.target.value)}
                        disabled={!isEditing || !selectedState}
                        error={errors?.address?.city}
                        touched={touched?.address?.city}
                        name="address.city"
                        helperText={!selectedState ? "Please select a state first" : ""}
                    />
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            District <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="address.district"
                            value={address.district || ''}
                            onChange={(e) => setFieldValue('address.district', e.target.value)}
                            disabled={!isEditing}
                            className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500
                            ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                            ${addressErrors?.district && addressTouched?.district ? 'border-red-500' : 'border-gray-300'}`
                            }
                        />
                        {errors?.address?.district && touched?.address?.district && (
                            <p className="mt-1 text-sm text-red-500">{errors.address.district}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Street Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="address.streetAddress"
                            value={values.address.streetAddress}
                            onChange={(e) => setFieldValue('address.streetAddress', e.target.value)}
                            disabled={!isEditing}
                            rows={3}
                            className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 resize-none
                                ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                                ${errors?.address?.streetAddress && touched?.address?.streetAddress ? 'border-red-500' : 'border-gray-300'}`
                            }
                        />
                        {errors?.address?.streetAddress && touched?.address?.streetAddress && (
                            <p className="mt-1 text-sm text-red-500">{errors.address.streetAddress}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Pin Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="address.pinCode"
                            value={values.address.pinCode}
                            onChange={(e) => setFieldValue('address.pinCode', e.target.value)}
                            disabled={!isEditing}
                            maxLength={6}
                            placeholder="Enter 6 digit pin code"
                            className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500
                                ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                                ${errors?.address?.pinCode && touched?.address?.pinCode ? 'border-red-500' : 'border-gray-300'}`
                            }
                        />
                        {errors?.address?.pinCode && touched?.address?.pinCode && (
                            <p className="mt-1 text-sm text-red-500">{errors.address.pinCode}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddressSection;