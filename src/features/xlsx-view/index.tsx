import * as XLSX from "xlsx";
import { randomUUID } from "crypto";
import { FileIcon, TrashIcon, UploadCloudIcon } from "lucide-react";
import {
  forwardRef,
  useReducer,
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
  error?: boolean | undefined;
}
import { toast } from "sonner";
import { cn, generateUUID, validateFileType } from "~/lib/utils";
import Button from "~/ui/buttons";
import ExcelIcon from "~/ui/icons/excel";
import { api, RouterOutputs } from "~/utils/api";
import { date } from "zod";
import ThreeDotsWave from "~/ui/loadings/three-dots-wave";
// Reducer action(s)
const addFilesToInput = () => ({
  type: "ADD_FILES_TO_INPUT" as const,
  payload: [] as FileWithUrl[],
});

const deleteFileFromInput = () => ({
  type: "DELETE_FILE_FROM_INPUT" as const,
  id: "" as string,
});

type Action =
  | ReturnType<typeof addFilesToInput>
  | ReturnType<typeof deleteFileFromInput>;
type State = FileWithUrl[];

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

// type TogglePersonnelDayOff =
//   RouterOutputs["personnelPerformance"]["togglePersonnelDayOff"][number];
const FileInput = forwardRef<HTMLInputElement, InputProps>(
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

    const [dragActive, setDragActive] = useState<boolean>(false);
    const [excelFile, setExcelFile] = useState(undefined);
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
            toast("Invalid file type", {
              description: "Please upload a valid file type.",
            });
            return;
          }

          const { name, size } = e.target.files[0];
          setExcelFile(e.target.files[0]);

          addFilesToState([
            { file: e.target.files[0], name, size, id: generateUUID() },
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
          toast("Invalid file type", {
            description: "Only xlsx,csv files are allowed.",
          });
        }

        setDragActive(false);

        setExcelFile(files[0]);

        // at least one file has been selected
        addFilesToState(
          files.map((file) => {
            return {
              file: file,
              size: file.size,
              name: file.name,
              id: generateUUID(),
            };
          }),
        );

        e.dataTransfer.clearData();
      }
    };

    const onReadXLSX = async (item) => {
      const arrayBuffer = await item.file.arrayBuffer();
      const workbook = XLSX.readFile(arrayBuffer, {
        type: "buffer",
      });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];

      const data: any = XLSX.utils.sheet_to_json(worksheet);
      for (const item of data) {
        await togglePersonnelDayOff.mutateAsync({
          cityName: item.cityName,
          date: item.date,
          nameFamily: item.nameFamily,
          nationalCode: item.nationalCode,
        });
      }
    };
    return (
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
            />
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
                  accept="*.xlsx, *.csv"
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
                        <td className="flex justify-center gap-2 whitespace-nowrap p-2 text-center text-sm text-primary ">
                          <Button
                            type="submit"
                            className="bg-accent/10 text-accent"
                            onClick={() => {
                              onReadXLSX(file);
                            }}
                          >
                            {togglePersonnelDayOff.isLoading && (
                              <ThreeDotsWave />
                            )}
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
                      accept="*.xlsx, *.csv"
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
    );
  },
);
FileInput.displayName = "FileInput";
export { FileInput };
