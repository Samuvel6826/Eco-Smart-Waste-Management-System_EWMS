const ActionButtons = ({ isEditing, setIsEditing, isSubmitting, navigate }) => {
    return (
        <div className="flex justify-center space-x-4">
            {isEditing ? (
                <>
                    <button
                        type="submit" // Keep as submit button to save changes
                        className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="rounded bg-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-400"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                </>
            ) : (
                <>
                    <button
                        type="button" // Make sure it's "button" to avoid form submission
                        onClick={(event) => {
                            event.preventDefault();
                            setIsEditing(true);
                        }}
                        className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
                    >
                        Edit Profile
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="rounded bg-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-400"
                    >
                        Back to Dashboard
                    </button>
                </>
            )}
        </div>
    );
};

export default ActionButtons;