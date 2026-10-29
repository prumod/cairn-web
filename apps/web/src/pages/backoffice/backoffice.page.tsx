import { useServerFn } from "@tanstack/react-start";
import { AccessManager } from "./components/accessManager";
import { changeAccess } from "./useCases/changeAccess/changeAccess.functions";
import { listUsers } from "./useCases/listUsers/listUsers.functions";

export function BackofficePage() {
  const listUsersFn = useServerFn(listUsers);
  const changeAccessFn = useServerFn(changeAccess);

  return <AccessManager listUsers={listUsersFn} changeAccess={changeAccessFn} />;
}
