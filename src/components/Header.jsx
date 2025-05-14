const Header = ({ isAuthenticated, onEditBanner, onLogout, setCurrentPage }) => {
  return (
    <header className="header">
      <nav>
        <button onClick={() => setCurrentPage('home')}>Home</button>
        
        {isAuthenticated ? (
          <>
            <button onClick={() => setCurrentPage('dashboard')}>Dashboard</button>
            <button onClick={onEditBanner}>Edit Banner</button>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <button onClick={() => setCurrentPage('login')}>Admin Login</button>
        )}
      </nav>
    </header>
  );
};

export default Header;