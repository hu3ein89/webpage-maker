import { useState } from 'react';
import defaultBanner from '../assets/default.png';

const Home = ({ content }) => {
  const [loadedImages, setLoadedImages] = useState({});

  const handleImageLoad = (id) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const renderSection = (section) => {
    const sectionStyle = {
      backgroundColor: section.styles?.backgroundColor || '#ffffff',
      color: section.styles?.textColor || '#000000',
      padding: section.styles?.padding || '20px',
      textAlign: section.styles?.textAlign || 'left'
    };

    switch (section?.type) {
      case 'text':
        return (
          <section key={section.id} style={sectionStyle}>
            {section?.image && (
              <div className="section-image">
                <img src={section.image} alt={section?.title} />
              </div>
            )}
            <div className="section-content">
              <h2 style={{ color: section.styles?.textColor, textAlign: section.styles?.textAlign }}>{section?.title}</h2>
              <p>{section?.content || ''}</p>
            </div>
          </section>
        );

      case 'about':
        return (
          <section key={section.id} style={sectionStyle}>
            {section?.image && (
              <div className="section-image">
                <img src={section.image} alt={section?.title || 'About Us'} />
              </div>
            )}
            <div className="section-content">
              <h2 style={{ color: section.styles?.textColor, textAlign: section.styles?.textAlign }}>
                {section?.title || 'About Us'}
              </h2>
              <p>{section?.content || ''}</p>
            </div>
          </section>
        );

      case 'services':
        return (
          <section key={section.id} style={sectionStyle}>
            <h2 style={{ color: section.styles?.textColor, textAlign: section.styles?.textAlign }}>
              {section?.title || 'Our Services'}
            </h2>
            <div className="services-grid">
              {section?.items?.map(item => (
                <div
                  key={item.id}
                  className="service-card"
                  style={{ color: section.styles?.textColor }}
                >
                  {item?.icon && (
                    <div className="service-icon">
                      <img src={item.icon} alt={item?.name || 'Service'} />
                    </div>
                  )}
                  <h3>{item?.name || 'Service'}</h3>
                  <p>{item?.description || ''}</p>
                </div>
              ))}
            </div>
          </section>
        );

      case 'gallery':
        return (
          <section key={section.id} style={sectionStyle}>
            <h2 style={{ color: section.styles?.textColor, textAlign: section.styles?.textAlign }}>
              {section?.title || 'Gallery'}
            </h2>
            <div className="image-gallery">
              {section?.images?.map(image => (
                <div key={image.id} className="gallery-item">
                  <img
                    src={image.url}
                    alt={image.alt || 'Gallery item'}
                    loading="lazy"
                    className={loadedImages[image.id] ? 'loaded' : ''}
                    onLoad={() => handleImageLoad(image.id)}
                  />
                </div>
              ))}
              <div className="section-content">
                <h2 style={{ color: section.styles?.textColor, textAlign: section.styles?.textAlign }}>{section?.content}</h2>
                <p>{section?.content || ''}</p>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };
  const bannerImage = content?.banner?.backgroundImage || defaultBanner;
  return (
    <main className="home">
      <section className="hero-banner"
        style={{
          backgroundImage: content?.banner?.backgroundImage
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${content.banner.backgroundImage})`
            : `url(${bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="banner-content">
          <h1>{content?.banner?.title || 'Welcome'}</h1>
          <p>{content?.banner?.subtitle || 'Discover our content'}</p>
          {content?.banner?.ctaText && content?.banner?.ctaLink && (
            <a href={content.banner.ctaLink} className="cta-button">
              {content.banner.ctaText}
            </a>
          )}
        </div>
      </section>
      {content.sections?.map(renderSection)}
    </main>
  );
};
export default Home;