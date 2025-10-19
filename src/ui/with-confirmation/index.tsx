import { useState } from "react";

import Modal from "~/ui/modals";
import Button from "~/ui/buttons";

export default function withConfirmation(Component) {
  return function WrappedComponent({
    withModal = true,
    title = "",
    confirmText = "تایید",
    cancelText = "لغو",
    onConfirm = (e) => {},
    ...rest
  }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        {isOpen && (
          <>
            {withModal ? (
              <Modal
                size="xs"
                center
                className="bg-secondary"
                zIndex="z-[10001]"
                title={title}
                isOpen={isOpen}
                onClose={() => {
                  setIsOpen(false);
                }}
              >
                <div className="flex h-full w-full items-center justify-center pb-5">
                  <Content
                    onConfirm={(e) => {
                      setIsOpen(false);
                      onConfirm(e);
                    }}
                    onReject={() => {
                      setIsOpen(false);
                    }}
                    confirmText={confirmText}
                    cancelText={cancelText}
                  />
                </div>
              </Modal>
            ) : (
              <Content
                onConfirm={(e) => {
                  setIsOpen(false);
                  onConfirm(e);
                }}
                onReject={() => {
                  setIsOpen(false);
                }}
                confirmText={confirmText}
                cancelText={cancelText}
              />
            )}
          </>
        )}
        {!isOpen && (
          <div onClick={() => setIsOpen(true)}>
            <Component {...rest} />
          </div>
        )}
      </>
    );
  };
}

function Content({
  onConfirm = (e) => {},
  onReject = (e) => {},
  confirmText = "تایید",
  cancelText = "لغو",
}) {
  return (
    <div className="flex gap-5">
      <div className="flex w-fit">
        <Button
          onClick={(e) => onReject(e)}
          className="rounded-lg bg-primary px-7 text-secondary  hover:bg-primary/60"
        >
          {cancelText}
        </Button>
      </div>
      <div className="flex w-fit">
        <Button
          onClick={(e) => {
            onConfirm(e);
          }}
          className=" rounded-lg bg-secondary px-6 text-primary ring-1 ring-inset ring-accent hover:bg-secbuttn  hover:text-primbuttn"
        >
          {confirmText}
        </Button>
      </div>
    </div>
  );
}

// import { Fragment } from "react";
// import { XIcon } from "@heroicons/react/solid";
// import { Dialog, Transition } from "@headlessui/react";

// export default function WithConfirmation({
//   children,
//   isOpen = false,
//   noClose = false,
//   close = () => {},
//   title = "",
//   className = "",
//   width = 300,
// }) {
//   return (
//     <Transition appear show={isOpen} as={Fragment}>
//       <Dialog
//         as="div"
//         className={`fixed inset-0 z-40 overflow-visible overflow-y-auto bg-blue-900 bg-opacity-90 ${className}`}
//         onClose={() => !noClose && close()}
//       >
//         <div className="fixed inset-0 bg-atysa-900-800 opacity-80" />
//         <div className="flex justify-center items-center ">
//           <Transition.Child
//             as={Fragment}
//             enter="ease-out duration-300"
//             enterFrom="opacity-0"
//             enterTo="opacity-100"
//             leave="ease-in duration-200"
//             leaveFrom="opacity-100"
//             leaveTo="opacity-0"
//           >
//             <Dialog.Overlay className="fixed inset-0" />
//           </Transition.Child>

//           {/* This element is to trick the browser into centering the modal contents. */}
//           <span
//             className="inline-block h-screen align-middle"
//             aria-hidden="true"
//           >
//             &#8203;
//           </span>
//           <Transition.Child
//             as={Fragment}
//             show={isOpen}
//             enter="ease-out duration-300"
//             enterFrom="opacity-0 scale-95"
//             enterTo="opacity-100 scale-100"
//             leave="ease-in duration-200"
//             leaveFrom="opacity-100 scale-100"
//             leaveTo="opacity-0 scale-95"
//           >
//             <div
//               className={`border border-gray-200 mx-auto ${
//                 width ? width : "w-full md:w-1/2 2xl:w-1/4"
//               } p-8 md:inline-block text-black-700 overflow-visible text-left align-middle transition-all transform bg-white shadow-xl md:rounded-2xl md:my-8`}
//             >
//               <div className="relative flex items-center">
//                 <div className="flex-grow">
//                   <Dialog.Title as="h3">{title}</Dialog.Title>
//                 </div>
//                 <div>{!noClose && close}</div>
//               </div>
//               <div className="mt-6">{children}</div>
//             </div>
//           </Transition.Child>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// }
