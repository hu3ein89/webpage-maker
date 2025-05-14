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

  return (
    <div className="dashboard">
      <h2>Admin Dashboard</h2>
      
      <div className="dashboard-controls">
        <button 
          onClick={() => setPreviewMode(!previewMode)}
          className={`mode-toggle ${previewMode ? 'preview-active' : ''}`}
        >
          {previewMode ? 'Exit Preview' : 'Preview Mode'}
        </button>
        
        <div className="undo-redo-controls">
          <button onClick={undo} disabled={!canUndo}>Undo</button>
          <button onClick={redo} disabled={!canRedo}>Redo</button>
        </div>
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