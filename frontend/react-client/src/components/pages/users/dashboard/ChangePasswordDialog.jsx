import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Typography,
    Spinner
} from "@material-tailwind/react";

export const ChangePasswordDialog = ({
    open,
    onClose,
    changePassword, // Add changePassword function from context as a prop
    userId // Add userId as a prop
}) => {
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handlePasswordChange = async () => {
        const { newPassword, confirmPassword } = passwordData;

        // Log the data when submit is clicked
        console.log('Submitting password change:', {
            employeeId: userId,
            newPassword,
            confirmPassword
        });

        setIsChangingPassword(true);
        try {
            // Call changePassword with employeeId, newPassword, and confirmPassword
            await changePassword(userId, newPassword, confirmPassword);

            // Reset form and close dialog
            setPasswordData({ newPassword: '', confirmPassword: '' });
            onClose();
        } catch (error) {
            // Error handling is done in the context function
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleClose = () => {
        // Reset form when closing
        setPasswordData({ newPassword: '', confirmPassword: '' });
        onClose();
    };

    return (
        <Dialog open={open} handler={handleClose} size="xs">
            <DialogHeader className="justify-between">
                <Typography variant="h5" color="blue-gray">
                    Change Password
                </Typography>
            </DialogHeader>
            <DialogBody divider className="grid gap-4">
                <Input
                    type="password"
                    label="New Password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    containerProps={{ className: "min-w-[72px]" }}
                />
                <Input
                    type="password"
                    label="Confirm New Password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    containerProps={{ className: "min-w-[72px]" }}
                />
            </DialogBody>
            <DialogFooter className="space-x-2">
                <Button variant="text" color="blue-gray" onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    variant="gradient"
                    color="blue"
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword}
                >
                    {isChangingPassword ? <Spinner className="h-4 w-4" /> : "Change Password"}
                </Button>
            </DialogFooter>
        </Dialog>
    );
};