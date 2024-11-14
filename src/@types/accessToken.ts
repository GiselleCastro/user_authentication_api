import { UUID } from ".";

export type Authorization = {
  id: UUID;
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
