import Image from 'next/image';

export default function GoogleIcon({ className }: {
  className: string
}) {
  return (
    <Image
      src="https://thesvg.org/icons/google/default.svg"
      alt="Google"
      width={24}
      height={24}
    />
  );
}