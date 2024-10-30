// DeleteConfirmationDialog.jsx
import React from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography
} from "@material-tailwind/react";

export const DeleteConfirmationDialog = ({ open, onClose, onConfirm }) => (
    <Dialog open={open} handler={onClose} size="xs">
        <DialogHeader>
            <Typography variant="h5" color="blue-gray">
                Confirm Deletion
            </Typography>
        </DialogHeader>
        <DialogBody divider>
            <Typography color="red" className="font-normal">
                Are you sure you want to delete this user? This action cannot be undone.
            </Typography>
        </DialogBody>
        <DialogFooter className="space-x-2">
            <Button variant="text" color="blue-gray" onClick={onClose}>
                Cancel
            </Button>
            <Button variant="filled" color="red" onClick={onConfirm}>
                Delete User
            </Button>
        </DialogFooter>
    </Dialog>
);