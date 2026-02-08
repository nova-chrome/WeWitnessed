import { useCallback, useState } from "react";

import { tryCatch } from "~/utils/try-catch";

function oldSchoolCopy(text: string) {
  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = text;
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextArea);
}

export function useCopyToClipboard() {
  const [state, setState] = useState<string | null>(null);

  const copyToClipboard = useCallback((value: string) => {
    const handleCopy = async () => {
      if (!navigator?.clipboard?.writeText) {
        oldSchoolCopy(value);
        setState(value);
        return;
      }

      const { error } = await tryCatch(
        navigator.clipboard.writeText(value),
      );

      if (error) {
        oldSchoolCopy(value);
      }

      setState(value);
    };

    handleCopy();
  }, []);

  return [state, copyToClipboard] as const;
}
