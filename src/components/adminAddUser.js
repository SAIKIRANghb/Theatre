import React, { useState } from 'react';

function AdminUsers() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('User added successfully!');
        setName('');
        setEmail('');
        setPassword('');
    };

    return (
        <div id="admin-users" className="admin-card">
            <div className="admin-title">Add User</div>
            <form className="admin-form" onSubmit={handleSubmit}>
                <label htmlFor="admin-userNameNew">Name:</label>
                <input
                    type="text"
                    id="admin-userNameNew"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <label htmlFor="admin-userEmailNew">Email:</label>
                <input
                    type="email"
                    id="admin-userEmailNew"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label htmlFor="admin-userPasswordNew">Password:</label>
                <input
                    type="password"
                    id="admin-userPasswordNew"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Add User</button>
            </form>
        </div>
    );
}

export default AdminUsers;
