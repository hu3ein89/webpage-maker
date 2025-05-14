export const ImageUploader = ({ onUpload, maxSize = 1024 }) => {
    const resizeImage = (file) => {
      return new Promise((resolve) => {
        Resizer.imageFileResizer(
          file,
          maxSize,
          maxSize,
          'WEBP',
          70,
          0,
          (uri) => resolve(uri),
          'base64'
        );
      });
    };
  
    const handleChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const optimizedImage = await resizeImage(file);
        onUpload(optimizedImage);
      }
    };
  
    return <input type="file" accept="image/*" onChange={handleChange} />;
  };