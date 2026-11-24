export type ApplicationIdentity = {
  userId: string;
  email: string;
  provider: "development" | "provider";
  providerSubject: string;
};

export interface IdentityProvider {
  getIdentity(): Promise<ApplicationIdentity | null>;
}
