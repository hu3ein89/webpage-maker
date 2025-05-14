import { useEffect, useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from './components/Header';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import BannerEditor from './components/BannerEditor';
import { fetchContent, updateContent } from './api/contentService';
import './App.css';
import defaultBanner from './assets/default.png';
import { DndProvider } from 'react-dnd';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const [currentPage, setCurrentPage] = useState(
    localStorage.getItem('currentPage') || 'home'
  );
  const [showBannerEditor, setShowBannerEditor] = useState(false);
  const queryClient = useQueryClient();

    // Load initial content from localStorage or use default
    const initialContent = localStorage.getItem('websiteContent') 
    ? JSON.parse(localStorage.getItem('websiteContent'))
    : {
        banner: {
          title: 'Welcome to Our Website',
          subtitle: 'Discover amazing content',
          backgroundImage: defaultBanner,
          ctaText: 'Learn More',
          ctaLink: '#'
        },
        sections: []
      };

  const { data: websiteContent, isLoading } = useQuery({
    queryKey: ['websiteContent'],
    queryFn: fetchContent,
    initialData: initialContent
  });

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  // Update localStorage whenever content changes
  useEffect(() => {
    if (websiteContent) {
      localStorage.setItem('websiteContent', JSON.stringify(websiteContent));
    }
  }, [websiteContent]);

  const updateContentMutation = useMutation({
    mutationFn: updateContent,
    onSuccess: (newContent) => {
      queryClient.setQueryData(['websiteContent'], newContent);
    }
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('home');
    localStorage.removeItem('isAuthenticated');
  };

  const moveSection = (fromIndex, toIndex) => {
    const sections = [...websiteContent.sections];
    const [movedSection] = sections.splice(fromIndex, 1);
    sections.splice(toIndex, 0, movedSection);
    updateContentMutation.mutate({
      ...websiteContent,
      sections
    });
  };

  const removeSection = (sectionId) => {
    updateContentMutation.mutate({
      ...websiteContent,
      sections: websiteContent.sections.filter(section => section.id !== sectionId)
    });
  };

  const updateBanner = (newBanner) => {
    updateContentMutation.mutate({
      ...websiteContent,
      banner: newBanner
    });
    setShowBannerEditor(false);
  };

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        {showBannerEditor ? (
          <BannerEditor 
            banner={websiteContent.banner} 
            onSave={updateBanner}
            onCancel={() => setShowBannerEditor(false)}
          />
        ) : (
          <>
            <Header 
              isAuthenticated={isAuthenticated} 
              onLogout={handleLogout}
              setCurrentPage={setCurrentPage}
              onEditBanner={() => setShowBannerEditor(true)}
            />
            
            {currentPage === 'home' && <Home content={websiteContent} />}
            
            {currentPage === 'dashboard' && isAuthenticated && (
              <AdminDashboard 
                content={websiteContent} 
                updateContent={updateContentMutation.mutate}
                moveSection={moveSection}
                removeSection={removeSection}
              />
            )}
            
            {currentPage === 'login' && !isAuthenticated && (
              <Login onLogin={handleLogin} />
            )}
          </>
        )}
      </div>
    </DndProvider>
  );
}

export default App;