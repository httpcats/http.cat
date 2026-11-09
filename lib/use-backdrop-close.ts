// Closes a modal <dialog> on a click on its backdrop, for the settings window
// and the command line (specs/0006-keyboard-navigation). The dialogs have no
// padding, so a click on the <dialog> itself (not its content) is a click on
// the backdrop. The press has to start there too: a drag that starts inside
// (e.g. selecting text in a field) and ends on the backdrop fires its click
// on the <dialog>, and mustn't close it.

import { RefObject, useRef } from 'react';

export function useBackdropClose(dialog: RefObject<HTMLDialogElement | null>) {
  const pressedOnBackdrop = useRef(false);

  return {
    onPointerDown: (event: React.PointerEvent<HTMLDialogElement>) => {
      pressedOnBackdrop.current = event.target === event.currentTarget;
    },
    onClick: (event: React.MouseEvent<HTMLDialogElement>) => {
      if (pressedOnBackdrop.current && event.target === event.currentTarget) {
        dialog.current?.close();
      }
    },
  };
}
