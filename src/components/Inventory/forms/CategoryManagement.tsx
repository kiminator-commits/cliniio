// TODO: Move to forms/ - Category management component
import React, { useState } from 'react';
import { useInventoryStore } from '../../../store/useInventoryStore';

const CategoryManagement: React.FC = () => {
  const categories = useInventoryStore(state => state.categories);
  const addCategory = useInventoryStore(state => state.addCategory);
  const removeCategory = useInventoryStore(state => state.removeCategory);
  const isCategoriesLoading = useInventoryStore(state => state.isCategoriesLoading);
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  if (isCategoriesLoading) {
    return <div className="p-4 text-center">Loading categories...</div>;
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
          onChange={e => setNewCategory(e.target.value)}
          aria-label="New Category Name"
        />
        <button className="btn btn-primary ms-2" onClick={handleAdd} aria-label="Add Category">
          Add
        </button>
      </div>
      <ul className="list-group">
        {categories.map(category => (
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
