import multer,{diskStorage} from "multer";


export const uploadCloud=()=>{
    const storage=diskStorage({})//temp tmp


    const multerUpload=multer({storage});

    return multerUpload; //object
}