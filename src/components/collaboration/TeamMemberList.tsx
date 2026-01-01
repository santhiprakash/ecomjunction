import { useState, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageContext } from '@/contexts/PageContext';
import { AuthContext } from '@/contexts/AuthContext';
import { Users, UserPlus, Mail, Clock, CheckCircle2 } from 'lucide-react';
import CollaboratorCard from './CollaboratorCard';
import InviteMemberModal from './InviteMemberModal';
import TeamLimitBanner from './TeamLimitBanner';
import { toast } from 'sonner';

interface TeamMemberListProps {
  pageId: string;
  showInvitations?: boolean;
}

export default function TeamMemberList({ pageId, showInvitations = true }: TeamMemberListProps) {
  const { user } = useContext(AuthContext);
  const {
    getCollaborators,
    getPendingInvitations,
    getUserRole,
    canInviteMembers,
    updateMemberRole,
    removeMember,
    cancelInvitation,
  } = useContext(PageContext);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'pending'>('members');

  const collaborators = getCollaborators(pageId);
  const pendingInvitations = showInvitations ? getPendingInvitations(pageId) : [];
  const userRole = getUserRole(pageId);
  const canInvite = canInviteMembers(pageId);

  const handleRoleChange = async (collaboratorId: string, newRole: any) => {
    try {
      await updateMemberRole(pageId, collaboratorId, newRole);
      toast.success('Role updated successfully');
    } catch (error) {
      throw error; // Propagate to CollaboratorCard
    }
  };

  const handleRemoveMember = async (collaboratorId: string) => {
    try {
      await removeMember(pageId, collaboratorId);
      toast.success('Member removed successfully');
    } catch (error) {
      throw error; // Propagate to CollaboratorCard
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitation(invitationId);
      toast.success('Invitation cancelled');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel invitation');
    }
  };

  if (!userRole) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            You do not have access to this page's team.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Limit Banner */}
      <TeamLimitBanner pageId={pageId} />

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage collaborators and their roles for this page
              </CardDescription>
            </div>
            {canInvite && (
              <Button onClick={() => setInviteModalOpen(true)} size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Tabs for Members and Pending Invitations */}
          {showInvitations && pendingInvitations.length > 0 ? (
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="members" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Active Members
                  <Badge variant="secondary" className="ml-1">
                    {collaborators.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending
                  <Badge variant="secondary" className="ml-1">
                    {pendingInvitations.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* Active Members Tab */}
              <TabsContent value="members" className="mt-0">
                <MembersList
                  collaborators={collaborators}
                  pageId={pageId}
                  userRole={userRole}
                  onRoleChange={handleRoleChange}
                  onRemove={handleRemoveMember}
                />
              </TabsContent>

              {/* Pending Invitations Tab */}
              <TabsContent value="pending" className="mt-0">
                <PendingInvitationsList
                  invitations={pendingInvitations}
                  onCancel={handleCancelInvitation}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <MembersList
              collaborators={collaborators}
              pageId={pageId}
              userRole={userRole}
              onRoleChange={handleRoleChange}
              onRemove={handleRemoveMember}
            />
          )}
        </CardContent>
      </Card>

      {/* Invite Member Modal */}
      <InviteMemberModal
        pageId={pageId}
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        onSuccess={() => setActiveTab('pending')}
      />
    </div>
  );
}

// Sub-component: Active Members List
function MembersList({
  collaborators,
  pageId,
  userRole,
  onRoleChange,
  onRemove,
}: any) {
  if (collaborators.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">No team members yet</p>
      </div>
    );
  }

  // Sort: owner first, then by role, then by name
  const sortedCollaborators = [...collaborators].sort((a, b) => {
    const roleOrder = { owner: 0, admin: 1, editor: 2, viewer: 3 };
    if (a.role !== b.role) {
      return roleOrder[a.role] - roleOrder[b.role];
    }
    return (a.user?.name || '').localeCompare(b.user?.name || '');
  });

  return (
    <div className="space-y-3">
      {sortedCollaborators.map((collaborator) => (
        <CollaboratorCard
          key={collaborator.id}
          collaborator={collaborator}
          pageId={pageId}
          currentUserRole={userRole}
          onRoleChange={onRoleChange}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

// Sub-component: Pending Invitations List
function PendingInvitationsList({ invitations, onCancel }: any) {
  if (invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">No pending invitations</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invitations.map((invitation: any) => (
        <Card key={invitation.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{invitation.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {invitation.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Invited {new Date(invitation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(invitation.id)}
                className="text-destructive hover:text-destructive"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
