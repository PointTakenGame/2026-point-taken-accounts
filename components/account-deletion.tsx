"use client";

import { useRef } from "react";

export function AccountDeletion() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  function openDialog() {
    dialogRef.current?.showModal();
    requestAnimationFrame(() => cancelRef.current?.focus());
  }

  return (
    <div className="account-deletion">
      <button
        className="delete-account-link"
        type="button"
        onClick={openDialog}
      >
        Delete my account
      </button>

      <dialog
        className="delete-account-dialog"
        ref={dialogRef}
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-description"
      >
        <form method="dialog">
          <button
            className="dialog-close"
            type="submit"
            aria-label="Close account deletion confirmation"
          >
            ×
          </button>
        </form>
        <h2 id="delete-account-title">Delete your account?</h2>
        <p id="delete-account-description">
          This permanently removes your sign-in and email, signs you out of
          Brain and Heart, and cannot be undone. Your past game contributions
          will remain without your identity. If you return, you&apos;ll start
          with a new account.
        </p>
        <div className="delete-account-actions">
          <form method="dialog">
            <button className="button secondary" ref={cancelRef} type="submit">
              Cancel
            </button>
          </form>
          <form action="/api/account/delete" method="post">
            <button className="button destructive" type="submit">
              Delete my account
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
}
