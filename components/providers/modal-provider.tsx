"use Client"

import { CreateServerModal } from "../modals/create-server-modal";
import { EditServerModal } from "../modals/edit-server-modal";
import { InviteModal } from "../modals/invite-modal";

export const ModalProvider = () => {
  return (
    <>
      <CreateServerModal />
      <InviteModal />
      <EditServerModal />
    </>
  )
}