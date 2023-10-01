import SearchIcon from "ui/icons/searchs";

export default function SearchField({
  value = "",
  title = "",
  onChange = () => {},
}) {
  return (
    <div dir="rtl" className="flex w-full rounded-xl bg-gray-50/80">
      <div className="flex flex-row-reverse w-full gap-3 justify-end items-center  px-4 py-3 caret-atysa-secondry  rounded-2xl md:flex-grow ">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full outline-none bg-transparent text-right placeholder-gray-400"
          placeholder={title}
        />
        <span className="w-[1px] h-4 bg-gray-400"></span>
        <SearchIcon className="w-4 h-4 fill-gray-400" />
      </div>
    </div>
  );
}
