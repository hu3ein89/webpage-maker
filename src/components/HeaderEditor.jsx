import { useState } from 'react';

const HeaderEditor = ({ content, onUpdate, onClose }) => {
  const [title, setTitle] = useState(content.title);
  const [subtitle, setSubtitle] = useState(content.subtitle);
  const [image, setImage] = useState(content.backgroundImage);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      title,
      subtitle,
      backgroundImage: image
    });
    onClose();
  };

  return (
    <div className="editor-modal">
      <div className="editor-content">
        <h2>Edit Header</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Subtitle:</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Background Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {image && (
              <div className="image-preview">
                <img src={image} alt="Header background preview" />
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeaderEditor;