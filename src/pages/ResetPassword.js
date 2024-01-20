import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import * as Realm from 'realm-web'; // Import Realm for MongoDB Realm integration
import { APP_ID } from "../realm/constants"; // Import your Realm App ID

const ResetPassword = () => {
    // useState hooks for managing new password and confirmation password input fields
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // useSearchParams hook to access URL query parameters
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); // Retrieve 'token' from URL query parameters
    const tokenId = searchParams.get('tokenId'); // Retrieve 'tokenId' from URL query parameters

    // useNavigate hook for programmatically navigating to another route
    const navigate = useNavigate();

    // Initialize the Realm App with your App ID
    const app = new Realm.App({ id: APP_ID });

    // Function to handle the reset password process
    const handleResetPassword = async () => {
        // Check if the new password and confirm password fields match
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match. Please try again.');
            return;
        }

        try {
            // Using Realm's emailPasswordAuth API to reset the password
            await app.emailPasswordAuth.resetPassword({
                password: newPassword,
                token: token,
                tokenId: tokenId,
            });
            alert('Your password has been reset successfully!');
            navigate('/login'); // Navigate to login page after successful reset
        } catch (error) {
            console.error('Error resetting password:', error);
            alert('Error resetting password. Please try again.');
        }
    };

    return (
        <div className="card">
            <div className="flex flex-column md:flex-row">
                <div className="w-full md:w-5 flex flex-column align-items-s justify-content-center gap-3 py-5">
                    <h1>Reset Your Password</h1>
                    {/* Input fields for new password and confirm password */}
                    <InputText
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                    />
                    <InputText
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                    />
                    {/* Button to trigger the reset password process */}
                    <Button label="Reset Password" onClick={handleResetPassword} />
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
