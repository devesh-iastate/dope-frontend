import React, { useState } from "react";
import QrScanner from 'react-qr-scanner';
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

export function QRScanner({ setGlobalFilter }) {
    const [showQRScanDialog, setShowQRScanDialog] = useState(false);
    const [scanResult, setScanResult] = useState('');

    // Function to show the QR scan dialog
    const showScanWindow = () => {
        setShowQRScanDialog(true);
    };

    // Function to hide the QR scan dialog
    const hideScanWindow = () => {
        setShowQRScanDialog(false);
    };

    // Error handler for QR scanner
    const handleError = (error) => {
        console.error('QR Scan Error:', error);
    };

    // Handler for successful QR scan
    const handleScan = data => {
        if (data) {
            const jsonObject = JSON.parse(data.text);
            // Assuming jsonObject._id is the intended data for global filter
            setGlobalFilter(jsonObject._id);
            setShowQRScanDialog(false);
        }
    };

    return (
        <div>
            <Button label="Scan" icon="pi pi-qrcode" className="p-button-help" onClick={showScanWindow} />
            <Dialog visible={showQRScanDialog} onHide={hideScanWindow} header="Scan QR Code" className="qr-code-modal">
                <QrScanner
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    style={{ width: '100%' }}
                    constraints={{ audio: false, video: { facingMode: "environment" }}}
                />
                {/* Display scan result */}
                <p>{scanResult}</p>
            </Dialog>
        </div>
    );
}
