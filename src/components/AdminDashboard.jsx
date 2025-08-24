import { useState } from 'react';
import AddSection from './AddSection';
import ContentEditor from './ContentEditor';
import DraggableSection from './DraggableSection';
import { useUndo } from '../hooks/useUndo';
import Home from './Home';

const AdminDashboard = ({ content, updateContent, removeSection }) => {
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Undo/Redo functionality
  const [contentState, setContentState, { undo, redo, canUndo, canRedo }] = useUndo(content);

  // Handle moving sections - now properly integrated with undo/redo
  const moveSection = (dragIndex, hoverIndex) => {
    const sections = [...contentState.present.sections];
    const [movedSection] = sections.splice(dragIndex, 1);
    sections.splice(hoverIndex, 0, movedSection);

    const updatedContent = {
      ...contentState.present,
      sections
    };

    setContentState(updatedContent);
    updateContent(updatedContent);
  };

  const handleAddSection = (newSection) => {
    const updatedContent = {
      ...contentState.present,
      sections: [...contentState.present.sections, newSection]
    };
    setContentState(updatedContent);
    updateContent(updatedContent);
  };

  const handleUpdateContent = (updatedContent) => {
    setContentState(updatedContent);
    updateContent(updatedContent);
  };

  const handleRemoveSection = (sectionId) => {
    const updatedContent = {
      ...contentState.present,
      sections: contentState.present.sections.filter(section => section.id !== sectionId)
    };
    setContentState(updatedContent);
    updateContent(updatedContent);
  };

  const currentEditingSection = contentState.present.sections.find(
    section => section.id === editingSectionId
  );

  const exportAsHTML = async () => {
    const { banner, sections } = contentState.present;

    // 1. Enhanced image processor with better error handling
    const processImage = async (url) => {
      if (!url) return null;

      // Return default banner if no image is set
      if (url === 'default') return defaultBanner;

      // Skip processing if it's already a data URL or external URL
      if (url.startsWith('data:') || !url.startsWith('blob:')) {
        return url;
      }

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Failed to read blob'));
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Image processing failed:', error);
        return null; // Return null if conversion fails
      }
    };

    // 2. Process banner image with fallback
    const processedBannerImage = banner.backgroundImage
      ? await processImage(banner.backgroundImage)
      : await processImage('default'); // Use default if no image

    // 3. Generate banner HTML with safe fallback
    const bannerHTML = `
    <div style="padding: 2rem; box-sizing: border-box;">
      <div style="
        position: relative;
        width: 100%;
        max-width: 1097px;
        aspect-ratio: 1097/520;
        margin: 0 auto;
        overflow: hidden;
      ">
        <!-- Background Image -->
        ${processedBannerImage ? `
          <img src="${processedBannerImage}" 
               style="
                 position: absolute;
                 width: 100%;
                 height: 100%;
                 object-fit: cover;
                 object-position: center;
               "
               alt="Website Banner">
        ` : `
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          "></div>
        `}
        
        <!-- Dark overlay -->
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.3);
        "></div>
        
        <!-- Content container -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          padding: 0 2rem;
          box-sizing: border-box;
        ">
          <div style="
            text-align: center;
            color: white;
            padding: 2rem;
            background-color: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(2px);
            border-radius: 12px;
            max-width: 40%;
          ">
            <h1 style="
              margin: 0;
              font-size: clamp(1.5rem, 4vw, 2.5rem);
              font-weight: 700;
              line-height: 1.2;
            ">${banner.title || 'Welcome to Our Website'}</h1>
            
            ${banner.subtitle ? `
              <p style="
                font-size: clamp(0.9rem, 2vw, 1.25rem);
                margin: 1rem 0 0;
                max-width: 700px;
                margin-left: auto;
                margin-right: auto;
              ">${banner.subtitle}</p>
            ` : ''}
            
            ${banner.ctaText ? `
              <div style="margin-top: 2rem;">
                <a href="${banner.ctaLink || '#'}" 
                   style="
                     display: inline-block;
                     padding: 0.75rem 1.5rem;
                     background-color: #4CAF50;
                     color: white;
                     text-decoration: none;
                     border-radius: 30px;
                     font-weight: bold;
                     font-size: clamp(0.9rem, 2vw, 1rem);
                     transition: all 0.3s ease;
                   "
                   onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.2)'"
                   onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none'">
                  ${banner.ctaText}
                </a>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;

    // 4. Process all section images
    const processedSections = await Promise.all(
      sections.map(async (section) => {
        const processed = { ...section };

        // Process main section image
        if (section.image) {
          processed.image = await processImage(section.image);
        }

        // Process gallery images
        if (section.images) {
          processed.images = await Promise.all(
            section.images.map(async img => ({
              ...img,
              url: await processImage(img.url)
            })))
        }

        // Process service items
        if (section.items) {
          processed.items = await Promise.all(
            section.items.map(async item => ({
              ...item,
              icon: item.icon ? await processImage(item.icon) : null
            })))
        }

        return processed;
      })
    );

    // 5. Generate sections HTML
    const sectionsHTML = processedSections.map((section) => {
      const sectionStyle = `
        background-color: ${section.styles?.backgroundColor || '#ffffff'};
        color: ${section.styles?.textColor || '#000000'};
        padding: ${section.styles?.padding || '20px'};
        text-align: ${section.styles?.textAlign || 'left'};
        margin: 20px 0;
      `;

      switch (section.type) {
        case 'text':
          return `
            <section style="${sectionStyle}">
              ${section.image ? `
                <div class="section-image">
                  <img src="${section.image}" alt="${section.title || ''}" 
                       style="max-width: 100%; height: auto;"/>
                </div>
              ` : ''}
              <div class="section-content">
                <h2 style="color: ${section.styles?.textColor || '#000000'}; 
                            text-align: ${section.styles?.textAlign || 'left'}">
                  ${section.title || ''}
                </h2>
                <p style='text-align:justify;'>${section.content || ''}</p>
              </div>
            </section>
          `;

        case 'about':
          return `
            <section style="${sectionStyle}">
              ${section.image ? `
                <div class="section-image">
                  <img src="${section.image}" alt="${section.title || 'About Us'}" 
                       style="max-width: 100%; height: auto;"/>
                </div>
              ` : ''}
              <div class="section-content">
                <h2 style="color: ${section.styles?.textColor || '#000000'}; 
                                text-align: ${section.styles?.textAlign || 'left'}">
                  ${section.title || 'About Us'}
                </h2>
                <p>${section.content || ''}</p>
              </div>
            </section>
          `;

        case 'services':
          return `
            <section style="${sectionStyle}">
              <h2 style="color: ${section.styles?.textColor || '#000000'}; 
                          text-align: center">
                ${section.title || 'Our Services'}
              </h2>
              <div class="services-grid" style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
                padding: 20px;
              ">
                ${(section.items || []).map(item => `
                  <div class="service-card" style="
                    border: 1px solid #ddd;
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                  ">
                    ${item.icon ? `
                      <div class="service-icon">
                        <img src="${item.icon}" alt="${item.name || 'Service'}" 
                             style="width: 50px; height: 50px;"/>
                      </div>
                    ` : ''}
                    <h3>${item.name || 'Service'}</h3>
                    <p>${item.description || ''}</p>
                  </div>
                `).join('')}
              </div>
            </section>
          `;

        case 'gallery':
          return `
            <section style="${sectionStyle}">
              <h2 style="color: ${section.styles?.textColor || '#000000'}; 
                              text-align: ${section.styles?.textAlign || 'left'}">
                ${section.title || 'Gallery'}
              </h2>
              <div class="image-gallery" style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 15px;
              ">
                ${(section.images || []).map(image => `
                  <div class="gallery-item">
                    <img src="${image.url}" 
                         alt="${image.alt || 'Gallery item'}" 
                         style="width: 100%; height: auto; border-radius: 4px;"/>
                  </div>
                `).join('')}
              </div>
            </section>
          `;

        default:
          return '';
      }
    }).join('');

    // 6. Combine into full HTML document
    const fullHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${banner.title || 'My Website'}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .section-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        img {
          max-width: 100%;
          height: auto;
        }
      </style>
    </head>
    <body>
      ${bannerHTML}
      <main>
        ${sectionsHTML}
      </main>
    </body>
    </html>
  `;

    // 7. Create and trigger download
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-website.html';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="dashboard">
      <h2>Admin Dashboard</h2>

      <div className="dashboard-controls">
        <button onClick={() => setPreviewMode(!previewMode)}
          className={`mode-toggle ${previewMode ? 'preview-active' : ''}`}
        >
          {previewMode ? 'Exit Preview' : 'Preview Mode'}
        </button>

        <div className="undo-redo-controls">
          <button onClick={undo} disabled={!canUndo}>Undo</button>
          <button onClick={redo} disabled={!canRedo}>Redo</button>
        </div>

        <button onClick={exportAsHTML} className="export-btn">
          Export as HTML
        </button>
      </div>

      {previewMode ? (
        <div className="preview-container">
          <Home content={contentState.present} />
        </div>
      ) : (
        <>
          <AddSection onAddSection={handleAddSection} />

          <div className="dashboard-sections">
            {contentState.present.sections.map((section, index) => (
              <DraggableSection
                key={section.id}
                id={section.id}
                index={index}
                moveSection={moveSection}
              >
                <div className="dashboard-card">
                  <h3>{section.type} Section</h3>
                  <p className="section-title-preview">{section.title}</p>
                  <div className="section-actions">
                    <button
                      onClick={() => setEditingSectionId(section.id)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleRemoveSection(section.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </DraggableSection>
            ))}
          </div>

          {currentEditingSection && (
            <ContentEditor
              section={currentEditingSection}
              onSave={(updatedSection) => {
                const updatedSections = contentState.present.sections.map(s =>
                  s.id === editingSectionId ? updatedSection : s
                );
                const updatedContent = {
                  ...contentState.present,
                  sections: updatedSections
                };
                setContentState(updatedContent);
                updateContent(updatedContent);
                setEditingSectionId(null);
              }}
              onCancel={() => setEditingSectionId(null)}
              onDelete={handleRemoveSection}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;