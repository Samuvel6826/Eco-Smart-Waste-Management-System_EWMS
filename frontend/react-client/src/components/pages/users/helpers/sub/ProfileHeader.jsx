// components/UserProfile/ProfileHeader.js
import { getAvatarUrl } from '../utils/userUtils';

const ProfileHeader = ({ values, isEditing }) => {
    // Add null check with default values
    if (!values) {
        return (
            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 h-40 w-40 rounded-full border-4 border-blue-500 bg-gray-200"></div>
                <h2 className="text-3xl font-bold">Loading...</h2>
            </div>
        );
    }

    const { firstName = '', lastName = '', gender = '', profilePic, previewUrl } = values;
    const displayName = `${firstName} ${lastName}`.trim() || 'User';

    return (
        <div className="mb-6 text-center">
            <img
                src={previewUrl || profilePic || getAvatarUrl(gender, firstName, lastName)}
                alt={`${displayName}'s Profile`}
                className="mx-auto mb-4 h-40 w-40 rounded-full border-4 border-blue-500 object-cover"
            />
            <h2 className="text-3xl font-bold">
                {isEditing ? 'Edit Profile' : displayName}
            </h2>
        </div>
    );
};

export default ProfileHeader;