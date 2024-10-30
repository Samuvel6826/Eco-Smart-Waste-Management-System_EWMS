// ChangePasswordDialog.jsx
import React from 'react';
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
    passwordData,
    setPasswordData,
    onSubmit,
    isChangingPassword
}) => (
    <Dialog open={open} handler={onClose} size="xs">
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
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                containerProps={{ className: "min-w-[72px]" }}
            />
            <Input
                type="password"
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                containerProps={{ className: "min-w-[72px]" }}
            />
        </DialogBody>
        <DialogFooter className="space-x-2">
            <Button variant="text" color="blue-gray" onClick={onClose}>
                Cancel
            </Button>
            <Button variant="gradient" color="blue" onClick={onSubmit} disabled={isChangingPassword}>
                {isChangingPassword ? <Spinner className="h-4 w-4" /> : "Change Password"}
            </Button>
        </DialogFooter>
    </Dialog>
);