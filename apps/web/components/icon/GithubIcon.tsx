import Image from 'next/image';

export default function GithubIcon({ className }: {
  className: string
}) {
  return (
    <Image
      src="https://thesvg.org/icons/github/mono.svg"
      className={className}
      alt="GitHub"
      width={24}
      height={24}
    />
  );
}