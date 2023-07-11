import * as React from "react";
import clsx from "clsx";

export const SecondaryTitle = ({ title }: { title: string }) => {
  return <h2 className="py-3 text-lg font-semibold">{title}</h2>;
};

const Sizes = {
  "3xl": "text-3xl",
  "2xl": "text-2xl",
  xs: "text-xs ",
  sm: "text-sm xs:text-xs",
  md: "text-base xs:text-sm",
  lg: "text-lg xs:text-base",
  basic: "text-md xs:text-sm",
};

export const MainTitle = ({
  title,
  size,
  className,
}: {
  title: string;
  size: string;
  className?: string;
}) => {
  return (
    <h1 className={` ${Sizes[size]} ${className} dark:mainTextDark`}>
      {title}
    </h1>
  );
};

export type ParagraphProps = {
  className?: string;
  prose?: boolean;
  textColorClassName?: string;
  as?: React.ElementType;
} & (
  | { children: React.ReactNode }
  | { dangerouslySetInnerHTML: { __html: string } }
);

export function Paragraph({
  className,
  prose = true,
  as = "p",
  textColorClassName = "text-secondary",
  ...rest
}: ParagraphProps) {
  return React.createElement(as, {
    className: clsx("max-w-full text-lg", textColorClassName, className, {
      "prose prose-light dark:mainTextDark": prose,
    }),
    ...rest,
  });
}

type TitleProps = {
  variant?:
    | "primary"
    | "secondary"
    | "bold"
    | "button"
    | "bolder"
    | "semibold"
    | "error";
  boldVariant?:
    | "extralight"
    | "light"
    | "normal"
    | "medium"
    | "semibold"
    | "bold"
    | "bolder";

  as?: React.ElementType;
  className?: string;
  id?: string;
  htmlFor?: "string";
} & (
  | { children: React.ReactNode }
  | {
      dangerouslySetInnerHTML: {
        __html: string;
      };
    }
);

const fontSize = {
  h1: "leading-tight font-normal text-2xl md:text-2xl",
  h2: "leading-tight font-normal text-xl md:text-xl",
  h3: "text-lg  sm:text-base",
  h4: "text-base sm:text-sm",
  h5: "text-sm sm:text-xs",
  h6: "text-xs sm:text-[10px]",
};

const titleColors = {
  primary: "text-principal dark:text-mainTextDark ",
  secondary: "text-principal dark:text-button-textNotSelected ",
  semibold: "font-semibold dark:text-mainTextDark ",
  bold: "font-bold ",
  bolder: "font-extrabold",
  button: "text-white dark:text-mainTextDark font-medium",
  error: "text-warning",
};

const bolding = {
  extralight: "font-extraLight",
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  bolder: "font-extrabold",
};

function Title({
  variant = "primary",
  boldVariant = "normal",
  size,
  as,
  className,
  htmlFor,
  ...rest
}: TitleProps & { size: keyof typeof fontSize }) {
  const Tag = as ?? size;
  return (
    <Tag
      htmlFor={htmlFor}
      className={clsx(
        fontSize[size],
        bolding[boldVariant],
        titleColors[variant],
        className
      )}
      {...rest}
    />
  );
}

export function H1(props: TitleProps) {
  return <Title {...props} size="h1" />;
}

export function H2(props: TitleProps) {
  return <Title {...props} size="h2" />;
}

export function H3(props: TitleProps) {
  return <Title {...props} size="h3" />;
}

export function H4(props: TitleProps) {
  return <Title {...props} size="h4" />;
}

export function H5(props: TitleProps) {
  return <Title {...props} size="h5" />;
}
export function H6(props: TitleProps) {
  return <Title {...props} size="h6" />;
}
