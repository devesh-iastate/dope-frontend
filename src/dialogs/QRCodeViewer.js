import React, { useState } from "react";
import QRCode from "qrcode.react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

// QRCodeViewer component for generating and displaying QR codes
export function QRCodeViewer({ rowData }) { // Destructure rowData from props
    const [showQRDialog, setShowQRDialog] = useState(false);

    // Function to show the QR code dialog
    const showQRCode = () => {
        setShowQRDialog(true);
    };

    // Function to hide the QR code dialog
    const hideQRCode = () => {
        setShowQRDialog(false);
    };

    return (
        <div>
            {/* Button to trigger QR code display */}
            <Button icon="pi pi-qrcode" rounded outlined className="ml-2" onClick={showQRCode} />

            {/* Dialog for QR code */}
            <Dialog
                visible={showQRDialog}
                onHide={hideQRCode}
                header="QR Code"
                className="qr-code-modal"
            >
                {rowData && (
                    <div className="qr-code-container">
                        {/* Generate QR code with rowData._id */}
                        <QRCode value={JSON.stringify({ "_id": rowData._id })} size={256} />
                        {/* Display rowData._id as text */}
                        <div style={{ marginTop: '10px', color: 'black' }}>{rowData._id.toHexString()}</div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
