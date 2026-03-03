const cloudinary = require('../config/cloudinary');

// Upload single image to Cloudinary
async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'swiftmovers/properties',
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    console.error('Upload image error:', err.message);
    res.status(500).json({ message: 'Error uploading image' });
  }
}

// Upload multiple images
async function uploadImages(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const uploadPromises = req.files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'swiftmovers/properties',
              resource_type: 'image',
              transformation: [
                { width: 1200, height: 800, crop: 'limit' },
                { quality: 'auto' },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );
          uploadStream.end(file.buffer);
        }),
    );

    const results = await Promise.all(uploadPromises);

    res.json({
      images: results.map((r) => ({
        url: r.secure_url,
        publicId: r.public_id,
      })),
    });
  } catch (err) {
    console.error('Upload images error:', err.message);
    res.status(500).json({ message: 'Error uploading images' });
  }
}

module.exports = {
  uploadImage,
  uploadImages,
};
