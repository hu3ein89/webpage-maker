import { useState } from 'react';
import Resizer from 'react-image-file-resizer';

const BannerEditor = ({ banner, onSave, onCancel }) => {
  const [title, setTitle] = useState(banner.title);
  const [subtitle, setSubtitle] = useState(banner.subtitle);
  const [ctaText, setCtaText] = useState(banner.ctaText);
  const [ctaLink, setCtaLink] = useState(banner.ctaLink);
  const [backgroundImage, setBackgroundImage] = useState(banner.backgroundImage);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Resizer.imageFileResizer(
        file,
        1200,
        800,
        'WEBP',
        70,
        0,
        (uri) => {
          setBackgroundImage(uri);
        },
        'base64'
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      subtitle,
      ctaText,
      ctaLink,
      backgroundImage
    });
  };

  return (
    <div className="editor-modal">
      <div className="editor-content">
        <h2>Edit Banner</h2>
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
            <label>CTA Text:</label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>CTA Link:</label>
            <input
              type="url"
              value={ctaLink}
              onChange={(e) => setCtaLink(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Background Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {backgroundImage && (
              <div className="image-preview">
                <img 
                  src={backgroundImage} 
                  alt="Banner preview" 
                />
                <button 
                  type="button" 
                  onClick={() => setBackgroundImage(null)}
                  className="remove-image-btn"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button type="submit">Save Banner</button>
            <button type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerEditor;