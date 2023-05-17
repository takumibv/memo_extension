import React, { HTMLAttributes, memo, useCallback, useEffect, useState } from "react";

interface Props extends HTMLAttributes<HTMLInputElement> {
  valueNum: number;
  onChangeNumber: (value: number) => void;
}

const NumberInput = memo<Props>(({ valueNum, onChangeNumber, ...props }) => {
  const [inputValue, setInputValue] = useState<string>(`${valueNum}`);

  useEffect(() => {
    setInputValue(`${valueNum}`);
  }, [valueNum]);

  const onChangeInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    [setInputValue]
  );

  const onKeyDownInput = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onEnter();
      }
    },
    [valueNum, inputValue, setInputValue, onChangeNumber]
  );

  const onEnter = useCallback(() => {
    const inputNum = Number(inputValue);
    if (!isNaN(inputNum)) onChangeNumber(inputNum);

    setInputValue(`${valueNum}`);
  }, [inputValue, setInputValue, onChangeNumber]);

  return (
    <input
      type="text"
      value={inputValue}
      onChange={onChangeInput}
      onKeyDown={onKeyDownInput}
      onBlur={onEnter}
      {...props}
    />
  );
});

export default NumberInput;
