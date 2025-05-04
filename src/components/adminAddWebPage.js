import React, { useState } from 'react';

function AdminWebPage() {
    const [pageTitle, setPageTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('WebPage content updated successfully!');
        setPageTitle('');
        setContent('');
    };

    return (
        <div id="admin-webpage" className="admin-card">
            <div className="admin-title">Edit WebPage</div>
            <form className="admin-form" onSubmit={handleSubmit}>
                <label htmlFor="admin-pageTitleNew">Page Title:</label>
                <input
                    type="text"
                    id="admin-pageTitleNew"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    required
                />

                <label htmlFor="admin-pageContentNew">Content:</label>
                <textarea
                    id="admin-pageContentNew"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                ></textarea>

                <button type="submit">Update WebPage</button>
            </form>
        </div>
    );
}

export default AdminWebPage;
