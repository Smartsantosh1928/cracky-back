const express = require("express");
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); 
    },
});
  
const upload = multer({ storage: storage });

router.use('/uploads', express.static('uploads'));


router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, msg: 'Please upload a file' });
    }
  
    const uniqueFileName = `${Date.now()}-${req.file.originalname}`;
  
    fs.rename(req.file.path, `uploads/${uniqueFileName}`, (err) => {
      if (err) {
        return res.status(500).json({ success: false, msg: 'Something went wrong', err });
      }
  
      res.status(200).json({ success: true, fileName: uniqueFileName});
    });
});
  
const deleteFile = (fileName) => {
    fs.unlink(`uploads/${fileName}`, (err) => {
      if (err) {
        console.log(err);
      }
    });
}

router.post('/delete', (req, res) => {
    const { fileName } = req.body;
  
    deleteFile(fileName);
  
    res.status(200).json({ success: true, msg: 'File deleted successfully' });
});

module.exports = router;