import clsx from "clsx";
import { H4 } from "../../util/typography";

interface RadioInputButtonProps {
  title?: string;
  state: string;
  value: string;
  className?: string;
  handlerFunction: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function RadioInputButton({
  title,
  state,
  className,
  handlerFunction,
  ...inputProps
}: RadioInputButtonProps & JSX.IntrinsicElements["input"]) {
  return (
    <label
      htmlFor={inputProps.id}
      className={clsx(
        "flex flex-row space-x-2 rounded-lg border border-button-outline border-opacity-40 px-3 py-1 shadow-lg",
        {
          "text-2 rounded-full bg-button-primary px-2 py-1  text-white  ring-4   ring-button-outline":
            state === inputProps.value,
        },
        className
      )}
    >
      <H4 className="capitalize">{title}</H4>
      <input
        {...inputProps}
        className="sr-only bg-red-200"
        onChange={handlerFunction}
      />
    </label>
  );
}
export { RadioInputButton };
