// import Image from "next/image";
// import React from "react";
// import ImageUploading from "react-images-uploading";
// import UploadIcon from "~/ui/icons/upload";
// import XIcon from "~/ui/icons/xicon";

// export default function UploadImageBase64({
//   images = [],
//   onChange = (base64) => {},
//   onError = (error) => {},
// }) {
//   return (
//     <div className="flex items-center justify-center">
//       <ImageUploading
//         maxFileSize={64 * 1024}
//         value={images}
//         onChange={(imageList, addUpdateIndex) => {
//           onChange(imageList[0].data_url);
//         }}
//         onError={(error) => {
//           onError(error.maxFileSize);
//         }}
//         maxNumber={1}
//         dataURLKey="data_url"
//       >
//         {({ imageList, onImageUpload, isDragging, errors, dragProps }) => (
//           // write your building UI
//           <div
//             onClick={onImageUpload}
//             style={isDragging ? { color: "red" } : undefined}
//             {...dragProps}
//             className="relative flex h-64 w-64 cursor-pointer items-center justify-center rounded-3xl border border-dashed border-accent bg-secondary "
//           >
//             <div
//               className={`${
//                 isDragging ? "animate-pulse opacity-100" : "opacity-0"
//               } absolute inset-0 flex   items-center justify-center rounded-2xl bg-accent/60`}
//             />

//             {images.length <= 0 && <UploadIcon />}

//             {imageList.map((image, index) => (
//               <div key={index} className="image-item">
//                 <button
//                   type="button"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onChange("");
//                   }}
//                   className="group relative overflow-hidden"
//                 >
//                   <img
//                     src={images[index]}
//                     alt=""
//                     width={200}
//                     height={200}
//                     className="relative overflow-hidden rounded-2xl"
//                   />

//                   <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-accent/60 opacity-0 transition-opacity  group-hover:opacity-100">
//                     <XIcon />
//                   </div>
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </ImageUploading>
//     </div>
//   );
// }
