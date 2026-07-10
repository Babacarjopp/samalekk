const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'votre_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'votre_api_key' &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_API_SECRET !== 'votre_api_secret'
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
} else {
  console.warn('⚠️ Cloudinary non configuré : upload des images désactivé, fallback en mémoire activé.');
}

const storageOptions = {
  folder: 'touba-food/plats',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation: [{ width: 800, height: 600, crop: 'fill' }]
};

const storageRestaurantOptions = {
  folder: 'touba-food/restaurants',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation: [{ width: 1200, height: 600, crop: 'fill' }]
};

const storagePlats = hasCloudinaryConfig
  ? new CloudinaryStorage({ cloudinary, params: storageOptions })
  : multer.memoryStorage();

const storageRestaurants = hasCloudinaryConfig
  ? new CloudinaryStorage({ cloudinary, params: storageRestaurantOptions })
  : multer.memoryStorage();

const uploadPlat = multer({
  storage: storagePlats,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadRestaurant = multer({
  storage: storageRestaurants,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { cloudinary, uploadPlat, uploadRestaurant };