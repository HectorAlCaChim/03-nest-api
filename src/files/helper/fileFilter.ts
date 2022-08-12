export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
    
    if (!file) return callback(new Error('File is Empty'), false);

    const fileExecption = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if (validExtensions.includes(fileExecption)) {
        return callback(null, true)
    }
    callback(null, true);
}