//@ts-ignore
import multer from "multer";
import { processUploadedFilesForCreate, processUploadedFilesForUpdate } from "../../../middlewares/processUploadedFiles";
import { TFolderName } from "../../../enums/folderNames";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//---------------------------
// 🥇 we move image upload thing to controller to middleware level
//---------------------------
export const imageUploadPipelineForCreateCapsule = [
  [
    upload.fields([
      { name: 'attachments', maxCount: 1 }, // Allow up to 1 cover photo
      { name : 'introductionVideo', maxCount: 1 }
    ]),
  ],
  processUploadedFilesForCreate([
    {
      name: 'attachments',
      folder: TFolderName.journeyCapsule,
      required: true, // optional
      allowedMimeTypes: ['image/jpeg', 'image/png'], // , 'application/pdf'
    },
    {
      name: 'introductionVideo',
      folder: TFolderName.journeyCapsule,
      required: true, // optional
      allowedMimeTypes: ['image/jpeg', 'image/png', 'video/mp4'], // , 'application/pdf'
    },
  ]),
];


export const imageUploadPipelineForUpdateCapsule = [
  [
    upload.fields([
      { name: 'attachments', maxCount: 1 }, // Allow up to 1 cover photo
    ]),
  ],
  processUploadedFilesForUpdate([
    {
      name: 'attachments',
      folder: TFolderName.trainingProgram,
      required: true, // optional
      allowedMimeTypes: ['image/jpeg', 'image/png'], // , 'application/pdf'
    },
  ]),
];