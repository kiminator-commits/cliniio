// Category management component
import React, { useState } from 'react';
import { useInventoryStore } from '../../../store/useInventoryStore';

const CategoryManagement: React.FC = () => {
  const { categories, addCategory, removeCategory, isCategoriesLoading } =
    useInventoryStore();
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  if (isCategoriesLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-3">
      <h5>Manage Categories</h5>
      <div className="d-flex mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="New category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          aria-label="New Category Name"
        />
        <button
          className="btn btn-primary ms-2"
          onClick={handleAdd}
          aria-label="Add Category"
        >
          Add
        </button>
      </div>
      <ul className="list-group">
        {categories.map((category) => (
          <li
            key={category}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            {category}
            <button
              className="btn btn-sm btn-danger"
              onClick={() => removeCategory(category)}
              aria-label={`Remove ${category}`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryManagement;
