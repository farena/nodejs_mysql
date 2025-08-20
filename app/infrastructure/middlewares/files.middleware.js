/* eslint-disable no-restricted-syntax */
const multer = require('multer'); // Middleware to be able to receive files in requests
const path = require('path');
const { uuid } = require('uuidv4');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, `${(uuid()).split('-').join('')}${path.extname(file.originalname)}`);
  },
});

// Middleware to be able to receive files in requests
// Filtering by mimetype. Only PDFs
const pdfMiddleware = multer({
  storage,
  fileFilter(req, file, cb) {
    const filetypes = /pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    return cb(new Error(`File upload only supports the following filetypes - ${filetypes}`), false);
  },
});

// Middleware to be able to receive files in requests
// Filtering by mimetype. Only JPG/PNG
const imageMiddleware = multer({
  storage,
  fileFilter(req, file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype) {
      return cb(null, true);
    }
    return cb(new Error(`File upload only supports the following filetypes - ${filetypes}`), false);
  },
});

// Middleware to be able to receive files in requests
// Filtering by mimetype. Only JPG/PNG/PDF
const imageOrPDFMiddleware = multer({
  storage,
  fileFilter(req, file, cb) {
    const filetypes = /pdf|jpg|jpeg|png/;
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype) {
      return cb(null, true);
    }
    return cb(new Error(`File upload only supports the following filetypes - ${filetypes}`), false);
  },
});

module.exports = {
  pdfMiddleware,
  imageMiddleware,
  imageOrPDFMiddleware,
};
