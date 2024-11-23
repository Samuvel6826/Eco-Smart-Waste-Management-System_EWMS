// AssignBinsDialog.jsx
import React, { Suspense } from 'react';
import { Dialog, Spinner } from "@material-tailwind/react";
const AssignBinLocations = React.lazy(() => import('./AssignBinLocations'));

export function AssignBinsDialog({ open, onClose, onAssignSuccess }) {
    return (
        <Dialog
            open={open}
            handler={onClose}
            size="xl"
            animate={{
                mount: { scale: 1, opacity: 1 },
                unmount: { scale: 0.9, opacity: 0 },
            }}
        >
            <Suspense
                fallback={
                    <div className="flex h-full w-full items-center justify-center">
                        <Spinner className="flex h-8 w-8 flex-col items-center justify-center" />
                    </div>
                }
            >
                <AssignBinLocations
                    open={open}
                    onClose={onClose}
                    onAssignSuccess={onAssignSuccess}
                />
            </Suspense>
        </Dialog>
    );
}