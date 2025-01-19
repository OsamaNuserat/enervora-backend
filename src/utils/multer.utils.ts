import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        if (file.fieldname === 'profilePicture') {
            cb(null, path.join(uploadPath, 'profile-pictures'));
        } else if (file.fieldname === 'bannerPicture') {
            cb(null, path.join(uploadPath, 'banner-pictures'));
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${(req as any).user.id}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'profilePicture' || file.fieldname === 'bannerPicture') {
        cb(null, true);
    } else {
        cb(new Error('Invalid field name'), false);
    }
};

export const multerOptions: multer.Options = {
    storage,
    fileFilter
};
