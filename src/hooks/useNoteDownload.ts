import { msg } from "../utils";

export const handleDownload = (
  copyText: string,
  contentType: string = "text/csv",
  fileType: string = "csv"
) => {
  const today = new Date();
  const fontmatedToday = today.toISOString().slice(0, 10).replace(/-/g, "");

  const filename = `export_${msg("app_name")}_${fontmatedToday}.${fileType}`;
  const content = copyText;

  var blob = new Blob([content], { type: contentType });

  const element = document.createElement("a");
  element.href = URL.createObjectURL(blob);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
};

export const useNoteDownload = () => {
  return {
    handleDownload,
  };
};
