import { UUID } from ".";

export type Authorization = {
  userId: UUID;
  role: string;
  permissions: string[];
};

export type TokenJSON = {
  id: UUID;
  app_metadata: {
    authorization: Authorization;
  };
};

export type Access = {
  access?: Authorization;
};

export const isTokenJSON = (obj: unknown): obj is TokenJSON => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    typeof (obj as any).id === "string" &&
    "app_metadata" in obj &&
    typeof (obj as any).app_metadata === "object" &&
    (obj as any).app_metadata !== null &&
    "authorization" in (obj as any).app_metadata &&
    typeof (obj as any).app_metadata.authorization === "object" &&
    (obj as any).app_metadata.authorization !== null &&
    "userId" in (obj as any).app_metadata.authorization &&
    typeof (obj as any).app_metadata.authorization.userId === "string" &&
    "role" in (obj as any).app_metadata.authorization &&
    typeof (obj as any).app_metadata.authorization.role === "string" &&
    "permissions" in (obj as any).app_metadata.authorization &&
    Array.isArray((obj as any).app_metadata.authorization.permissions) &&
    (obj as any).app_metadata.authorization.permissions.every(
      (perm: any) => typeof perm === "string",
    )
  );
};
