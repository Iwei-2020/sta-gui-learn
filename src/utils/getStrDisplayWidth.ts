export const getStrDisplayWidth = (str: string, fontSize: number) => {
  if (!str) {
    return 0;
  }
  const numberFontSize = Math.ceil(fontSize / 1.8);

  const numberEnums = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    "<",
    ",",
    ".",
    ">",
    "/",
    "?",
    ";",
    ":",
    "'",
    '"',
    "[",
    "{",
    "]",
    "}",
    "-",
    "_",
    "=",
    "+",
    "\\",
    "|",
    "`",
    "~",
    "!",
    "@",
    "#",
    "$",
    "%",
    "^",
    "&",
    "*",
    "(",
    ")",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];
  // 1px offset
  let width = 2;
  for (let i = 0; i < str.length; i++) {
    if (numberEnums.includes(str[i])) {
      width += numberFontSize;
    } else {
      width += fontSize;
    }
  }
  return width;
};
