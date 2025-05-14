import { useState, useEffect, useRef } from 'react';

const ContentEditor = ({ section, onSave, onCancel, onDelete }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editedItems, setEditedItems] = useState([]);
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (section) {
      setTitle(section.title || '');
      setContent(section.content || '');
      setEditedItems(section.items || []);
      setImages(section.images || []);
      setMainImage(section.image || null);
    }
  }, [section]);

  const handleImageChange = (fieldName, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (fieldName === 'mainImage') {
          setMainImage(event.target.result);
        } else if (fieldName.startsWith('item-')) {
          const itemId = parseInt(fieldName.split('-')[1]);
          setEditedItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, icon: event.target.result } : item
          ));
        } else {
          setNewImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addImage = () => {
    if (newImage) {
      setImages([...images, {
        id: Date.now(),
        url: newImage,
        alt: `Image ${images.length + 1}`
      }]);
      setNewImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (id) => {
    setImages(images.filter(img => img.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setEditedItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addNewItem = () => {
    setEditedItems([...editedItems, {
      id: Date.now(),
      name: '',
      description: '',
      icon: null
    }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedSection = {
      ...section,
      title,
      ...(section.type === 'services' && { items: editedItems }),
      ...(section.type === 'gallery' && { images }),
      ...(['text', 'about'].includes(section.type) && {
        content,
        image: mainImage
      })
    };
    onSave(updatedSection);
  };

  if (!section) return null;

  return (
    <div className="content-editor">
      <h3>Edit {section.type} Section</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Style controls - add this near other form controls */}
          <div className="style-controls">
            <div className="form-group">
              <label>Background Color:</label>
              <input
                type="color"
                value={section.styles?.backgroundColor || '#ffffff'}
                onChange={(e) => onSave({
                  ...section,
                  styles: {
                    ...section.styles,
                    backgroundColor: e.target.value
                  }
                })}
              />
            </div>

            <div className="form-group">
              <label>Text Color:</label>
              <input
                type="color"
                value={section.styles?.textColor || '#000000'}
                onChange={(e) => onSave({
                  ...section,
                  styles: {
                    ...section.styles,
                    textColor: e.target.value
                  }
                })}
              />
            </div>

            <div className="form-group">
              <label>Text Alignment:</label>
              <select
                value={section.styles?.textAlign || 'left'}
                onChange={(e) => onSave({
                  ...section,
                  styles: {
                    ...section.styles,
                    textAlign: e.target.value
                  }
                })}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        </div>

        {['text', 'about'].includes(section.type) && (
          <div className="form-group">
            <label>Content:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
        )}

        {/* Main Image Upload for all sections except gallery */}
        {section.type !== 'gallery' && (
          <div className="form-group">
            <label>Section Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange('mainImage', e)}
            />
            {mainImage && (
              <div className="image-preview">
                <img src={mainImage} alt="Section preview" />
                <button
                  type="button"
                  onClick={() => setMainImage(null)}
                  className="remove-image-btn"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>
        )}

        {section.type === 'services' && (
          <div className="form-group">
            <label>Services:</label>
            {editedItems.map(item => (
              <div key={item.id} className="service-edit">
                <div className="service-image-upload">
                  <label>Icon:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(`item-${item.id}`, e)}
                  />
                  {item.icon && (
                    <div className="icon-preview">
                      <img src={item.icon} alt="Service icon" />
                      <button
                        type="button"
                        onClick={() => handleItemChange(item.id, 'icon', null)}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                  placeholder="Service name"
                  required
                />
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                  placeholder="Service description"
                  required
                />
              </div>
            ))}
            <button type="button" onClick={addNewItem}>Add Service</button>
          </div>
        )}

        {section.type === 'gallery' && (
          <div className="form-group">
            <label>Images:</label>
            <div className="image-gallery-edit">
              {images.map(image => (
                <div key={image.id} className="image-edit">
                  <img src={image.url} alt="Gallery preview" />
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="remove-image-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="image-upload-controls">
              <input
                ref={fileInputRef}
                type="file"
                id="gallery-upload"
                accept="image/*"
                onChange={(e) => handleImageChange('gallery', e)}
                style={{ display: 'none' }}
              />
              <label htmlFor="gallery-upload" className="upload-button">
                + Add Image
              </label>
              {newImage && (
                <div className="image-preview">
                  <img src={newImage} alt="New upload preview" />
                  <div className="preview-actions">
                    <button
                      type="button"
                      onClick={() => setNewImage(null)}
                      className="cancel-upload"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={addImage}
                      className="confirm-upload"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="save-btn">Save Changes</button>
          <button
            type="button"
            className="delete-btn"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this section?')) {
                onDelete(section.id);
              }
            }}
          >
            Delete Section
          </button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ContentEditor;