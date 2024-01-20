import React, { useContext, useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import * as Realm from 'realm-web';
import { APP_ID } from "../realm/constants";
import { UserContext } from "../contexts/user.context";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
    const { user } = useContext(UserContext); // Using context to get the logged-in user
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const app = new Realm.App({ id: APP_ID }); // Initialize Realm app

    useEffect(() => {
        // Redirect if not admin
        if (!user || user._profile.data.email !== process.env.REACT_APP_ADMIN_ACCOUNT) {
            window.alert('Access restricted to admin accounts.');
            navigate('/');
        }
    }, [user, navigate]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prevState => ({ ...prevState, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async () => {
        try {
            await app.emailPasswordAuth.registerUser({ email: credentials.email, password: credentials.password });
            alert('User registered successfully!');
            // Additional actions after successful registration
        } catch (error) {
            console.error('Error registering user:', error);
            alert('Error registering user. Please try again.');
        }
    };

    return (
        <div className="card">
            <h1>Admin Registration</h1>
            <div className="p-float-label">
                <InputText
                    id="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                />
                <label htmlFor="email">Email</label>
            </div>
            <div className="p-float-label">
                <InputText
                    id="password"
                    name="password"
                    type="password"
                    value={credentials.password}
                    onChange={handleChange}
                />
                <label htmlFor="password">Password</label>
            </div>
            <Button label="Register" onClick={handleSubmit} />
        </div>
    );
};

export default AdminPage;
