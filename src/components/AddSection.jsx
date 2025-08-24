import { useState } from 'react';

const AddSection = ({ onAddSection }) => {
  const [sectionType, setSectionType] = useState('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [styles, setStyles] = useState({
    backgroundColor: '#ffffff',
    textColor: '#000000',
    padding: '20px',
    textAlign: 'left'
  });

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSection = {
      id: Date.now(),
      type: sectionType,
      title,
      content: sectionType === 'text' ? content : '', styles,
      ...(sectionType === 'services' && { items: [] }),
      ...(sectionType === 'gallery' && { images: image ? [{ id: 1, url: image }] : [] })
    };
    onAddSection(newSection);
    setTitle('');
    setContent('');
    setImage(null);
  };

  return (
    <div className="add-section">
      <h3>Add New Section</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Section Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div className="styles-control">
            <div className="form-group">
              <label>Background Color:</label>
              <input
                type="color"
                value={styles.backgroundColor}
                onChange={(e) => setStyles({ ...styles, backgroundColor: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Text Color:</label>
              <input
                type="color"
                value={styles.textColor}
                onChange={(e) => setStyles({ ...styles, textColor: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Text Alignment:</label>
              <select
                value={styles.textAlign}
                onChange={(e) => setStyles({ ...styles, textAlign: e.target.value })}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

          </div>
        </div>


        <div className="form-group">
          <label>Section Type:</label>
          <select value={sectionType} onChange={(e) => setSectionType(e.target.value)}>
            <option value="text">Text Section</option>
            <option value="about">About Section</option>
            <option value="services">Services Section</option>
            <option value="gallery">Image Gallery</option>
          </select>
        </div>

        {sectionType === 'text' && (
          <div className="form-group">
            <label>Content:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
        )}

        {sectionType === 'gallery' && (
          <div className="form-group">
            <label>Upload Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {image && (
              <div className="image-preview">
                <img src={image} alt="Preview" width="100" />
                <label>Description:</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        <button type="submit">Add Section</button>
      </form>
    </div>
  );
};

export default AddSection;