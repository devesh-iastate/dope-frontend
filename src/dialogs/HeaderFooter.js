import React from 'react';
import {useState, useEffect} from 'react';

// Header component
export const Header = () => {
    return (
        <header style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'}}>
            <h1 className='head'>DOPE Portal</h1>
        </header>
    );
};

// Footer component - Testing Sync
export const Footer = () => {

    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
    // Update the year when the component mounts
    setYear(new Date().getFullYear());
        }, []);

    return (
        <div className="button-container">
            <p>{` © Iowa State University ${year} `}</p>
        </div>
    );
};