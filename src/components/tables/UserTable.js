import React, { useState, useEffect } from 'react';
import { API_URL } from '../../api';

function UserTable() {
    const [users, setUsers] = useState([]);
    const [showAddUser, setShowAddUser] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Fetch users from backend
    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(API_URL + '/user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }})
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error('Error fetching users:', error));
    }, []);

    // Update user role
    const updateRole = (userId, newRole) => {
        if (!window.confirm(`Are you sure you want to change the role to ${newRole}?`)) return;
        const token = localStorage.getItem('token');
        fetch(`${API_URL}/user/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ role: newRole }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update role');
                }
                return response.json();
            })
            .then(updatedUser => {
                setUsers(users.map(user => (user._id === updatedUser._id ? updatedUser : user)));
            })
            .catch(error => console.error('Error updating user role:', error));
    };

    // Add new user
    const addUser = (name, email, password) => {
        const token = localStorage.getItem('token');
        fetch(`${API_URL}/user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, email, password }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add user');
                }
                return response.json();
            })
            .then(newUser => {
                setUsers([...users, newUser]);
                setShowAddUser(false);
            })
            .catch(error => console.error('Error adding user:', error));
    };

    // Edit user
    const editUser = (userId, name, email) => {
        const token = localStorage.getItem('token');
        fetch(`${API_URL}/user/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ name, email }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to edit user');
                }
                return response.json();
            })
            .then(updatedUser => {
                setUsers(users.map(user => (user._id === updatedUser._id ? updatedUser : user)));
                setEditingUser(null);
            })
            .catch(error => console.error('Error editing user:', error));
    };

    // Delete user
    const deleteUser = userId => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        const token = localStorage.getItem('token');
        fetch(`${API_URL}/user/${userId}`, {
            method: 'DELETE',
            headers : {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete user');
                }
                setUsers(users.filter(user => user._id !== userId));
            })
            .catch(error => console.error('Error deleting user:', error));
    };

    return (
        <div className="admin-users-panel">
            <h1>Users</h1>
            <button onClick={() => setShowAddUser(true)}>Add User</button>
            {showAddUser && (
                <AddUserForm
                    onClose={() => setShowAddUser(false)}
                    onSubmit={(name, email, password) => addUser(name, email, password)}
                />
            )}
            {editingUser && (
                <EditUserForm
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSubmit={(name, email) => editUser(editingUser._id, name, email)}
                />
            )}
            <table id="admin-users-table" className="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                {user.role === 'user' ? (
                                    <button onClick={() => updateRole(user._id, 'admin')}>
                                        Make Admin
                                    </button>
                                ) : (
                                    <button onClick={() => updateRole(user._id, 'user')}>
                                        Remove Admin
                                    </button>
                                )}
                                <button onClick={() => setEditingUser(user)}>Edit</button>
                                <button onClick={() => deleteUser(user._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// AddUserForm Component
function AddUserForm({ onClose, onSubmit }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = e => {
        e.preventDefault();
        onSubmit(name, email, password);
    };

    return (
        <div className="form-overlay">
            <form onSubmit={handleSubmit}>
                <h2>Add User</h2>
                <label>Name:</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                <label>Email:</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <label>Password:</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit">Add</button>
                <button type="button" onClick={onClose}>
                    Cancel
                </button>
            </form>
        </div>
    );
}

// EditUserForm Component
function EditUserForm({ user, onClose, onSubmit }) {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);

    const handleSubmit = e => {
        e.preventDefault();
        onSubmit(name, email);
    };

    return (
        <div className="form-overlay">
            <form onSubmit={handleSubmit}>
                <h2>Edit User</h2>
                <label>Name:</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                <label>Email:</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <button type="submit">Save</button>
                <button type="button" onClick={onClose}>
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default UserTable;
