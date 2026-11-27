import { InvitationAcceptance } from "@/components/workspaces/invitation-acceptance";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function AcceptInvitationPage({ searchParams }: Props) {
  const { token } = await searchParams;
  return <InvitationAcceptance token={token ?? ""} />;
}
