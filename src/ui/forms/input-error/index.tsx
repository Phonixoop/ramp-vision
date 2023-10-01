export default function InputError({ message = "" }) {
  return (
    <>
      <div
        className={`${
          message.length > 0 ? "scale-100" : "scale-0"
        } h-3 origin-right py-2 text-right text-sm text-red-500 transition-transform`}
      >
        {message}
      </div>
    </>
  );
}
