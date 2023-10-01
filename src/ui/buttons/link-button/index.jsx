import Link from "next/link";
import Button from "ui/buttons";
export default function LinkButton({ children, href = "", ...rest }) {
  return (
    <>
      <Link href={href} passHref>
        <a>
          <Button {...rest}>{children}</Button>
        </a>
      </Link>
    </>
  );
}
