// userProfile/AdditionalInfo.jsx
const AdditionalInfo = ({ values }) => {

    console.table(values);


    return (
        <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Additional Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Created Info */}
                <div className="rounded-md bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-500">Created By</p>
                    <p className="text-sm font-medium text-gray-900">
                        {values?.createdBy || 'N/A'}
                    </p>
                </div>
                <div className="rounded-md bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="text-sm font-medium text-gray-900">
                        {values?.createdAt}
                    </p>
                </div>

                {/* lastLogin */}
                <div className="rounded-md bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-500">Last Login By</p>
                    <p className="text-sm font-medium text-gray-900">
                        {values?.lastLoginBy}
                    </p>
                </div>
                <div className="rounded-md bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-500">Last Login At</p>
                    <p className="text-sm font-medium text-gray-900">
                        {values?.lastLoginAt}
                    </p>
                </div>

                {/* Updated Info */}
                <div className="rounded-md bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-500">Last Updated By</p>
                    <p className="text-sm font-medium text-gray-900">
                        {values?.updatedBy || 'N/A'}
                    </p>
                </div>
                <div className="rounded-md bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-500">Last Updated At</p>
                    <p className="text-sm font-medium text-gray-900">
                        {values?.updatedAt}
                    </p>
                </div>

                {/* lastPasswordChangedAt */}
                <div className="rounded-md bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-500">Last Password Changed By</p>
                    <p className="text-sm font-medium text-gray-900">
                        {values?.lastPasswordChangedBy
                        }
                    </p>
                </div>

                <div className="rounded-md bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-500">Last Password Changed At</p>
                    <p className="text-sm font-medium text-gray-900">
                        {values?.lastPasswordChangedAt
                        }
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AdditionalInfo;