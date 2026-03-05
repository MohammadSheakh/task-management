//@ts-ignore
import multer from "multer";
import { processUploadedFilesForCreate, processUploadedFilesForUpdate } from "../../../middlewares/processUploadedFiles";
import { TFolderName } from "../../../enums/folderNames";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//---------------------------
// 🥇 we move image upload thing to controller to middleware level
//---------------------------
export const imageUploadPipelineForCreateAdminModules = [
  [
    upload.fields([
      { name: 'attachments', maxCount: 1 }, // Allow up to 1 cover photo
    ]),
  ],
  processUploadedFilesForCreate([
    {
      name: 'attachments',
      folder: TFolderName.adminModules,
      required: true, // optional
      allowedMimeTypes: ['image/jpeg', 'image/png'], // , 'application/pdf'
    },
  ]),
];


export const imageUploadPipelineForUpdateAdminModules = [
  [
    upload.fields([
      { name: 'attachments', maxCount: 1 }, // Allow up to 1 cover photo
    ]),
  ],
  processUploadedFilesForUpdate([
    {
      name: 'attachments',
      folder: TFolderName.adminModules,
      required: true, // optional
      allowedMimeTypes: ['image/jpeg', 'image/png'], // , 'application/pdf'
    },
  ]),
];