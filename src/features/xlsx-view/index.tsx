import * as XLSX from "xlsx";
import { randomUUID } from "crypto";
import {
  CheckIcon,
  FileIcon,
  ListOrderedIcon,
  TrashIcon,
  UploadCloudIcon,
  UserCheckIcon,
  UserXIcon,
  XIcon,
} from "lucide-react";
import {
  forwardRef,
  useReducer,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

const MAX_FILE_SIZE = 4;

interface FileWithUrl {
  id: string;
  name: string;
  size: number;
  file: any;
  fileData: any;
  mutate?: {
    done: number;
    error: number;
  };
  isMutating?: boolean;
  rowCount?: number;
  error?: boolean | undefined;
}
import { toast } from "sonner";
import { cn, generateUUID, validateFileType } from "~/lib/utils";
import Button from "~/ui/buttons";
import ExcelIcon from "~/ui/icons/excel";
import { api, RouterOutputs } from "~/trpc/react";
import { date } from "zod";
import ThreeDotsWave from "~/ui/loadings/three-dots-wave";
import moment from "jalali-moment";
import H2 from "~/ui/heading/h2";
// Reducer action(s)
const addFilesToInput = () => ({
  type: "ADD_FILES_TO_INPUT" as const,
  payload: [] as FileWithUrl[],
});

const deleteFileFromInput = () => ({
  type: "DELETE_FILE_FROM_INPUT" as const,
  id: "" as string,
});

const addDoneStatusToFileMutate = () => ({
  type: "Add_Done_Status_To_File_Mutate" as const,
});

const addErrorStatusToFileMutate = () => ({
  type: "Add_Error_Status_To_File_Mutate" as const,
});

const resetFileMutateStatus = () => ({
  type: "Reset_File_Mutate_Status" as const,
  id: "" as string,
});

const updateFileRowCount = () => ({
  type: "UPDATE_FILE_RowCount" as const,
  id: "" as string,
  rowCount: -1 as number,
});

const updateFileIsMutatingStatus = () => ({
  type: "Update_File_IsMutating_Status" as const,
  id: "" as string,
  isMutating: false as boolean,
});

type Action =
  | ReturnType<typeof addFilesToInput>
  | ReturnType<typeof deleteFileFromInput>
  | ReturnType<typeof addDoneStatusToFileMutate>
  | ReturnType<typeof addErrorStatusToFileMutate>
  | ReturnType<typeof resetFileMutateStatus>
  | ReturnType<typeof updateFileRowCount>
  | ReturnType<typeof updateFileIsMutatingStatus>;

type State = FileWithUrl[];

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

// type TogglePersonnelDayOff =
//   RouterOutputs["personnelPerformance"]["togglePersonnelDayOff"][number];
const XlsxViewer = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const togglePersonnelDayOff =
      api.personnelPerformance.togglePersonnelDayOff.useMutation({
        onMutate: (data: any) => {
          toast("در حال پردازش مرخصی", {
            description: (
              <>
                <div className="flex flex-col items-center justify-end gap-2">
                  <span> {data.cityName}</span>
                  <span> {data.nameFamily}</span>
                  <span> {data.date}</span>
                  <span> {data.nationalCode}</span>
                </div>
              </>
            ),
            action: {
              label: "باشه",
              onClick: () => {},
            },
          });
        },
        onSuccess: (data: any, variables: any) => {
          dispatch({
            type: "Add_Done_Status_To_File_Mutate",
          });

          toast("مرخصی رد شد", {
            description: (
              <>
                <div className="flex flex-col items-center justify-end gap-2">
                  <span> {variables.cityName}</span>
                  <span> {variables.nameFamily}</span>
                  <span> {variables.date}</span>
                  <span> {variables.nationalCode}</span>
                </div>
              </>
            ),
            action: {
              label: "باشه",
              onClick: () => {},
            },
          });
        },
        onError: (data: any) => {
          dispatch({
            type: "Add_Error_Status_To_File_Mutate",
          });

          toast("خطا", {
            description: (
              <>
                <div className="flex flex-col items-center justify-end gap-2">
                  <span> {data.cityName}</span>
                  <span> {data.nameFamily}</span>
                  <span> {data.date}</span>
                  <span> {data.nationalCode}</span>
                </div>
              </>
            ),
            action: {
              label: "باشه",
              onClick: () => {},
            },
          });
        },
      });
    const isMutating = useRef(false);
    const [dragActive, setDragActive] = useState<boolean>(false);

    const [input, dispatch] = useReducer((state: State, action: Action) => {
      switch (action.type) {
        case "ADD_FILES_TO_INPUT": {
          // do not allow more than 5 files to be uploaded at once
          if (state.length + action.payload.length > 10) {
            toast("Too many files", {
              description:
                "You can only upload a maximum of 5 files at a time.",
            });
            return state;
          }

          return [...state, ...action.payload];
        }
        case "DELETE_FILE_FROM_INPUT": {
          // do not allow more than 5 files to be uploaded at once

          return [...state.filter((a) => a.id !== action.id)];
        }
        case "Add_Done_Status_To_File_Mutate": {
          // do not allow more than 5 files to be uploaded at once
          const index = state.findIndex((a) => a.isMutating);
          const copy = [...state];
          copy[index] = {
            ...copy[index],
            mutate: {
              done: (copy[index]?.mutate?.done ?? 0) + 1,
              error: copy[index]?.mutate?.error ?? 0,
            },
          };
          return copy;
        }
        case "Add_Error_Status_To_File_Mutate": {
          // do not allow more than 5 files to be uploaded at once

          const index = state.findIndex((a) => a.isMutating);
          const copy = [...state];
          copy[index] = {
            ...copy[index],
            mutate: {
              done: copy[index]?.mutate?.done ?? 0,
              error: (copy[index]?.mutate?.error ?? 0) + 1,
            },
          };
          return copy;
        }
        case "Reset_File_Mutate_Status": {
          // do not allow more than 5 files to be uploaded at once

          const index = state.findIndex((a) => a.id === action.id);
          const copy = [...state];
          copy[index] = {
            ...copy[index],
            mutate: {
              done: 0,
              error: 0,
            },
          };
          return copy;
        }
        case "UPDATE_FILE_RowCount": {
          // do not allow more than 5 files to be uploaded at once
          const index = state.findIndex((a) => a.id !== action.id);
          const copy = [...state];
          copy[index] = { ...copy[index], rowCount: action.rowCount };
          return copy;
        }
        case "Update_File_IsMutating_Status": {
          // do not allow more than 5 files to be uploaded at once

          const index = state.findIndex((a) => a.id === action.id);
          const copy = [...state];
          copy[index] = { ...copy[index], isMutating: action.isMutating };
          return copy;
        }
        // You could extend this, for example to allow removing files
      }
    }, []);

    const noInput = input.length === 0;

    // handle drag events
    const handleDrag = (e: DragEvent<HTMLFormElement | HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    // triggers when file is selected with click
    const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      try {
        if (e.target.files && e.target.files[0]) {
          // at least one file has been selected

          // validate file type
          const valid = validateFileType(e.target.files[0]);
          if (!valid) {
            toast("فایل نامعتبر", {
              description: "لطفا از فایل اکسل مانند xlsx و csv استفاده کنید",
            });
            return;
          }

          const { name, size } = e.target.files[0];

          const arrayBuffer = await e.target.files[0].arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, {
            type: "buffer",
          });
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];

          const data: any = XLSX.utils.sheet_to_json(worksheet);

          addFilesToState([
            {
              file: e.target.files[0],
              name,
              size,
              id: generateUUID(),
              fileData: data,
              rowCount: data.length,
              isMutating: false,
            },
          ]);
        }
      } catch (error) {
        // already handled
      }
    };

    const addFilesToState = (files: FileWithUrl[]) => {
      dispatch({ type: "ADD_FILES_TO_INPUT", payload: files });
    };

    // triggers when file is dropped
    const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      // validate file type
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const files = Array.from(e.dataTransfer.files);
        const validFiles = files.filter((file) => validateFileType(file));

        if (files.length !== validFiles.length) {
          toast("فایل نامعتبر", {
            description: "لطفا از فایل اکسل مانند xlsx و csv استفاده کنید",
          });
          setDragActive(false);
          return;
        }

        setDragActive(false);

        let filestoAdd = await Promise.all(
          files.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, {
              type: "buffer",
            });
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];

            const data: any = XLSX.utils.sheet_to_json(worksheet);

            return {
              file: file,
              fileData: data,
              rowCount: data.length,
              size: file.size,
              name: file.name,
              isMutating: false,
              id: generateUUID(),
            };
          }),
        );

        // Now, filestoAdd is an array of objects, not promises
        // at least one file has been selected
        addFilesToState(filestoAdd);
        e.dataTransfer.clearData();
      }
    };

    async function onMutateFile(value) {
      if (input.find((a) => a.isMutating === true)) {
        return;
      }
      // const arrayBuffer = await item.file.arrayBuffer();
      // const workbook = XLSX.readFile(arrayBuffer, {
      //   type: "buffer",
      // });
      // const worksheetName = workbook.SheetNames[0];
      // const worksheet = workbook.Sheets[worksheetName];

      // const data: any = XLSX.utils.sheet_to_json(worksheet);

      for (const item of value.fileData) {
        if (isMutating.current === false) break;
        try {
          await togglePersonnelDayOff.mutateAsync({
            cityName: item.cityName,
            date: item.date,
            nameFamily: item.nameFamily,
            nationalCode: item.nationalCode,
          });
        } catch {
          console.log(moment().format("HH:mm:ss:SSS"));
        }
      }
      dispatch({
        type: "Update_File_IsMutating_Status",
        id: value.id,
        isMutating: false,
      });
    }
    return (
      <>
        <H2 className="text-2xl text-accent">آپلود فایل مرخصی</H2>
        <form
          onSubmit={(e) => e.preventDefault()}
          onDragEnter={handleDrag}
          className="relative flex h-full w-auto min-w-[30%] items-center justify-start"
        >
          <label
            htmlFor="dropzone-file"
            className={cn(
              "group relative flex aspect-video h-full w-full flex-col items-center justify-center rounded-lg  border-2 border-dashed transition",
              { "border-accent": dragActive },
              { "aspect-auto h-fit": !noInput },
              { "items-start justify-start": !noInput },
              { ":hover:bg-slate-800 hover:border-gray-500": noInput },
            )}
          >
            <div
              className={cn(
                "relative flex h-full w-full flex-col items-center justify-center",
                { "items-start": !noInput },
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 flex cursor-pointer flex-col gap-3 rounded-xl ",
                  { "border-accent bg-accent/10  ": dragActive },
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              />{" "}
              {noInput ? (
                <>
                  <UploadCloudIcon
                    className={cn(" h-12 w-12 stroke-primary", {
                      "  stroke-accent": dragActive,
                    })}
                  />
                  <p
                    className={cn(" text-center  text-sm text-primary", {
                      "  text-accent": dragActive,
                    })}
                  >
                    <span
                      className={cn(" text-sm font-semibold  text-primary", {
                        "  text-accent": dragActive,
                      })}
                    >
                      برای آپلود کلیک کنید
                    </span>
                    <br />
                    یا
                    <br />
                    <span
                      className={cn(" text-sm  text-primary", {
                        "  text-accent": dragActive,
                      })}
                    >
                      یا فایل را رها کنید
                    </span>
                  </p>
                  {/* <p
                    className={cn(" text-sm  text-primary", {
                      "  text-accent": dragActive,
                    })}
                  >
                    up to 5 images, {(MAX_FILE_SIZE / 1000000).toFixed(0)}MB per
                    file
                  </p> */}
                  <input
                    {...props}
                    ref={ref}
                    multiple
                    onChange={handleChange}
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.csv" // Correct accept attribute
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                  />
                </>
              ) : (
                <div className="relative  flex w-full flex-col gap-2 rounded-xl p-2 ">
                  <table className="w-full divide-y-2 overflow-hidden  overflow-y-auto  text-center ">
                    <thead className="">
                      <tr>
                        <th
                          scope="col"
                          className=" p-2  text-center text-xs font-medium uppercase  tracking-wider text-primary"
                        >
                          #
                        </th>
                        <th
                          scope="col"
                          className=" p-2  text-center text-xs font-medium uppercase  tracking-wider text-primary"
                        >
                          نام
                        </th>
                        <th
                          scope="col"
                          className=" p-2 text-center text-xs font-medium uppercase  tracking-wider text-primary"
                        >
                          حجم (بایت)
                        </th>
                        <th
                          scope="col"
                          className=" p-2 text-center text-xs font-medium uppercase  tracking-wider text-primary"
                        >
                          عملیات
                        </th>
                        <th
                          scope="col"
                          className=" p-2 text-center text-xs font-medium uppercase  tracking-wider text-primary"
                        >
                          وضعیت
                        </th>
                      </tr>
                    </thead>
                    <tbody className="relative divide-y">
                      {input.map((file, index) => (
                        <tr key={index}>
                          <td className="whitespace-nowrap p-2 text-center  text-sm text-primary ">
                            <ExcelIcon className="h-10 w-10" />
                          </td>
                          <td className="whitespace-nowrap p-2 text-center text-sm text-primary ">
                            {file.name}
                          </td>
                          <td className="whitespace-nowrap p-2 text-center text-sm text-primary ">
                            {file.size}
                          </td>
                          <td className="whitespace-nowrap p-2 text-center text-sm text-primary ">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                disabled={!file.isMutating}
                                type="submit"
                                className="bg-accent/10 text-accent"
                                onClick={() => {
                                  dispatch({
                                    type: "Update_File_IsMutating_Status",
                                    id: file.id,
                                    isMutating: false,
                                  });
                                  isMutating.current = false;
                                }}
                              >
                                لغو
                              </Button>
                              <Button
                                disabled={
                                  input.filter((a) => a.isMutating === true)
                                    .length > 0
                                }
                                type="submit"
                                className="bg-accent/10 text-accent"
                                onClick={() => {
                                  dispatch({
                                    type: "Reset_File_Mutate_Status",
                                    id: file.id,
                                  });
                                  dispatch({
                                    type: "Update_File_IsMutating_Status",
                                    id: file.id,
                                    isMutating: true,
                                  });
                                  isMutating.current = true;
                                  onMutateFile(file);
                                }}
                              >
                                رد کردن مرخصی
                              </Button>
                              <Button
                                type="submit"
                                className="bg-rose-700/10 text-rose-700"
                                onClick={(e) => {
                                  e.preventDefault();
                                  dispatch({
                                    type: "DELETE_FILE_FROM_INPUT",
                                    id: file.id,
                                  });
                                }}
                              >
                                <TrashIcon className="h-5 w-5" />
                              </Button>
                            </div>
                          </td>
                          <td className="whitespace-nowrap p-2 text-center text-sm text-primary ">
                            <div className="flex items-center justify-center gap-2">
                              <div className="flex flex-col items-center justify-center gap-1">
                                <UserCheckIcon className="stroke-emerald-600" />
                                <span className="w-full ">
                                  {file?.mutate?.done ?? 0}
                                </span>
                              </div>
                              <div className="flex flex-col items-center justify-center gap-1 text-center">
                                <UserXIcon className=" stroke-rose-600" />
                                <span className="w-full text-left ">
                                  {file?.mutate?.error ?? 0}
                                </span>
                              </div>
                              <div className="flex flex-col items-center justify-center gap-1 text-center">
                                <ListOrderedIcon className=" stroke-amber-600" />
                                <span className="w-full text-left ">
                                  {file?.rowCount ?? 0}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div
                    className={cn(
                      "flex w-full cursor-pointer flex-col gap-3 rounded-xl bg-accent/10 p-2 ",
                      { "border-accent bg-accent/10  ": dragActive },
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <label
                      htmlFor="dropzone-file-images-present"
                      className="group z-10 flex cursor-pointer justify-center transition"
                    >
                      <UploadCloudIcon className="stroke-accent " />
                      <input
                        {...props}
                        ref={ref}
                        multiple
                        onChange={handleChange}
                        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.csv" // Correct accept attribute
                        type="file"
                        id="dropzone-file-images-present"
                        className=" z-20 hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </label>
        </form>
      </>
    );
  },
);

XlsxViewer.displayName = "XlsxViewer";
export default XlsxViewer;
